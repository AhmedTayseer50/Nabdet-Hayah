export interface Lesson {
  id: string;
  courseId: string;
  title?: string | null;
  lessonIndex?: number | null;
  playbackUrl?: string; // أو لاحقًا videoId
  createdAt?: number;
}
