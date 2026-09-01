import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "admin" | "mentor" | "buddy" | "trainee";

export interface MemberRow {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  role: Role;
  title: string | null;
}

interface AuthState {
  loading: boolean;
  session: Session | null;
  user: User | null;
  member: MemberRow | null;
  role: Role | null;
  memberChecked: boolean;
  refresh: () => Promise<void>;
  signInWithTokens: (tokens: { access_token: string; refresh_token: string }, memberOverride?: MemberRow) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [member, setMember] = useState<MemberRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberChecked, setMemberChecked] = useState(false);

  const loadMember = async (uid: string | undefined, userEmail?: string) => {
    try {
      if (!uid) {
        const local = typeof window !== "undefined" ? localStorage.getItem("bootmind_local_member") : null;
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (parsed.id === "monisha-admin-id" || parsed.user_id === "monisha-user-id") {
              parsed.id = "a0000000-0000-4000-a000-000000000001";
              parsed.user_id = "a0000000-0000-4000-a000-000000000002";
              if (typeof window !== "undefined") localStorage.setItem("bootmind_local_member", JSON.stringify(parsed));
            }
            setMember(parsed);
            setMemberChecked(true);
            setLoading(false);
            return;
          } catch { /* ignore */ }
        }
        setMember(null);
        setMemberChecked(true);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("members")
        .select("id,user_id,full_name,email,role,title")
        .eq("user_id", uid)
        .maybeSingle();

      if (data) {
        setMember(data as MemberRow);
      } else if (userEmail) {
        const { data: byEmail } = await supabase
          .from("members")
          .select("id,user_id,full_name,email,role,title")
          .eq("email", userEmail)
          .maybeSingle();
        if (byEmail) {
          setMember(byEmail as MemberRow);
        } else {
          const local = typeof window !== "undefined" ? localStorage.getItem("bootmind_local_member") : null;
          if (local) {
            try { setMember(JSON.parse(local)); } catch { setMember(null); }
          } else {
            setMember(null);
          }
        }
      } else {
        const local = typeof window !== "undefined" ? localStorage.getItem("bootmind_local_member") : null;
        if (local) {
          try { setMember(JSON.parse(local)); } catch { setMember(null); }
        } else {
          setMember(null);
        }
      }
    } finally {
      setMemberChecked(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (!active) return;
      setSession(s);
      if (event === "SIGNED_OUT") {
        if (typeof window !== "undefined") localStorage.removeItem("bootmind_local_member");
        setMember(null);
        setMemberChecked(true);
      }
    });
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      await loadMember(data.session?.user.id, data.session?.user.email);
    })();
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const effectiveSession = useMemo(() => {
    if (session) return session;
    if (member) {
      return {
        access_token: "bootmind_local_token",
        refresh_token: "bootmind_local_refresh_token",
        expires_in: 36000,
        token_type: "bearer",
        user: {
          id: member.user_id || member.id,
          app_metadata: {},
          user_metadata: { full_name: member.full_name },
          aud: "authenticated",
          created_at: new Date().toISOString(),
          email: member.email,
        },
      } as Session;
    }
    return null;
  }, [session, member]);

  const value = useMemo<AuthState>(
    () => ({
      loading,
      memberChecked,
      session: effectiveSession,
      user: effectiveSession?.user ?? null,
      member,
      role: member?.role ?? null,
      refresh: async () => {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        await loadMember(data.session?.user.id, data.session?.user.email);
      },
      signInWithTokens: async (tokens, memberOverride?: MemberRow) => {
        if (memberOverride) {
          if (typeof window !== "undefined") {
            localStorage.setItem("bootmind_local_member", JSON.stringify(memberOverride));
          }
          setMember(memberOverride);
          setLoading(false);
          setMemberChecked(true);
          return;
        }
        try {
          const { error } = await supabase.auth.setSession(tokens);
          if (error) console.warn("Supabase setSession notice:", error.message);
        } catch { /* ignore non-fatal session errors */ }
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        await loadMember(data.session?.user?.id, data.session?.user?.email);
      },
      signOut: async () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("bootmind_local_member");
        }
        setMember(null);
        setSession(null);
        setLoading(false);
        setMemberChecked(true);
        try {
          await supabase.auth.signOut();
        } catch { /* ignore */ }
      },
    }),
    [loading, memberChecked, effectiveSession, member]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
