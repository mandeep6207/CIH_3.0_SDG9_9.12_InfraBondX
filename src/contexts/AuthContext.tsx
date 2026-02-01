import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { apiGet } from "@/app/services/api";

export type UserRole = "investor" | "issuer" | "admin" | null;

interface User {
  id: number | string;
  name: string;
  email: string;
  role: UserRole;
  kycCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: { id: any; name: string; email: string; role: string }, token: string) => void;
  logout: () => void;
  completeKYC: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeRole(role: string): UserRole {
  const r = String(role || "").toLowerCase();
  if (r === "investor") return "investor";
  if (r === "issuer") return "issuer";
  if (r === "admin") return "admin";
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const refreshMe = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const me = await apiGet("/auth/me", token);

      if (me?.error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        return;
      }

      // ✅ preserve old kycCompleted if already stored
      const storedUser = localStorage.getItem("user");
      let storedKyc = false;
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          storedKyc = !!parsed?.kycCompleted;
        } catch {
          storedKyc = false;
        }
      }

      const updatedUser: User = {
        id: me.id,
        name: me.name,
        email: me.email,
        role: normalizeRole(me.role),
        kycCompleted: storedKyc, // ✅ don't force true
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch {
      // silent fail
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    } else if (storedToken && !storedUser) {
      refreshMe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (
    apiUser: { id: any; name: string; email: string; role: string },
    token: string
  ) => {
    const newUser: User = {
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      role: normalizeRole(apiUser.role),
      kycCompleted: false,
    };

    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const completeKYC = () => {
    if (user) {
      const updatedUser = { ...user, kycCompleted: true };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        completeKYC,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
