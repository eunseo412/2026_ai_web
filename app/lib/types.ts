// =========================================
// ParkingMate - 공통 타입 정의 (Supabase 연동 버전)
// =========================================

// ---- DB 테이블 타입 ----

export interface CommunityParking {
  id: string;                   // UUID
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
  reviews?: Review[];            // JOIN 결과
}

export interface Review {
  id: string;
  parking_id: string;
  author: string;
  rating: number;                // 1-5
  comment: string;
  created_at: string;
}

// 커뮤니티 게시글 (후기 게시판)
export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: string;
  views: number;
  created_at: string;
  community_comments?: CommunityComment[];  // JOIN 결과
}

// 댓글 (community_comments 테이블)
export interface CommunityComment {
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
