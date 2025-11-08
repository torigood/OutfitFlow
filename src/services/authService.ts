import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  User,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { FIREBASE_WEB_CLIENT_ID, FIREBASE_API_KEY } from "@env";

const REMEMBER_ME_KEY = "@outfitflow_remember_me";

// WebBrowser 세션 완료 처리 (모바일 OAuth용)
WebBrowser.maybeCompleteAuthSession();

// OAuth 설정
const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
};

/**
 * 이메일/비밀번호로 회원가입
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // 사용자 프로필 업데이트 (이름 설정)
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: displayName,
      });
    }

    return userCredential.user;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * 이메일/비밀번호로 로그인
 */
export const signInWithEmail = async (
  email: string,
  password: string,
  rememberMe: boolean = true
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // 로그인 유지 설정 저장
    await AsyncStorage.setItem(REMEMBER_ME_KEY, rememberMe.toString());

    return userCredential.user;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Google 계정으로 로그인 (웹/모바일 모두 지원 - Expo Go 호환)
 */
export const signInWithGoogle = async (
  rememberMe: boolean = true
): Promise<User> => {
  try {
    if (Platform.OS === "web") {
      // 웹: Firebase Web SDK 사용
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      await AsyncStorage.setItem(REMEMBER_ME_KEY, rememberMe.toString());
      return userCredential.user;
    } else {
      // 모바일: Expo AuthSession 사용 (Expo Go 호환)
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: `com.outfitflow.app`,
      });

      const request = new AuthSession.AuthRequest({
        clientId: FIREBASE_WEB_CLIENT_ID,
        scopes: ["openid", "profile", "email"],
        redirectUri,
        responseType: AuthSession.ResponseType.IdToken,
        usePKCE: false,
      });

      await request.promptAsync(discovery);

      const result = await request.promptAsync(discovery);

      if (result.type === "success") {
        const { id_token } = result.params;

        if (!id_token) {
          throw new Error(
            "Google 로그인에 실패했습니다. ID Token을 가져올 수 없습니다."
          );
        }

        // Firebase credential 생성
        const googleCredential = GoogleAuthProvider.credential(id_token);

        // Firebase에 로그인
        const userCredential = await signInWithCredential(
          auth,
          googleCredential
        );

        // Google 로그인은 항상 로그인 유지
        await AsyncStorage.setItem(REMEMBER_ME_KEY, rememberMe.toString());

        return userCredential.user;
      } else {
        throw new Error("Google 로그인이 취소되었습니다.");
      }
    }
  } catch (error: any) {
    throw new Error(
      getAuthErrorMessage(error.code) || "Google 로그인에 실패했습니다."
    );
  }
};

/**
 * 로그아웃
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    // 로그인 유지 설정 초기화
    await AsyncStorage.removeItem(REMEMBER_ME_KEY);
  } catch (error: any) {
    throw new Error("로그아웃에 실패했습니다.");
  }
};

/**
 * 비밀번호 재설정 이메일 전송
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * 현재 로그인된 사용자 가져오기
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * 로그인 유지 설정 확인
 */
export const checkRememberMe = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(REMEMBER_ME_KEY);
    // 값이 없으면 true (기본적으로 로그인 유지)
    if (value === null) return true;
    return value === "true";
  } catch (error) {
    return true;
  }
};

/**
 * Firebase Auth 에러 메시지 한글화
 */
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "이미 사용 중인 이메일입니다.";
    case "auth/invalid-email":
      return "유효하지 않은 이메일 주소입니다.";
    case "auth/operation-not-allowed":
      return "이메일/비밀번호 로그인이 비활성화되어 있습니다.";
    case "auth/weak-password":
      return "비밀번호는 최소 6자 이상이어야 합니다.";
    case "auth/user-disabled":
      return "비활성화된 계정입니다.";
    case "auth/user-not-found":
      return "존재하지 않는 계정입니다.";
    case "auth/wrong-password":
      return "잘못된 비밀번호입니다.";
    case "auth/invalid-credential":
      return "이메일 또는 비밀번호가 올바르지 않습니다.";
    case "auth/too-many-requests":
      return "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.";
    case "auth/network-request-failed":
      return "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.";
    case "auth/popup-closed-by-user":
      return "로그인 창이 닫혔습니다.";
    case "auth/cancelled-popup-request":
      return "로그인 요청이 취소되었습니다.";
    default:
      return "인증 오류가 발생했습니다. 다시 시도해주세요.";
  }
};
