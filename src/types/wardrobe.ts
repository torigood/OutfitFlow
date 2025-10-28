export interface ClothingItem {
  id: string;
  name: string;
  category: string;
  color: string;
  brand: string;
  seasons: string;
  imageUrl: string;
  cloudinaryPublicId: string; // Cloudinary public_id for cleanup
  createdAt: Date;
  updatedAt: Date;
}

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  version: number;
  signature: string;
}
