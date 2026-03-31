import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "./supabase";
import type { Session } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Mode = "customer" | "barber";

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  mode: Mode;
  setMode: (mode: Mode) => void;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithOtp: (email: string) => Promise<{ error: string | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setModeState] = useState<Mode>("customer");

  useEffect(() => {
    // Load saved mode
    AsyncStorage.getItem("kk-mode").then((saved) => {
      if (saved === "barber" || saved === "customer") setModeState(saved);
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  function setMode(m: Mode) {
    setModeState(m);
    AsyncStorage.setItem("kk-mode", m);
  }

  async function signInWithPassword(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    setMode("barber");
    return { error: null };
  }

  async function signInWithOtp(email: string) {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) return { error: error.message };
    return { error: null };
  }

  async function verifyOtp(email: string, token: string) {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    if (error) return { error: error.message };
    setMode("customer");
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ session, loading, mode, setMode, signInWithPassword, signInWithOtp, verifyOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
