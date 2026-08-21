import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/_core/hooks/useAuth";
import { LogOut, LayoutDashboard, ClipboardList, ChevronRight } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: ClipboardList, label: "Workflows", path: "/" },
];

const SIGN_IN_ATTEMPT_TIMEOUT_MS = 30000;

export async function signInWithPasswordRetry(signIn: () => Promise<{ error: { message: string } | null }>) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const signInPromise = signIn();
      void signInPromise.catch(() => undefined);
      return await Promise.race([
        signInPromise,
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error("Sign in timed out. Check the production connection and try again.")), SIGN_IN_ATTEMPT_TIMEOUT_MS);
        }),
      ]);
    } catch (error) {
      lastError = error;
      if (attempt === 1) throw error;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Sign in failed. Check the production connection and try again.");
}

export function SupabaseLoginScreen({ onSignedIn }: { onSignedIn?: () => Promise<unknown> | unknown }) {
  const [email, setEmail] = useState("swammarn30@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const client = supabase;
    if (!client) { setError("Supabase Auth is not configured."); return; }
    setPending(true); setError(null);
    try {
      const result = await signInWithPasswordRetry(() => client.auth.signInWithPassword({ email, password }));
      if (result.error) setError(result.error.message);
      else {
        const { data } = await client.auth.getSession();
        if (!data.session?.access_token) setError("Sign in succeeded but the session was not persisted. Please try again.");
        else {
          window.dispatchEvent(new Event("supabase-auth-signed-in"));
          window.location.reload();
        }
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign in failed. Check the production connection and try again.");
    } finally { setPending(false); }
  }

  return <div className="flex min-h-screen items-center justify-center bg-[#f4f5f7] p-4"><form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_18px_60px_rgba(15,23,42,0.12)]"><div className="mb-6 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b1220] text-lg font-black text-amber-300">B</span><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-600">Bakery ERP</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Sign in to continue</h1></div></div><p className="mb-5 text-sm text-slate-500">Use your Supabase email and password account.</p><div className="grid gap-4"><label className="grid gap-2 text-sm font-medium text-slate-700">Email<input type="email" value={email} onChange={event => setEmail(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100" required /></label><label className="grid gap-2 text-sm font-medium text-slate-700">Password<input type="password" value={password} onChange={event => setPassword(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100" required /></label>{error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button type="submit" size="lg" className="h-11 rounded-xl bg-[#0b1220] hover:bg-[#18243a]" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</Button></div></form></div>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user, refresh } = useAuth();
  if (loading) return <DashboardLayoutSkeleton />;
  if (!user) return <SupabaseLoginScreen onSignedIn={refresh} />;
  return <DashboardLayoutContent>{children}</DashboardLayoutContent>;
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const activeMenuItem = menuItems.find(item => item.path === location);

  return <div className="min-h-screen bg-[#f4f5f7] text-slate-900"><header className="bg-[#0b1220] text-white shadow-lg"><div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8"><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-300 text-sm font-black text-slate-950">B</span><div className="min-w-0"><p className="truncate text-sm font-semibold tracking-tight">Bakery ERP</p><p className="truncate text-[10px] uppercase tracking-[0.18em] text-slate-400">Operational control</p></div></div><div className="flex items-center gap-3"><span className="hidden text-right text-xs text-slate-300 sm:block"><span className="block font-medium text-white">{user?.name || "Admin"}</span><span>{user?.role === "admin" ? "Administrator" : "Operator"}</span></span><DropdownMenu><DropdownMenuTrigger asChild><button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 outline-none ring-offset-2 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-amber-300"><Avatar className="h-8 w-8"><AvatarFallback className="bg-amber-300 text-xs font-bold text-slate-950">{user?.name?.charAt(0).toUpperCase() || "A"}</AvatarFallback></Avatar></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-44"><DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive"><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></div></header><div className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-[1600px] items-center gap-2 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">{menuItems.map(({ icon: Icon, label, path }) => <button key={`${label}-${path}`} onClick={() => setLocation(path)} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${location === path ? "bg-[#0b1220] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}><Icon className="h-4 w-4" />{label}</button>)}<ChevronRight className="ml-auto hidden h-4 w-4 shrink-0 text-slate-300 sm:block" /></div></div><main className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">{activeMenuItem && <div className="mb-4 flex items-center gap-2 text-xs text-slate-500"><span>Bakery ERP</span><ChevronRight className="h-3.5 w-3.5" /><span className="font-medium text-slate-900">{activeMenuItem.label}</span></div>}{children}</main></div>;
}
