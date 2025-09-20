import { createContext, useState, useContext, useEffect } from "react";
import type { ReactNode } from "react";

import api from "../api";

// 1. Define the shape of AuthContext
interface AuthContextType {
  user: { email?: string; token?: string } | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// 2. Create Context with default value (undefined, so we force checking in useAuth)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ email?: string; token?: string } | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("sp_token"));

  useEffect(() => {
    if (token) {
      setUser({ token }); // You could decode JWT here
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/signin", { email, password });
    const { access_token } = res.data;
    localStorage.setItem("sp_token", access_token);
    setToken(access_token);
    setUser({ email });
  };

  const signup = async (email: string, password: string) => {
    await api.post("/auth/signup", { email, password });
  };

  const logout = () => {
    localStorage.removeItem("sp_token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Custom hook with error safety
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};



// import { createContext, useState, useContext, useEffect } from "react";
// import api from "../api";
// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(localStorage.getItem("sp_token"));

//   useEffect(() => {
//     if (token) {
//       setUser({ token }); // optional: decode JWT for roles
//     }
//   }, [token]);

//   const login = async (email, password) => {
//     const res = await api.post("/auth/signin", { email, password });
//     const { access_token } = res.data;
//     localStorage.setItem("sp_token", access_token);
//     setToken(access_token);
//     setUser({ email });
//   };

//   const signup = async (email, password) => {
//     await api.post("/auth/signup", { email, password });
//   };

//   const logout = () => {
//     localStorage.removeItem("sp_token");
//     setUser(null);
//     setToken(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, signup, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);
