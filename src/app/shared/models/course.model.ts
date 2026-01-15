export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
  playbackUrl?: string; // ← رابط الفيديو الخارجي (VdoCipher أو غيره)
  categoryId?: string;
  published?: boolean;
  createdAt?: number;
}
