import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { login as apiLogin, getMe } from "../api";

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

  const logout = () => {
    localStorage.removeItem("cs_token");
    localStorage.removeItem("cs_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
