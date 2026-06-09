// =========================================
// ParkingMate - 공통 타입 정의
// =========================================

// 커뮤니티 등록 주차장 리뷰
export interface ParkingReview {
  id: string;
  author: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string; // ISO string
}

// 커뮤니티 등록 주차장
export interface CommunityParking {
  id: string;
  title: string;
  address: string;
  description: string;
  availableTime: string;       // 예: "평일 18:00-08:00, 주말 전일"
  hourlyRate: number;          // 시간당 요금 (원)
  monthlyRate: number;         // 월 정기권 요금 (원)
  capacity: number;            // 주차 가능 대수
  contactMethod: string;       // 연락 방법
  imageDataUrl?: string;       // base64 이미지
  likes: number;
  dislikes: number;
  reviews: ParkingReview[];
  promoted: boolean;           // likes >= 50 이면 true
  lat?: number;
  lng?: number;
  createdAt: string;           // ISO string
}

// 커뮤니티 게시글 댓글
export interface PostComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

// 커뮤니티 게시글
export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: string;
  views: number;
  comments: PostComment[];
  createdAt: string;
}

// 단골(즐겨찾기) 주차장
export interface FavoriteParking {
  id: string;
  name: string;
  address: string;
  distance?: number;
  feeDisplay: string;
  lat: number;
  lng: number;
  source: 'public_api' | 'local_real_database' | 'community';
  savedAt: string; // ISO string
}

// 저장된 주차 위치
export interface SavedParkingLocation {
  id: string;
  memo: string;
  imageDataUrl?: string;
  savedAt: string;   // ISO string
  lat: number;
  lng: number;
  address?: string;
}

// 정기결제 구독 레코드
export interface ParkingSubscription {
  id: string;
  parkingId: string;
  parkingTitle: string;
  parkingAddress: string;
  monthlyRate: number;
  startDate: string;  // YYYY-MM-DD
  endDate: string;    // YYYY-MM-DD
  timeSlot: string;
  totalAmount: number;
  status: 'active' | 'paid' | 'expired';
  paidAt?: string;
}
