import React, { createContext, useState, useEffect, useContext } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { checkRememberMe, signOut } from "../services/authService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Firebase Auth 상태 변화 감지
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth 상태 변경:", currentUser ? `로그인됨 (${currentUser.email})` : "로그아웃됨");

      // 앱 초기 로딩 시에만 로그인 유지 여부 체크
      if (isInitialLoad && currentUser) {
        const rememberMe = await checkRememberMe();
        if (!rememberMe) {
          console.log("로그인 유지 비활성화 - 자동 로그아웃");
          await signOut();
          setUser(null);
          setLoading(false);
          setIsInitialLoad(false);
          return;
        }
      }

      setUser(currentUser);
      setLoading(false);
      setIsInitialLoad(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
