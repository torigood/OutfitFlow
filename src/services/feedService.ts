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
  increment,
  getDoc, 
  setDoc  
} from "firebase/firestore";
import { db } from "../config/firebase";
import { FeedPost, Comment } from "../types/feed";

const FEED_COLLECTION = "feeds";

// 1. 피드 게시물 작성
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
      commentCount: 0, // 초기값 0 설정
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

// 2. 전체 피드 가져오기
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

// 3. 좋아요 토글
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

// 4. 게시물 삭제
export const deleteFeedPost = async (feedId: string) => {
  try {
    await deleteDoc(doc(db, FEED_COLLECTION, feedId));
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};

// 5. 게시물 내용 수정 (추가됨)
export const updateFeedPostDescription = async (feedId: string, newDescription: string) => {
  try {
    const postRef = doc(db, FEED_COLLECTION, feedId);
    await updateDoc(postRef, {
      description: newDescription,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating post description:", error);
    throw error;
  }
};

// 6. 댓글 작성 (숫자 증가 로직 추가)
export const addComment = async (feedId: string, userId: string, userName: string, text: string) => {
  try {
    // 1) 댓글 하위 컬렉션에 추가
    const commentsRef = collection(db, FEED_COLLECTION, feedId, "comments");
    const newCommentRef = await addDoc(commentsRef, {
      userId,
      userName,
      text,
      createdAt: serverTimestamp(),
    });

    // 2) 게시물 문서의 commentCount +1 증가
    const feedRef = doc(db, FEED_COLLECTION, feedId);
    await updateDoc(feedRef, {
      commentCount: increment(1)
    });

    // 3) UI 업데이트를 위해 추가된 댓글 데이터 반환
    return {
      id: newCommentRef.id,
      userId,
      userName,
      text,
      createdAt: new Date(), // 임시로 현재 시간 반환
    } as Comment;

  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

// 7. 댓글 가져오기
export const getComments = async (feedId: string): Promise<Comment[]> => {
  try {
    const commentsRef = collection(db, FEED_COLLECTION, feedId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Timestamp를 Date로 변환 (UI 렌더링 에러 방지)
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(),
    })) as Comment[];
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

// 8. 댓글 삭제 (숫자 감소 로직 추가)
export const deleteComment = async (feedId: string, commentId: string) => {
  try {
    // 1) 댓글 삭제
    const commentRef = doc(db, FEED_COLLECTION, feedId, "comments", commentId);
    await deleteDoc(commentRef);

    // 2) 게시물 문서의 commentCount -1 감소
    const feedRef = doc(db, FEED_COLLECTION, feedId);
    await updateDoc(feedRef, {
      commentCount: increment(-1)
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};

// 9. 댓글 수정
export const updateComment = async (feedId: string, commentId: string, newText: string) => {
  try {
    const commentRef = doc(db, FEED_COLLECTION, feedId, "comments", commentId);
    await updateDoc(commentRef, {
      text: newText,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    throw error;
  }
};  

// 10. 게시물 저장 상태 확인
export const getIsPostSaved = async (feedId: string, userId: string) => {
  try {
    const savedRef = doc(db, "users", userId, "saved_feeds", feedId);
    const docSnap = await getDoc(savedRef);
    return docSnap.exists();
  } catch (error) {
    console.error("Error checking saved status:", error);
    return false;
  }
};

// 11. 게시물 저장 토글 (저장 <-> 취소)
export const toggleSaveFeedPost = async (feedItem: FeedPost, userId: string) => {
  try {
    const savedRef = doc(db, "users", userId, "saved_feeds", feedItem.id);
    const docSnap = await getDoc(savedRef);

    if (docSnap.exists()) {
      // 이미 저장되어 있으면 -> 삭제 (저장 취소)
      await deleteDoc(savedRef);
      return false; // 결과: 저장 안 된 상태
    } else {
      // 저장 안 되어 있으면 -> 추가 (저장)
      await setDoc(savedRef, {
        originalId: feedItem.id,
        mainImageUrl: feedItem.mainImageUrl,
        description: feedItem.description,
        savedAt: serverTimestamp(),
      });
      return true; // 결과: 저장된 상태
    }
  } catch (error) {
    console.error("Error toggling save:", error);
    throw error;
  }
};