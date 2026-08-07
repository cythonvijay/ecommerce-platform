import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { UserOut } from "@/types/api";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/config/constants";
import { authApi } from "@/features/auth/api/authApi";
import type { LoginPayload, RegisterPayload } from "@/features/auth/types/auth.types";

interface AuthContextValue {
  user: UserOut | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (payload: LoginPayload) => Promise<UserOut>;
  register: (payload: RegisterPayload) => Promise<UserOut>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    authApi
      .getProfile()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const persistSession = (data: { access_token: string; refresh_token: string; user: UserOut }) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
    setUser(data.user);
  };

  const login = async (payload: LoginPayload) => {
    const data = await authApi.login(payload);
    persistSession(data);
    return data.user;
  };

  const register = async (payload: RegisterPayload) => {
    const data = await authApi.register(payload);
    persistSession(data);
    return data.user;
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setUser(null);
  };

  const refreshProfile = async () => {
    const profile = await authApi.getProfile();
    setUser(profile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthStore() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthStore must be used within AuthProvider");
  return ctx;
}
