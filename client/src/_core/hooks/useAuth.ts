import { trpc } from "@/lib/trpc";
import { getPersistedSupabaseAccessToken, supabase } from "@/lib/supabase";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const utils = trpc.useUtils();
  const hasPersistedSession = Boolean(getPersistedSupabaseAccessToken());
  const [sessionReady, setSessionReady] = useState(() => !supabase || hasPersistedSession);
  const meQuery = trpc.auth.me.useQuery(undefined, { enabled: sessionReady, retry: false, refetchOnWindowFocus: false, refetchOnMount: "always" });
  const meRefetch = meQuery.refetch;
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => utils.auth.me.setData(undefined, null),
  });

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    const sessionWithTimeout = Promise.race([
      supabase.auth.getSession(),
      new Promise<{ data: { session: null } }>(resolve => window.setTimeout(() => resolve({ data: { session: null } }), 5000)),
    ]);
    sessionWithTimeout.then(({ data }) => {
      if (mounted) setSessionReady(true);
      if (mounted && data.session?.access_token) void meRefetch();
    }).catch(() => mounted && setSessionReady(true));
    const handleSignedIn = () => {
      window.setTimeout(() => void utils.auth.me.refetch(), 250);
    };
    window.addEventListener("supabase-auth-signed-in", handleSignedIn);
    const { data } = supabase.auth.onAuthStateChange(() => {
      void utils.auth.me.invalidate();
    });
    return () => {
      mounted = false;
      window.removeEventListener("supabase-auth-signed-in", handleSignedIn);
      data.subscription.unsubscribe();
    };
  }, [meRefetch, utils]);

  const logout = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (!(error instanceof TRPCClientError) || error.data?.code !== "UNAUTHORIZED") throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => ({
    user: meQuery.data ?? null,
    loading: !sessionReady || meQuery.isLoading || logoutMutation.isPending || (hasPersistedSession && !meQuery.data && !meQuery.error),
    error: meQuery.error ?? logoutMutation.error ?? null,
    isAuthenticated: Boolean(meQuery.data),
  }), [hasPersistedSession, meQuery.data, meQuery.error, meQuery.isLoading, logoutMutation.error, logoutMutation.isPending, sessionReady]);

  useEffect(() => {
    if (!redirectOnUnauthenticated || state.loading || state.user || typeof window === "undefined") return;
    if (redirectPath && window.location.pathname === redirectPath) return;
    window.dispatchEvent(new Event("supabase-auth-required"));
  }, [redirectOnUnauthenticated, redirectPath, state.loading, state.user]);

  return { ...state, refresh: () => meQuery.refetch(), logout };
}
