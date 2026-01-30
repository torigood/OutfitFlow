/**
 * 네이버 쇼핑 API 응답 타입
 */
export interface NaverShoppingResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverProduct[];
}

/**
 * 네이버 쇼핑 상품 타입
 */
export interface NaverProduct {
  productId: string;
  title: string;
  link: string;
  image: string;
  lprice: string;
  hprice: string;
  mallName: string;
  productType: string;
  brand: string;
  maker: string;
  category1: string;
  category2: string;
  category3: string;
  category4: string;
}

/**
 * 저장된 상품 타입 (Firebase)
 */
export interface SavedProduct {
  id: string;
  productId: string;
  title: string;
  image: string;
  price: string;
  mallName: string;
  link: string;
  brand: string;
  category: string;
  savedAt: Date;
}

/**
 * 쇼핑 카테고리 타입
 */
export type ShoppingCategory =
  | "all"
  | "tops"
  | "bottoms"
  | "outer"
  | "shoes"
  | "accessories";

/**
 * 카테고리별 검색어 매핑
 */
export const CATEGORY_SEARCH_QUERIES: Record<ShoppingCategory, string> = {
  all: "패션",
  tops: "상의",
  bottoms: "하의 바지",
  outer: "아우터 자켓",
  shoes: "신발",
  accessories: "패션 악세사리",
};
