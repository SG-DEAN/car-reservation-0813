"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import supabase, { getSupabase } from "@/lib/supabaseClient";

type AuthUser = {
  id: string;
  email: string | null;
  name: string | null;
  department: string | null;
  login_id?: string | null;
  role?: string | null;
};

type Ctx = {
  user: AuthUser | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Ctx>({
  user: null,
  loading: true,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const sb = getSupabase();
    const { data: { session } } = await sb.auth.getSession();
    const uid = session?.user?.id;
    if (!uid) { setUser(null); return; }

    const { data: p } = await sb
      .from("profiles")
      .select("user_id, login_id, name, email, department, role")
      .eq("user_id", uid)     // ✅ user_id 기준
      .single();

    setUser({
      id: uid,
      email: p?.email ?? session?.user?.email ?? null,
      name: p?.name ?? (session?.user?.user_metadata as any)?.name ?? null,
      department: p?.department ?? (session?.user?.user_metadata as any)?.department ?? null,
      login_id: p?.login_id ?? null,
      role: p?.role ?? null,
    });
  }, []);

  useEffect(() => {
    (async () => { setLoading(true); await fetchProfile(); setLoading(false); })();
    const { data: { subscription } } = getSupabase().auth.onAuthStateChange(async () => {
      setLoading(true); await fetchProfile(); setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const refreshProfile = useCallback(fetchProfile, [fetchProfile]);
  const signOut = useCallback(async () => { await getSupabase().auth.signOut(); setUser(null); }, []);

  return <AuthContext.Provider value={{ user, loading, refreshProfile, signOut }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
