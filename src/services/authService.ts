import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  User,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GOOGLE_WEB_CLIENT_ID } from '@env';

const REMEMBER_ME_KEY = "@outfitflow_remember_me";

// ============================================================
// 1. 구글 로그인 설정 (Native 방식)
// ============================================================
GoogleSignin.configure({
  // ⚠️ 중요: 여기에 Google Cloud Console의 "웹 클라이언트 ID"를 넣으세요!
  // iosClientId는 app.json 설정으로 자동 처리되므로 안 넣어도 됩니다.
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
});

/**
 * 이메일/비밀번호로 회원가입
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await AsyncStorage.setItem(REMEMBER_ME_KEY, rememberMe.toString());
    return userCredential.user;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Google 계정으로 로그인 (Native 방식)
 */
export const signInWithGoogle = async (
  rememberMe: boolean = true
): Promise<User> => {
  try {
    // 1. Play Services 확인 (Android 필수, iOS는 통과)
    await GoogleSignin.hasPlayServices();

    // 2. 로그인 시도 (여기서 iOS 시스템 팝업이 뜹니다!)
    const userInfo = await GoogleSignin.signIn();
    
    // 3. 토큰 추출
    const idToken = (userInfo as any).data?.idToken || (userInfo as any).idToken;
    
    if (!idToken) {
      throw new Error("Google ID Token이 없습니다.");
    }

    // 4. Firebase 자격 증명 생성
    const googleCredential = GoogleAuthProvider.credential(idToken);

    // 5. Firebase 로그인
    const userCredential = await signInWithCredential(auth, googleCredential);

    await AsyncStorage.setItem(REMEMBER_ME_KEY, rememberMe.toString());
    return userCredential.user;

  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new Error("로그인이 취소되었습니다.");
    } else if (error.code === statusCodes.IN_PROGRESS) {
      throw new Error("이미 로그인이 진행 중입니다.");
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error("Google Play 서비스를 사용할 수 없습니다.");
    } else {
      console.error("Google Sign-In Error:", error);
      throw new Error("Google 로그인 실패: " + (error.message || "알 수 없는 오류"));
    }
  }
};

/**
 * 로그아웃
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    try {
      await GoogleSignin.signOut(); // 구글 세션도 로그아웃
    } catch (e) {
      // 구글 로그아웃 실패는 무시 (이미 로그아웃 상태일 수 있음)
    }
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
    case "auth/email-already-in-use": return "이미 사용 중인 이메일입니다.";
    case "auth/invalid-email": return "유효하지 않은 이메일 주소입니다.";
    case "auth/operation-not-allowed": return "이메일/비밀번호 로그인이 비활성화되어 있습니다.";
    case "auth/weak-password": return "비밀번호는 최소 6자 이상이어야 합니다.";
    case "auth/user-disabled": return "비활성화된 계정입니다.";
    case "auth/user-not-found": return "존재하지 않는 계정입니다.";
    case "auth/wrong-password": return "잘못된 비밀번호입니다.";
    case "auth/invalid-credential": return "이메일 또는 비밀번호가 올바르지 않습니다.";
    default: return "인증 오류가 발생했습니다. 다시 시도해주세요.";
  }
};