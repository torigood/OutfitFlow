import * as Localization from "expo-localization";
import { I18n } from "i18n-js";

export type SupportedLanguage = "en" | "ko";

const translations = {
  en: {
    //홈 페이지
    quickActions: "Quick Actions",
    aiRecommend: "Recommend",
    wardrobe: "Wardrobe",
    trends: "Trends",
    shopping: "Shopping",
    recentRecommendations: "Recent Recommendations",
    noRecommendations: "No recommendations yet",
    stats: "Statistics",
    ownedItems: "Owned Items",
    outfits: "Outfits",
    //세팅 페이지
    accountInfo: "Account Info",
    name: "Name",
    email: "Email",
    appInfo: "App Info",
    version: "Version",
    logout: "Log Out",
    logoutConfirmTitle: "Log Out",
    logoutConfirmMessage: "Are you sure you want to log out?",
    cancel: "Cancel",
    languageSetting: "Language",
    selectLanguage: "Choose your language",
    //탭 바
    homeTab: "Home",
    wardrobeTab: "Wardrobe",
    aiTab: "AI",
    communityTab: "Community",
    shoppingTab: "Shopping",
    settingsTab: "Settings",
    //옷장 페이지
    permissionTitle: "Permission Required",
    permissionGallery: "Gallery access is required.",
    permissionCamera: "Camera access is required.",
    deleteItemConfirmTitle: "Delete Item",
    deleteItemConfirmMessage: "Are you sure you want to delete this item?",
    cancleDelete: "Cancel",
    confirmDelete: "Confirm",
    deleteText: "Delete",
    deleteSuccess: "Item has been deleted.",
    itemEditSuccessTitle: "Success",
    itemEditMessage: "Item has been updated!",
    editText: "Edit",
    itemAddedTitle: "Success",
    itemAddedMessage: "Item has been added!",
    confirmText: "Confirm",
    myWardrobe: "My Wardrobe",
    total: "Total",
    afterTotal: " items",
    addItemButton: "Add Item",
    editItem: "Edit Item",
    AddNewItem: "Add New Item",
    searchItems: "Search items...",
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
    itemDetail: "Item Details",
    category: "Category",
    season: "Seasons",
    color: "Colour",
    brand: "Brand",
    optional: "(Optional)",
    nameItem: "Enter the name of your item",
    brandname: "Enter the brand",
    colorname: "Enter the colour ",
    takePiccture: "Take a Phone",
    clickToSelect: "Click to select a file",
    dragAnddrop: "or drag and drop",
    enterErrorTitle: "Emter Errpr",
    enterError: "Image, Item name, Category are requried.",
  },
  ko: {
    //홈 페이지
    quickActions: "빠른 작업",
    aiRecommend: "AI 추천",
    wardrobe: "옷장",
    trends: "트렌드",
    shopping: "쇼핑",
    recentRecommendations: "최근 추천",
    noRecommendations: "아직 추천 내역이 없습니다",
    stats: "통계",
    ownedItems: "보유 아이템",
    outfits: "코디 수",
    //세팅 페이지
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
    //탭 바
    homeTab: "홈",
    wardrobeTab: "옷장",
    aiTab: "AI",
    communityTab: "커뮤니티",
    shoppingTab: "쇼핑",
    settingsTab: "설정",
    //옷장 페이지
    permissionTitle: "권한 필요",
    permissionGallery: "갤러리 접근 권한이 필요합니다.",
    permissionCamera: "카메라 접근 권한이 필요합니다.",
    deleteItemConfirmTitle: "아이템 삭제",
    deleteItemConfirmMessage: "정말 아이템을 삭제하시겠습니까?",
    cancleDelete: "취소",
    confirmDelete: "확인",
    deleteText: "삭제",
    deleteSuccess: "아이템이 삭제되었습니다.",
    itemEditSuccessTitle: "성공",
    itemEditMessage: "아이템이 수정되었습니다.",
    editText: "수정",
    itemAddedTitle: "성공",
    itemAddedMessage: "아이템이 추가되었습니다.",
    confirmText: "확인",
    myWardrobe: "내 옷장",
    total: "총",
    afterTotal: "개의 아이템",
    addItemButton: "아이템 추가",
    editItem: "아이템 수정",
    AddNewItem: "새 아이템 추가",
    searchItems: "아이템 검색...",
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
    itemDetail: "아이템 상세",
    category: "카테고리",
    season: "계절",
    color: "색상",
    brand: "브랜드",
    optional: "(선택)",
    nameItem: "아이템 이름을 입력하세요",
    brandname: "브랜드를 입력하세요",
    colorname: "색상을 입력하세요",
    takePiccture: "사진 촬영",
    clickToSelect: "클릭하여 파일을 선택하거나",
    dragAnddrop: "드래그 앤 드롭하세요",
    enterErrorTitle: "입력 오류",
    enterError: "이미지, 아이템 이름, 카테고리는 필수입니다.",
  },
} as const;

const i18n = new I18n(translations);
const locales = Localization.getLocales();
i18n.locale = (locales[0]?.languageTag ?? "en").split("-")[0];
i18n.enableFallback = true;

export type TranslationKeys = keyof typeof translations.en;

export type CategoryKey = keyof typeof translations.en.categories;
export type SeasonKey = keyof typeof translations.en.seasons;

export const setI18nLanguage = (language: SupportedLanguage) => {
  i18n.locale = language;
};

export const t = (key: TranslationKeys) => i18n.t(key);
export const tCategory = (key: CategoryKey) =>
  i18n.t(`categories.${key}` as const);
export const tSeason = (key: SeasonKey) => i18n.t(`seasons.${key}` as const);

export const availableLanguages: { code: SupportedLanguage; label: string }[] =
  [
    { code: "en", label: "English" },
    { code: "ko", label: "한국어" },
  ];
