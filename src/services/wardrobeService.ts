import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { ClothingItem } from "../types/wardrobe";

const WARDROBE_COLLECTION = "wardrobe";

/**
 * 옷 아이템 추가
 * @param item - 옷 정보 (imageUrl 포함)
 * @returns 생성된 문서 ID
 */
export const addClothingItem = async (
  item: Omit<ClothingItem, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, WARDROBE_COLLECTION), {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("옷 추가 오류:", error);
    throw new Error(
      `옷 추가 실패: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`
    );
  }
};

/**
 * 모든 옷 아이템 가져오기
 * @returns 옷 목록 (생성일 기준 내림차순)
 */
export const getClothingItems = async (): Promise<ClothingItem[]> => {
  try {
    const q = query(
      collection(db, WARDROBE_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    const items: ClothingItem[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        category: data.category,
        color: data.color,
        brand: data.brand,
        seasons: data.seasons,
        imageUrl: data.imageUrl,
        cloudinaryPublicId: data.cloudinaryPublicId,
        createdAt: data.createdAt
          ? (data.createdAt as Timestamp).toDate()
          : new Date(),
        updatedAt: data.updatedAt
          ? (data.updatedAt as Timestamp).toDate()
          : new Date(),
      };
    });

    return items;
  } catch (error) {
    console.error("옷 목록 가져오기 오류:", error);
    throw new Error(
      `옷 목록 불러오기 실패: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`
    );
  }
};

/**
 * 옷 아이템 수정
 * @param id - 문서 ID
 * @param updates - 수정할 필드
 */
export const updateClothingItem = async (
  id: string,
  updates: Partial<Omit<ClothingItem, "id" | "createdAt" | "updatedAt">>
): Promise<void> => {
  try {
    const docRef = doc(db, WARDROBE_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("옷 수정 오류:", error);
    throw new Error(
      `옷 수정 실패: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`
    );
  }
};

/**
 * 옷 아이템 삭제
 * @param id - 문서 ID
 */
export const deleteClothingItem = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, WARDROBE_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("옷 삭제 오류:", error);
    throw new Error(
      `옷 삭제 실패: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`
    );
  }
};
