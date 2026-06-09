// =========================================
// ParkingMate - 공통 타입 정의 (Supabase 연동 버전)
// =========================================

// ---- DB 테이블 타입 ----

export interface CommunityParking {
  id: string;                  // UUID
  title: string;
  address: string;
  description: string;
  available_time: string;
  hourly_rate: number;
  monthly_rate: number;
  capacity: number;
  contact_method: string;
  image_url?: string | null;
  likes: number;
  dislikes: number;
  promoted: boolean;
  author: string;
  lat: number;
  lng: number;
  created_at: string;
  reviews?: Review[];          // JOIN 결과
}

export interface Review {
  id: string;
  parking_id: string;
  author: string;
  rating: number;  // 1-5
  comment: string;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  category: 'parking' | 'review';   // parking=공유주차장자동글, review=후기게시판
  parking_id?: string | null;
  title: string;
  content: string;
  author: string;
  views: number;
  created_at: string;
  comments?: Comment[];             // JOIN 결과
  community_parkings?: CommunityParking | null; // JOIN 결과
}

export interface Comment {
  id: string;
  post_id: string;
  author: string;
  content: string;
  created_at: string;
}

// ---- LocalStorage 전용 타입 (즐겨찾기, 주차위치) ----

export interface FavoriteParking {
  id: string;
  name: string;
  address: string;
  distance?: number;
  feeDisplay: string;
  lat: number;
  lng: number;
  source: 'public_api' | 'local_real_database' | 'community';
  savedAt: string;
}

export interface SavedParkingLocation {
  id: string;
  memo: string;
  imageDataUrl?: string;
  savedAt: string;
  lat: number;
  lng: number;
  address?: string;
}

// ---- 레거시 호환용 (localStorage storage.ts 하위 호환) ----
export interface ParkingReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PostComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}
