import { useRouter } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
// Define user type
type User = {
  id: string;
  email: string;
} | null;

// Define the shape of AuthContext
type AuthContextType = {
  user: User;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);
const router = useRouter();
// Provider component: wraps the entire App to provide global auth state
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Step 5 - check for existing session
    // For now, default to not logged in
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // TODO: Step 3 - replace with real Supabase sign in
    // Temporarily simulate a successful login with mock data
    setUser({ id: "temp-id", email });
  };

  const signOut = async () => {
    // TODO: Step 7 - replace with real Supabase sign out
    setUser(null);
    router.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook: easily access auth state from any screen
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}