# 🅿️ ParkingMate

> **AI 기반 목적지 맞춤형 주차장 검색 서비스**
> 
> 목적지를 입력하면 공공 데이터와 AI 분석을 결합하여 최적의 주차장을 추천해 주는 웹 서비스입니다.
> 동네 주민이 직접 등록한 공유 주차 공간과 후기 게시판 기능도 함께 제공합니다.

---

## 🔗 배포 주소

> Vercel을 통해 배포됩니다. `.env` 파일의 환경변수를 Vercel 대시보드에 설정하세요.

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| **주차장 찾기** | 목적지·날짜·시간·반경을 입력하면 주변 공영/민영 주차장 목록을 지도와 함께 표시 |
| **AI 추천** | Gemini 1.5 Flash API 기반으로 상위 3개 주차장을 분석·비교하여 최적 주차장 추천 |
| **동네 주차장 등록** | 빌라 앞 공터, 상가 주차장 등 실생활 공유 주차 공간을 등록하고 조회 |
| **커뮤니티** | 주차 경험·정보를 공유하는 게시판. 닉네임 기반으로 글 작성·댓글 가능 |
| **단골 주차장** | 자주 이용하는 주차장을 즐겨찾기로 저장 (localStorage 기반) |
| **주차 위치 찾기** | GPS로 현재 위치를 저장하고 메모·사진을 기록하여 나중에 찾아볼 수 있는 기능 |
| **소개 / 팀원 소개** | 서비스 소개 및 팀원 정보 페이지 |

---

## 🛠 기술 스택

| 분류 | 기술 |
|------|------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | CSS Modules + CSS Variables (다크모드 지원) |
| **지도** | Leaflet + react-leaflet |
| **Database** | Supabase (PostgreSQL) |
| **AI** | Google Gemini 1.5 Flash API |
| **공공 데이터** | 국토교통부 전국주차장정보표준데이터 API |
| **배포** | Vercel |

---

## 📁 프로젝트 파일 구조

```
2026_AI_web/
│
├── app/                          # Next.js App Router 루트
│   │
│   ├── page.tsx                  # 홈 (주차장 찾기 검색 폼)
│   ├── layout.tsx                # 전체 레이아웃 (font, metadata)
│   ├── layout-wrapper.tsx        # 네비게이션 바, 푸터, 다크모드 토글
│   ├── globals.css               # 전역 CSS 변수 및 기본 스타일
│   ├── home.module.css           # 홈 페이지 스타일
│   ├── layout.module.css         # 네비·푸터 스타일
│   ├── page.module.css           # 홈 추가 스타일
│   │
│   ├── results/                  # 주차장 검색 결과 페이지
│   │   ├── page.tsx              # 결과 페이지 서버 컴포넌트
│   │   ├── results-client.tsx    # 결과 목록·필터·정렬·즐겨찾기 UI
│   │   ├── parking-map.tsx       # Leaflet 지도 컴포넌트
│   │   └── results.module.css
│   │
│   ├── community/                # 커뮤니티 (후기 게시판)
│   │   ├── page.tsx              # 게시글 목록·상세·작성·댓글 (Supabase 연동)
│   │   └── community.module.css
│   │
│   ├── register/                 # 동네 주차장 등록
│   │   ├── page.tsx              # 주차 공간 등록 폼 및 등록 목록 (Supabase 연동)
│   │   └── register.module.css
│   │
│   ├── favorites/                # 단골 주차장 (즐겨찾기)
│   │   ├── page.tsx              # 즐겨찾기 목록 (localStorage)
│   │   └── favorites.module.css
│   │
│   ├── parking-location/         # 주차 위치 찾기
│   │   ├── page.tsx              # GPS 위치 저장·메모·사진 기록 (localStorage)
│   │   ├── location-map.tsx      # 저장된 위치 Leaflet 지도 표시
│   │   └── parking-location.module.css
│   │
│   ├── about/                    # 서비스 소개
│   │   ├── page.tsx
│   │   └── about.module.css
│   │
│   ├── contact/                  # 팀원 소개
│   │   ├── page.tsx
│   │   └── contact.module.css
│   │
│   ├── api/                      # Next.js API Routes (서버)
│   │   ├── parking/
│   │   │   └── route.ts          # 공공 API + Supabase 주차장 통합 검색
│   │   ├── geocode/
│   │   │   └── route.ts          # 주소 → 위경도 변환 (카카오 or 카카오 API)
│   │   ├── recommend/
│   │   │   └── route.ts          # Gemini AI 주차장 추천 (룰 기반 폴백 포함)
│   │   ├── posts/
│   │   │   ├── route.ts          # GET(목록) / POST(작성) — community_posts 테이블
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET(상세+조회수증가) / DELETE — community_posts
│   │   ├── comments/
│   │   │   └── route.ts          # GET / POST / DELETE — community_comments 테이블
│   │   └── community-parkings/
│   │       ├── route.ts          # GET(목록) / POST(등록) — community_parkings 테이블
│   │       └── [id]/
│   │           └── route.ts      # GET / PATCH(추천투표) / DELETE
│   │
│   └── lib/                      # 공통 유틸리티
│       ├── supabase.ts           # Supabase 클라이언트 싱글턴
│       ├── types.ts              # 공통 TypeScript 인터페이스
│       └── storage.ts            # localStorage 유틸 (즐겨찾기·주차위치)
│
├── public/                       # 정적 파일
├── supabase-schema.sql           # Supabase 테이블 DDL + RLS 정책 (SQL Editor용)
├── AI_USAGE.md                   # AI 활용 보고서
├── ParkingMate_PRD.md            # 서비스 기획서
├── package.json
└── tsconfig.json
```

---

## 🗄 Supabase DB 테이블 구조

```
community_parkings      ← 동네 주차장 등록 정보
  └── reviews           ← 주차장 별점 후기 (parking_id FK)
  └── votes             ← 추천/비추천 중복 방지 (parking_id FK)

community_posts         ← 커뮤니티 게시글
  └── community_comments ← 게시글 댓글 (post_id FK)
```

> 전체 DDL은 [`supabase-schema.sql`](./supabase-schema.sql)을 Supabase 대시보드 > SQL Editor에서 실행하세요.

---

## ⚙️ 로컬 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env` 파일을 프로젝트 루트에 생성합니다:

```env
# 공공데이터 포털 API 키 (국토교통부 전국주차장정보표준데이터)
DATA_GO_KR_API_KEY=your_api_key_here

# Google Gemini AI API 키
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase 연결 정보
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Supabase 테이블 초기화

Supabase 대시보드 > SQL Editor에서 `supabase-schema.sql` 전체 내용을 실행합니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)에 접속합니다.

---

## 🧭 페이지 라우팅

| URL | 페이지 |
|-----|--------|
| `/` | 홈 (주차장 찾기 검색 폼) |
| `/results?destination=...` | 주차장 검색 결과 |
| `/register` | 동네 주차장 등록 |
| `/community` | 커뮤니티 게시판 |
| `/favorites` | 단골 주차장 (즐겨찾기) |
| `/parking-location` | 주차 위치 찾기 |
| `/about` | 서비스 소개 |
| `/contact` | 팀원 소개 |

---

## 🔌 API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/parking` | 주차장 검색 (공공 API + Supabase 통합) |
| `GET` | `/api/geocode` | 주소 → 위경도 변환 |
| `POST` | `/api/recommend` | Gemini AI 주차장 추천 |
| `GET` | `/api/posts` | 커뮤니티 게시글 목록 |
| `POST` | `/api/posts` | 커뮤니티 게시글 작성 |
| `GET` | `/api/posts/[id]` | 게시글 상세 (조회수 증가) |
| `DELETE` | `/api/posts/[id]` | 게시글 삭제 |
| `POST` | `/api/comments` | 댓글 작성 |
| `DELETE` | `/api/comments?id=` | 댓글 삭제 |
| `GET` | `/api/community-parkings` | 등록된 공유 주차장 목록 |
| `POST` | `/api/community-parkings` | 공유 주차장 등록 |
| `PATCH` | `/api/community-parkings/[id]` | 추천/비추천 투표 |
| `DELETE` | `/api/community-parkings/[id]` | 공유 주차장 삭제 |

---

## 👥 팀원

| 이름 | 역할 |
|------|------|
| 박민준 | Frontend — 홈 검색 UI, 결과 페이지, Leaflet 지도 |
| 이채민 | Backend — 주차장 데이터 처리, API Routes, 거리·요금 계산 |
| 김건 | AI Integration — Gemini API 연동, 추천 프롬프트 설계, 폴백 로직 |
| 서은서 | DB & Infra — Supabase 설계, 커뮤니티 기능, Vercel 배포 |

---

## 📄 라이선스

본 프로젝트는 학습 목적으로 제작된 과제물입니다.  
공공데이터 API: [공공데이터포털](https://www.data.go.kr) 제공 데이터 활용
