import { Timestamp } from "firebase/firestore";
import { ClothingItem } from "./wardrobe";

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Timestamp | Date;
}

export interface FeedPost {
  id: string;
  userId: string;
  userName: string;
  userProfileImage?: string;
  mainImageUrl: string;
  items: ClothingItem[];
  description: string;
  styleTags: string[];
  likes: string[];
  createdAt: Timestamp | Date;
  commentCount?: number; 
}