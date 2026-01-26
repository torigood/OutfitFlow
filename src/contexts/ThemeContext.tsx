import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  lightColors,
  darkColors,
  shadows,
  darkShadows,
  ThemeColors,
  ThemeMode,
} from "../theme/colors";

const THEME_STORAGE_KEY = "@outfitflow_theme";

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  shadows: typeof shadows;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [isLoaded, setIsLoaded] = useState(false);

  // 저장된 테마 설정 불러오기
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
          setThemeState(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.error("Failed to load theme:", error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  // 테마 변경 시 저장
  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  };

  // 실제 적용될 다크 모드 여부 계산
  const isDark = useMemo(() => {
    if (theme === "system") {
      return systemColorScheme === "dark";
    }
    return theme === "dark";
  }, [theme, systemColorScheme]);

  // 현재 테마에 맞는 색상과 그림자
  const currentColors = useMemo(() => {
    return isDark ? darkColors : lightColors;
  }, [isDark]);

  const currentShadows = useMemo(() => {
    return isDark ? darkShadows : shadows;
  }, [isDark]);

  const value = useMemo(
    () => ({
      theme,
      isDark,
      colors: currentColors,
      shadows: currentShadows,
      setTheme,
    }),
    [theme, isDark, currentColors, currentShadows]
  );

  // 테마 로드 전에는 기본 라이트 테마 사용
  if (!isLoaded) {
    return (
      <ThemeContext.Provider
        value={{
          theme: "system",
          isDark: false,
          colors: lightColors,
          shadows,
          setTheme: () => {},
        }}
      >
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;
