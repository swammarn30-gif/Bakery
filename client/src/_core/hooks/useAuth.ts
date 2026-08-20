import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const utils = trpc.useUtils();
  const [sessionReady, setSessionReady] = useState(!supabase);
  const meQuery = trpc.auth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => utils.auth.me.setData(undefined, null),
  });

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().finally(() => mounted && setSessionReady(true));
    const { data } = supabase.auth.onAuthStateChange(() => {
      void utils.auth.me.invalidate();
    });
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [utils]);

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
    loading: !sessionReady || meQuery.isLoading || logoutMutation.isPending,
    error: meQuery.error ?? logoutMutation.error ?? null,
    isAuthenticated: Boolean(meQuery.data),
  }), [meQuery.data, meQuery.error, meQuery.isLoading, logoutMutation.error, logoutMutation.isPending, sessionReady]);

  useEffect(() => {
    if (!redirectOnUnauthenticated || state.loading || state.user || typeof window === "undefined") return;
    if (redirectPath && window.location.pathname === redirectPath) return;
    window.dispatchEvent(new Event("supabase-auth-required"));
  }, [redirectOnUnauthenticated, redirectPath, state.loading, state.user]);

  return { ...state, refresh: () => meQuery.refetch(), logout };
}
