import * as Localization from "expo-localization";
import { I18n } from "i18n-js";

export type SupportedLanguage = "en" | "ko";

export const translations = {
  en: {
    // --- Common & Global ---
    lang: "Language",
    confirmText: "Confirm",
    cancel: "Cancel",
    deleteText: "Delete",
    editText: "Edit",
    saveOutfit: "Save",
    saved: "Saved",
    saving: "Saving...",
    total: "Total",
    afterTotal: " items",
    optional: "(Optional)",
    commonAnd: "and",
    emptyItems: "No items here",

    // --- Tab Bar ---
    homeTab: "Home",
    wardrobeTab: "Items",
    aiTab: "AI",
    communityTab: "Feeds",
    shoppingTab: "Shops",
    settingsTab: "Settings",

    // --- Auth: General ---
    authBack: "← Back",
    authAlertTitle: "Notice",
    authFooterPrefix: "By continuing you agree to OutfitFlow's",
    authFooterSuffix: ".",
    legalTerms: "Terms of Use",
    legalPrivacy: "Privacy Policy",
    authDividerText: "or",
    authGoogleButton: "Continue with Google",
    authConfirm: "OK",

    // --- Auth: Login ---
    loginTitle: "Log In",
    loginSubtitle: "Welcome back to OutfitFlow",
    loginEmailLabel: "Email",
    loginEmailPlaceholder: "example@email.com",
    loginPasswordLabel: "Password",
    loginPasswordPlaceholder: "Enter your password",
    loginRememberMe: "Keep me logged in",
    loginForgotPassword: "Forgot password?",
    loginButton: "Log In",
    loginSignupPrompt: "Don't have an account?",
    loginSignupLink: "Sign Up",
    loginMissingFields: "Please enter your email and password.",
    loginErrorTitle: "Login Failed",
    loginGoogleErrorTitle: "Google Login Failed",
    notValideEmail: "Please enter valid email address.",

    // --- Auth: Signup ---
    signupTitle: "Sign Up",
    signupSubtitle: "Start your journey with our AI stylist",
    signupNameLabel: "Name",
    signupNamePlaceholder: "Your name",
    signupEmailLabel: "Email",
    signupEmailPlaceholder: "example@email.com",
    signupPasswordLabel: "Password",
    signupPasswordPlaceholder: "At least 8 characters",
    signupConfirmPasswordLabel: "Confirm Password",
    signupConfirmPasswordPlaceholder: "Re-enter password",
    signupButton: "Sign Up",
    signupLoginPrompt: "Already have an account?",
    signupLoginLink: "Log In",
    signupMissingFields: "Please fill out all fields.",
    signupPasswordMismatch: "Passwords do not match.",
    signupPasswordLength: "Password must be at least 8 characters.",
    signupSuccessTitle: "Sign-up Successful",
    signupSuccessMessage: "Welcome to OutfitFlow!",
    signupErrorTitle: "Sign-up Failed",
    // [New] Validation Keys
    signupRequiredField: "This field is required.",
    signupPasswordComplexityError: "Must contain uppercase, lowercase, number, and special char.",
    signupEmailAlreadyInUse: "This email is already in use.",

    // --- Auth: Forgot Password ---
    forgotTitle: "Reset Password",
    forgotSubtitle: "Enter the email you used to sign up and we'll send you a reset link.",
    forgotEmailLabel: "Email",
    forgotEmailPlaceholder: "example@email.com",
    forgotButton: "Send Reset Link",
    forgotInfoText: "Check your spam folder if the email doesn't arrive.",
    forgotMissingEmail: "Please enter your email address.",
    forgotSuccessTitle: "Email Sent",
    forgotSuccessMessage: "We've sent a password reset link to your email. Please check your inbox.",
    forgotErrorTitle: "Error",

    // --- Auth: Landing ---
    landingHeroSubtitle: "AI curated looks just for you",
    landingFeature1Title: "AI Outfit Picks",
    landingFeature1Description: "Perfect outfits for any weather\nand TPO.",
    landingFeature2Title: "Real-time Weather",
    landingFeature2Description: "Stay prepared with smart\nweather-aware tips.",
    landingFeature3Title: "Smart Wardrobe",
    landingFeature3Description: "Keep your closet organized\nand efficient.",
    landingCTA: "Get Started",
    landingLogin: "Log In",
    landingFooterText: "Already have an account?",
    landingFooterLink: "Log in →",
    landingFooterLoginPrompt: "Already have an account?",

    // --- Home Screen ---
    quickActions: "Quick Actions",
    aiRecommend: "Recommend",
    wardrobe: "Wardrobe",
    trends: "Trends",
    shopping: "Shopping",
    recentRecommendations: "Recent Recommendations",
    noRecommendations: "No recommendations yet",
    stats: "Statistics",
    ownedItems: "Owned Items",
    outfits: "Saved Outfits",
    avgScore: "Avg Score",

    // --- Wardrobe: Main ---
    myWardrobe: "My Wardrobe",
    addItemButton: "Add Item",
    AddNewItem: "Add New Item",
    editItem: "Edit Item",
    searchItems: "Search items...",
    itemDetail: "Item Details",
    
    // --- Wardrobe: Form & Upload ---
    category: "Category",
    season: "Seasons",
    color: "Colour",
    brand: "Brand",
    nameItem: "Enter the name of your item",
    brandname: "Enter the brand",
    colorname: "Enter the colour",
    takePiccture: "Take a Photo",
    clickToSelect: "Click to select a file",
    dragAnddrop: "or drag and drop",
    enterErrorTitle: "Input Error",
    enterError: "Image, Item name, Category are required.",
    
    // --- Wardrobe: Actions & Dialogs ---
    permissionTitle: "Permission Required",
    permissionGallery: "Gallery access is required.",
    permissionCamera: "Camera access is required.",
    deleteItemConfirmTitle: "Delete Item",
    deleteItemConfirmMessage: "Are you sure you want to delete this item?",
    cancleDelete: "Cancel", // Key kept as requested (typo in original key name preserved)
    confirmDelete: "Confirm",
    deleteSuccess: "Item has been deleted.",
    itemEditSuccessTitle: "Success",
    itemEditMessage: "Item has been updated!",
    itemAddedTitle: "Success",
    itemAddedMessage: "Item has been added!",

    // --- Wardrobe: Data ---
    categories: {
      all: "All",
      tops: "Tops",
      bottoms: "Bottoms",
      outer: "Outerwear",
      shoes: "Shoes",
      accessories: "Accessories",
    },
    seasons: {
      all: "All",
      spring: "Spring",
      summer: "Summer",
      autumn: "Autumn",
      winter: "Winter",
    },
    styles: {
      casual: "Casual",
      formal: "Formal",
      street: "Street",
      vintage: "Vintage",
      minimal: "Minimal",
      sporty: "Sporty",
      feminine: "Feminine",
      dandy: "Dandy",
      etc: "Others",
    },

    // --- AI Recommendations ---
    AITitle: "AI Recommendations",
    AISubtitle: "Find the perfect outfit for the weather and style",
    weatherFeelsLike: "Feels like ",
    weatherHumidity: "Humidity ",
    weatherConditionClear: "Clear",
    weatherConditionCloudy: "Cloudy",
    weatherConditionRain: "Rainy",
    weatherConditionSnow: "Snowy",
    
    chostItemTitle: "Choose your Items",
    selectInstruc: "1 top / 1 bottom / 1 outerwear / 1 pair of shoes — accessories unlimited.",
    wardrobeChooseButton: "Select Items",
    selectItems: "Select items",
    numberSelected: " Selected",
    wantStyle: "Choose Style",
    
    getAIRec: "Get AI Recommendation",
    AIAdvise: "AI Advise",
    recNewItem: "Suggested items to wear with this",
    recNewItemTitle: "Complete the outfit with this piece",
    colorRec: "Color Pairings",
    suggestOption: "Suggestions",
    compatibilityScore: "Compatibility {{score}}/10",
    needMoreWardrobeItems: "Add at least two wardrobe items to use AI recommendations.",

    // --- Saved Outfits ---
    savedOutfits: "Saved Outfits",
    savedOutfitDetail: "Outfit Details",
    savedOn: "Saved on",
    saveOutfitSuccess: "Saved recommended outfit!",
    saveOutfitDuplicate: "This outfit is already saved.",
    saveOutfitError: "Couldn't save this outfit. Please try again.",
    noSavedOutfits: "No saved outfits yet.",
    deleteOutfit: "Delete Outfit",
    deleteOutfitTitle: "Delete Outfit",
    deleteOutfitMessage: "Are you sure you want to delete this saved outfit?",
    deleteOutfitSuccess: "Outfit deleted successfully.",
    deleteOutfitError: "Failed to delete outfit.",

    // --- Settings ---
    accountInfo: "Account Info",
    name: "Name",
    email: "Email",
    appInfo: "App Info",
    version: "Version",
    logout: "Log Out",
    logoutConfirmTitle: "Log Out",
    logoutConfirmMessage: "Are you sure you want to log out?",
    languageSetting: "Language",
    selectLanguage: "Choose your language",
  },

  ko: {
    // --- Common & Global ---
    lang: "언어",
    confirmText: "확인",
    cancel: "취소",
    deleteText: "삭제",
    editText: "수정",
    saveOutfit: "저장",
    saved: "저장됨",
    saving: "저장 중...",
    total: "총",
    afterTotal: "개의 아이템",
    optional: "(선택)",
    commonAnd: "및",
    emptyItems: "아이템이 없습니다",

    // --- Tab Bar ---
    homeTab: "홈",
    wardrobeTab: "옷장",
    aiTab: "AI",
    communityTab: "커뮤니티",
    shoppingTab: "쇼핑",
    settingsTab: "설정",

    // --- Auth: General ---
    authBack: "← 돌아가기",
    authAlertTitle: "알림",
    authFooterPrefix: "계속 진행하면 OutfitFlow의",
    authFooterSuffix: "에 동의하게 됩니다",
    legalTerms: "이용약관",
    legalPrivacy: "개인정보처리방침",
    authDividerText: "또는",
    authGoogleButton: "Google로 계속하기",
    authConfirm: "확인",

    // --- Auth: Login ---
    loginTitle: "로그인",
    loginSubtitle: "OutfitFlow에 오신 것을 환영합니다",
    loginEmailLabel: "이메일",
    loginEmailPlaceholder: "example@email.com",
    loginPasswordLabel: "비밀번호",
    loginPasswordPlaceholder: "비밀번호 입력",
    loginRememberMe: "로그인 상태 유지",
    loginForgotPassword: "비밀번호 찾기",
    loginButton: "로그인",
    loginSignupPrompt: "아직 계정이 없으신가요?",
    loginSignupLink: "회원가입",
    loginMissingFields: "이메일과 비밀번호를 입력해주세요.",
    loginErrorTitle: "로그인 실패",
    loginGoogleErrorTitle: "Google 로그인 실패",
    notValideEmail: "유효하지 않은 이메일 주소입니다.",

    // --- Auth: Signup ---
    signupTitle: "회원가입",
    signupSubtitle: "AI 스타일리스트와 함께 시작하세요",
    signupNameLabel: "이름",
    signupNamePlaceholder: "홍길동",
    signupEmailLabel: "이메일",
    signupEmailPlaceholder: "example@email.com",
    signupPasswordLabel: "비밀번호",
    signupPasswordPlaceholder: "최소 8자 이상",
    signupConfirmPasswordLabel: "비밀번호 확인",
    signupConfirmPasswordPlaceholder: "비밀번호 재입력",
    signupButton: "회원가입",
    signupLoginPrompt: "이미 계정이 있으신가요?",
    signupLoginLink: "로그인",
    signupMissingFields: "모든 항목을 입력해주세요.",
    signupPasswordMismatch: "비밀번호가 일치하지 않습니다.",
    signupPasswordLength: "비밀번호는 최소 8자 이상이어야 합니다.",
    signupSuccessTitle: "회원가입 성공",
    signupSuccessMessage: "OutfitFlow에 오신 것을 환영합니다!",
    signupErrorTitle: "회원가입 실패",
    // [New] Validation Keys
    signupRequiredField: "필수 입력 항목입니다.",
    signupPasswordComplexityError: "대소문자, 숫자, 특수문자를 모두 포함해야 합니다.",
    signupEmailAlreadyInUse: "이미 사용 중인 이메일입니다.",

    // --- Auth: Forgot Password ---
    forgotTitle: "비밀번호 찾기",
    forgotSubtitle: "가입하신 이메일 주소를 입력하시면\n비밀번호 재설정 링크를 보내드립니다.",
    forgotEmailLabel: "이메일",
    forgotEmailPlaceholder: "example@email.com",
    forgotButton: "재설정 링크 전송",
    forgotInfoText: "이메일이 도착하지 않으면 스팸함을 확인해주세요.",
    forgotMissingEmail: "이메일을 입력해주세요.",
    forgotSuccessTitle: "이메일 전송 완료",
    forgotSuccessMessage: "비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.",
    forgotErrorTitle: "오류",

    // --- Auth: Landing ---
    landingHeroSubtitle: "AI가 추천하는 나만의 스타일",
    landingFeature1Title: "AI 코디 추천",
    landingFeature1Description: "날씨와 TPO에 맞는\n완벽한 옷차림을 추천합니다",
    landingFeature2Title: "실시간 날씨 기반",
    landingFeature2Description: "현재 날씨를 고려한\n스마트한 옷 추천",
    landingFeature3Title: "스마트 옷장 관리",
    landingFeature3Description: "내 옷을 쉽게 보관하고\n효율적으로 활용하세요",
    landingCTA: "시작하기",
    landingLogin: "로그인",
    landingFooterText: "이미 계정이 있으신가요?",
    landingFooterLink: "로그인하기 →",
    landingFooterLoginPrompt: "이미 계정이 있으신가요?",

    // --- Home Screen ---
    quickActions: "빠른 작업",
    aiRecommend: "AI 추천",
    wardrobe: "옷장",
    trends: "트렌드",
    shopping: "쇼핑",
    recentRecommendations: "최근 추천",
    noRecommendations: "아직 추천 내역이 없습니다",
    stats: "통계",
    ownedItems: "보유 아이템",
    outfits: "저장된 코디",
    avgScore: "평균 점수",

    // --- Wardrobe: Main ---
    myWardrobe: "내 옷장",
    addItemButton: "아이템 추가",
    AddNewItem: "새 아이템 추가",
    editItem: "아이템 수정",
    searchItems: "아이템 검색...",
    itemDetail: "아이템 상세",

    // --- Wardrobe: Form & Upload ---
    category: "카테고리",
    season: "계절",
    color: "색상",
    brand: "브랜드",
    nameItem: "아이템 이름을 입력하세요",
    brandname: "브랜드를 입력하세요",
    colorname: "색상을 입력하세요",
    takePiccture: "사진 촬영",
    clickToSelect: "클릭하여 파일을 선택하거나",
    dragAnddrop: "드래그 앤 드롭하세요",
    enterErrorTitle: "입력 오류",
    enterError: "이미지, 아이템 이름, 카테고리는 필수입니다.",

    // --- Wardrobe: Actions & Dialogs ---
    permissionTitle: "권한 필요",
    permissionGallery: "갤러리 접근 권한이 필요합니다.",
    permissionCamera: "카메라 접근 권한이 필요합니다.",
    deleteItemConfirmTitle: "아이템 삭제",
    deleteItemConfirmMessage: "정말 아이템을 삭제하시겠습니까?",
    cancleDelete: "취소", // Key maintained as per request
    confirmDelete: "확인",
    deleteSuccess: "아이템이 삭제되었습니다.",
    itemEditSuccessTitle: "성공",
    itemEditMessage: "아이템이 수정되었습니다.",
    itemAddedTitle: "성공",
    itemAddedMessage: "아이템이 추가되었습니다.",

    // --- Wardrobe: Data ---
    categories: {
      all: "전체",
      tops: "상의",
      bottoms: "하의",
      outer: "아우터",
      shoes: "신발",
      accessories: "악세사리",
    },
    seasons: {
      all: "전체",
      spring: "봄",
      summer: "여름",
      autumn: "가을",
      winter: "겨울",
    },
    styles: {
      casual: "캐주얼",
      formal: "포멀",
      street: "스트릿",
      vintage: "빈티지",
      minimal: "미니멀",
      sporty: "스포티",
      feminine: "페미닌",
      dandy: "댄디",
      etc: "기타",
    },

    // --- AI Recommendations ---
    AITitle: "AI 코디 추천",
    AISubtitle: "날씨와 스타일에 맞는 완벽한 조합을 찾아보세요",
    weatherFeelsLike: "체감",
    weatherHumidity: "습도",
    weatherConditionClear: "맑음",
    weatherConditionCloudy: "흐림",
    weatherConditionRain: "비",
    weatherConditionSnow: "눈",

    chostItemTitle: "옷 선택하기",
    selectInstruc: "상의/하의/아우터/신발은 각 1개씩, 악세사리는 제한 없음",
    wardrobeChooseButton: "옷장에서 선택하기",
    selectItems: "옷 선택하기",
    numberSelected: "개 선택됨",
    wantStyle: "원하는 스타일",

    getAIRec: "AI 추천 받기",
    AIAdvise: "AI 조언",
    recNewItem: "같이 있으면 좋을 아이템",
    recNewItemTitle: "이 코디에 추가하면 더 완성도가 높아집니다",
    colorRec: "추천 보색",
    suggestOption: "개선 제안",
    compatibilityScore: "조합 점수 {{score}}/10",
    needMoreWardrobeItems: "AI 추천을 사용하려면 옷장을 최소 두 벌 이상 채워 주세요.",

    // --- Saved Outfits ---
    savedOutfits: "저장한 코디",
    savedOutfitDetail: "코디 상세",
    savedOn: "저장일",
    saveOutfitSuccess: "추천 코디를 저장했어요!",
    saveOutfitDuplicate: "이미 저장된 조합이에요.",
    saveOutfitError: "저장 중 문제가 발생했어요.",
    noSavedOutfits: "저장된 코디가 없어요.",
    deleteOutfit: "코디 삭제",
    deleteOutfitTitle: "코디 삭제",
    deleteOutfitMessage: "이 저장된 코디를 삭제하시겠습니까?",
    deleteOutfitSuccess: "코디가 삭제되었습니다.",
    deleteOutfitError: "삭제 중 오류가 발생했습니다.",

    // --- Settings ---
    accountInfo: "계정 정보",
    name: "이름",
    email: "이메일",
    appInfo: "앱 정보",
    version: "버전",
    logout: "로그아웃",
    logoutConfirmTitle: "로그아웃",
    logoutConfirmMessage: "정말 로그아웃 하시겠습니까?",
    languageSetting: "언어 설정",
    selectLanguage: "사용할 언어를 선택하세요",
  },
} as const;

const i18n = new I18n(translations);
const locales = Localization.getLocales();
i18n.locale = (locales[0]?.languageTag ?? "en").split("-")[0];
i18n.enableFallback = true;

export type TranslationKeys = keyof typeof translations.en;

export type CategoryKey = keyof typeof translations.en.categories;
export type SeasonKey = keyof typeof translations.en.seasons;
export type StyleKey = keyof typeof translations.en.styles;

export const setI18nLanguage = (language: SupportedLanguage) => {
  i18n.locale = language;
};

export const t = (key: TranslationKeys, options?: Record<string, any>) =>
  i18n.t(key, options);
export const tCategory = (key: CategoryKey) =>
  i18n.t(`categories.${key}` as const);
export const tSeason = (key: SeasonKey) => i18n.t(`seasons.${key}` as const);
export const tStyle = (key: StyleKey) => i18n.t(`styles.${key}` as const);

export const availableLanguages: { code: SupportedLanguage; label: string }[] =
  [
    { code: "en", label: "English" },
    { code: "ko", label: "한국어" },
  ];
