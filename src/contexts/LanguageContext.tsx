import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  availableLanguages,
  setI18nLanguage,
  SupportedLanguage,
} from "../localization/i18n";

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

const STORAGE_KEY = "@outfitflow_language";

const defaultLanguage = (() => {
  const lan = (Localization.getLocales()[0]?.languageTag ?? "en").slice(0, 2);
  return availableLanguages.some((l) => l.code === lan)
    ? (lan as SupportedLanguage)
    : "en";
})();

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] =
    useState<SupportedLanguage>(defaultLanguage);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    setI18nLanguage(lang);
    AsyncStorage.setItem(STORAGE_KEY, lang).catch(() => {});
  };

  useEffect(() => {
    const loadLanguage = async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      const valid = availableLanguages.find((l) => l.code === saved);
      if (valid) {
        setLanguage(valid.code);
      } else {
        setI18nLanguage(language);
      }
    };
    loadLanguage();
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
};
