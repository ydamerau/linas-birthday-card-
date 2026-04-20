export interface ReviewState {
  username: string;
  avatarUrl: string;
  reviewText: string;
  rating: number; // 0 to 5, increments of 0.5
  hasHeart: boolean;
}
