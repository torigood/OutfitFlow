import {
  collection,
  addDoc,
  doc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import {
  OutfitAnalysis,
  WeatherInfo,
  SavedOutfit,
  FashionStyle,
} from "../types/ai";

const getSavedOutfitCollection = (userId: string) =>
  collection(db, "users", userId, "savedOutfits");

const buildItemIdsHash = (itemIds: string[]) =>
  [...itemIds].sort().join("__");

export const saveAiOutfit = async (
  userId: string,
  analysis: OutfitAnalysis,
  options: {
    weather?: WeatherInfo | null;
    preferredStyle?: FashionStyle;
  }
): Promise<SavedOutfit> => {
  const itemIds = analysis.selectedItems.map((i) => i.id);
  const itemIdsHash = buildItemIdsHash(itemIds);
  const savedAt = Timestamp.now();

  const payload = {
    itemIds,
    itemIdsHash,
    items: analysis.selectedItems.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      color: item.color,
      brand: item.brand,
      imageUrl: item.imageUrl,
    })),
    compatibility: analysis.compatibility,
    colorHarmonyScore: analysis.colorHarmony.score,
    styleConsistency: analysis.styleConsistency,
    advice: analysis.advice,
    suggestions: analysis.suggestions,
    preferredStyle: options.preferredStyle ?? null,
    weatherSnapshot: options.weather ?? null,
    coverImage: analysis.selectedItems[0]?.imageUrl ?? "",
    savedAt,
  };

  const docRef = await addDoc(getSavedOutfitCollection(userId), payload);
  return {
    id: docRef.id,
    ...payload,
    savedAt: savedAt.toDate(),
  } as SavedOutfit;
};

export const getSavedOutfits = async (
  userId: string,
  opts: { take?: number } = {}
): Promise<SavedOutfit[]> => {
  const q = query(
    getSavedOutfitCollection(userId),
    orderBy("savedAt", "desc"),
    ...(opts.take ? [limit(opts.take)] : [])
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      itemIdsHash:
        data.itemIdsHash ??
        (Array.isArray(data.itemIds) ? buildItemIdsHash(data.itemIds) : ""),
      savedAt: data.savedAt ? (data.savedAt as Timestamp).toDate() : new Date(),
    } as SavedOutfit;
  });
};

export const deleteSavedOutfit = async (userId: string, outfitId: string) => {
  await deleteDoc(doc(db, "users", userId, "savedOutfits", outfitId));
};

export const findSavedOutfitByItems = async (
  userId: string,
  itemIds: string[]
): Promise<SavedOutfit | null> => {
  if (itemIds.length === 0) return null;
  const itemIdsHash = buildItemIdsHash(itemIds);
  const q = query(
    getSavedOutfitCollection(userId),
    where("itemIdsHash", "==", itemIdsHash)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    itemIdsHash,
    savedAt: data.savedAt ? (data.savedAt as Timestamp).toDate() : new Date(),
  } as SavedOutfit;
};
