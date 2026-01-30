import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { FeedPost, Comment } from "../types/feed";

const FEED_COLLECTION = "feeds";

// 1. 피드 게시물 작성 (CreateFeedScreen에서 사용)
export const createFeedPost = async (
  userId: string,
  userName: string,
  postData: {
    mainImageUrl: string;
    items: any[];
    description: string;
    styleTags: string[];
  }
) => {
  try {
    await addDoc(collection(db, FEED_COLLECTION), {
      userId,
      userName,
      ...postData,
      likes: [],
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

// 2. 전체 피드 가져오기 (FeedScreen에서 사용)
export const getFeeds = async (): Promise<FeedPost[]> => {
  try {
    const q = query(collection(db, FEED_COLLECTION), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FeedPost[];
  } catch (error) {
    console.error("Error fetching feeds:", error);
    throw error;
  }
};

// 3. 좋아요 토글 (FeedScreen에서 사용)
export const toggleLikePost = async (feedId: string, userId: string, currentLikes: string[]) => {
  try {
    const feedRef = doc(db, FEED_COLLECTION, feedId);
    const isLiked = currentLikes.includes(userId);

    await updateDoc(feedRef, {
      likes: isLiked ? arrayRemove(userId) : arrayUnion(userId),
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
};

// 4. 게시물 삭제 (PostDetailScreen에서 사용)
export const deleteFeedPost = async (feedId: string) => {
  try {
    await deleteDoc(doc(db, FEED_COLLECTION, feedId));
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};

// 5. 댓글 작성 (PostDetailScreen에서 사용)
export const addComment = async (feedId: string, userId: string, userName: string, text: string) => {
  try {
    const commentsRef = collection(db, FEED_COLLECTION, feedId, "comments");
    await addDoc(commentsRef, {
      userId,
      userName,
      text,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

// 6. 댓글 가져오기 (PostDetailScreen에서 사용)
export const getComments = async (feedId: string): Promise<Comment[]> => {
  try {
    const commentsRef = collection(db, FEED_COLLECTION, feedId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Comment[];
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};