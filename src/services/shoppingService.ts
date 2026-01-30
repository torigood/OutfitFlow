import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import {
  NaverProduct,
  SavedProduct,
  ShoppingCategory,
  CATEGORY_SEARCH_QUERIES,
} from "../types/shopping";
import { VERCEL_API_URL } from "@env";

// Vercel API URL (배포 후 설정)
const API_BASE_URL = VERCEL_API_URL || "https://your-vercel-app.vercel.app";

/**
 * 사용자별 저장된 상품 컬렉션 경로
 */
const getUserSavedProductsCollection = (userId: string) => {
  return collection(db, "users", userId, "savedProducts");
};

/**
 * 네이버 쇼핑 API로 상품 검색 (Vercel Serverless 사용)
 */
export const searchProducts = async (
  searchQuery: string,
  category: ShoppingCategory = "all",
  page: number = 1,
  display: number = 20
): Promise<NaverProduct[]> => {
  try {
    const categoryQuery = category !== "all"
      ? CATEGORY_SEARCH_QUERIES[category]
      : "";
    const fullQuery = searchQuery
      ? `${searchQuery} ${categoryQuery}`.trim()
      : categoryQuery || "패션";

    const start = (page - 1) * display + 1;

    const response = await fetch(
      `${API_BASE_URL}/api/search-products?query=${encodeURIComponent(fullQuery)}&display=${display}&start=${start}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API 오류: ${response.status}`);
    }

    const data = await response.json();
    return data.items;
  } catch (error) {
    console.error("상품 검색 오류:", error);
    throw new Error(
      `상품 검색 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
    );
  }
};

/**
 * 상품 저장 (좋아요)
 */
export const saveProduct = async (
  userId: string,
  product: NaverProduct
): Promise<string> => {
  try {
    const existingQuery = query(
      getUserSavedProductsCollection(userId),
      where("productId", "==", product.productId)
    );
    const existingDocs = await getDocs(existingQuery);

    if (!existingDocs.empty) {
      throw new Error("이미 저장된 상품입니다.");
    }

    const docRef = await addDoc(getUserSavedProductsCollection(userId), {
      productId: product.productId,
      title: product.title.replace(/<\/?b>/g, ""),
      image: product.image,
      price: product.lprice,
      mallName: product.mallName,
      link: product.link,
      brand: product.brand || "",
      category: product.category1 || "",
      savedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("상품 저장 오류:", error);
    throw error;
  }
};

/**
 * 저장된 상품 목록 조회
 */
export const getSavedProducts = async (userId: string): Promise<SavedProduct[]> => {
  try {
    const q = query(
      getUserSavedProductsCollection(userId),
      orderBy("savedAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        productId: data.productId,
        title: data.title,
        image: data.image,
        price: data.price,
        mallName: data.mallName,
        link: data.link,
        brand: data.brand || "",
        category: data.category || "",
        savedAt: data.savedAt
          ? (data.savedAt as Timestamp).toDate()
          : new Date(),
      };
    });
  } catch (error) {
    console.error("저장된 상품 조회 오류:", error);
    throw new Error(
      `저장된 상품 불러오기 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
    );
  }
};

/**
 * 저장된 상품 삭제
 */
export const removeSavedProduct = async (
  userId: string,
  savedProductId: string
): Promise<void> => {
  try {
    const docRef = doc(db, "users", userId, "savedProducts", savedProductId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("상품 삭제 오류:", error);
    throw new Error(
      `상품 삭제 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
    );
  }
};

/**
 * 상품이 저장되어 있는지 확인
 */
export const isProductSaved = async (
  userId: string,
  productId: string
): Promise<boolean> => {
  try {
    const q = query(
      getUserSavedProductsCollection(userId),
      where("productId", "==", productId)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("상품 저장 확인 오류:", error);
    return false;
  }
};

/**
 * 가격 포맷팅 (원화)
 */
export const formatPrice = (price: string): string => {
  const numPrice = parseInt(price, 10);
  if (isNaN(numPrice)) return price;
  return numPrice.toLocaleString("ko-KR") + "원";
};
