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
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { FIREBASE_WEB_CLIENT_ID } from "@env";

// Google Sign-In 초기화 (모바일용)
if (Platform.OS !== "web") {
  GoogleSignin.configure({
    webClientId: FIREBASE_WEB_CLIENT_ID, // Firebase Console의 Web Client ID
    offlineAccess: true,
  });
}

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
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Google 계정으로 로그인 (웹/모바일 모두 지원)
 */
export const signInWithGoogle = async (): Promise<User> => {
  try {
    if (Platform.OS === "web") {
      // 웹: Firebase Web SDK 사용
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      return userCredential.user;
    } else {
      // 모바일: Google Sign-In SDK 사용
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();

      // idToken 추출
      const idToken = signInResult.data?.idToken;
      if (!idToken) {
        throw new Error("Google 로그인에 실패했습니다. ID Token을 가져올 수 없습니다.");
      }

      // Firebase credential 생성
      const googleCredential = GoogleAuthProvider.credential(idToken);

      // Firebase에 로그인
      const userCredential = await signInWithCredential(auth, googleCredential);
      return userCredential.user;
    }
  } catch (error: any) {
    console.error("Google 로그인 오류:", error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * 로그아웃
 */
export const signOut = async (): Promise<void> => {
  try {
    console.log("🔥 authService.signOut() 호출됨");
    console.log("🔥 현재 사용자:", auth.currentUser?.email);

    // Firebase 로그아웃
    console.log("🔥 Firebase signOut 실행 중...");
    await firebaseSignOut(auth);
    console.log("✅ Firebase signOut 완료");

    // 모바일에서 Google Sign-In으로 로그인한 경우 GoogleSignin도 로그아웃
    if (Platform.OS !== "web") {
      try {
        const currentUser = GoogleSignin.getCurrentUser();
        if (currentUser) {
          console.log("📱 Google Sign-In 로그아웃 실행 중...");
          await GoogleSignin.signOut();
          console.log("✅ Google Sign-In 로그아웃 완료");
        }
      } catch (googleError) {
        // Google Sign-In 로그아웃 실패해도 Firebase는 이미 로그아웃됨
        console.warn("Google Sign-In 로그아웃 실패:", googleError);
      }
    }
    console.log("✅ signOut 함수 완료");
  } catch (error: any) {
    console.error("❌ 로그아웃 오류:", error);
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
