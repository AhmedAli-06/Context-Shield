import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { login as apiLogin, getMe, register as apiRegister } from "../api";
import { supabase } from "../supabase";

interface User {
  id: string;
  email: string;
  full_name: string;
  tenant_id: string;
  is_superuser: boolean;
  roles: string[];
}

interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>(null!);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("cs_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      getMe()
        .then((r) => setUser(r.data))
        .catch(() => { setToken(null); localStorage.removeItem("cs_token"); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    const { access_token, user: u } = res.data;
    localStorage.setItem("cs_token", access_token);
    localStorage.setItem("cs_user", JSON.stringify(u));
    setToken(access_token);
    setUser(u);
  };

  const register = async (email: string, password: string, fullName: string) => {
    if (supabase) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    }
    const res = await apiRegister({ email, password, full_name: fullName });
    const { access_token, user: u } = res.data;
    localStorage.setItem("cs_token", access_token);
    localStorage.setItem("cs_user", JSON.stringify(u));
    setToken(access_token);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("cs_token");
    localStorage.removeItem("cs_user");
    setToken(null);
    setUser(null);
    if (supabase) supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
