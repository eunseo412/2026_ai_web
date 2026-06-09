// =========================================
// ParkingMate - localStorage 유틸리티 (즐겨찾기, 주차위치)
// =========================================

import {
  CommunityParking,
  CommunityPost,
  FavoriteParking,
  SavedParkingLocation
} from './types';

// ---- 키 상수 ----
const KEYS = {
  COMMUNITY_PARKINGS: 'pm_community_parkings',
  COMMUNITY_POSTS:    'pm_community_posts',
  FAVORITES:          'pm_favorites',
  SAVED_LOCATIONS:    'pm_saved_locations',
} as const;

// ---- 제네릭 읽기/쓰기 ----
function readStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch { /* 용량 초과 등 무시 */ }
}

// ---- CommunityParking (동네 주차장 등록) ----
export function getCommunityParkings(): CommunityParking[] {
  return readStorage<CommunityParking>(KEYS.COMMUNITY_PARKINGS);
}

export function saveCommunityParking(parking: CommunityParking): void {
  const list = getCommunityParkings();
  const idx = list.findIndex(p => p.id === parking.id);
  if (idx >= 0) list[idx] = parking;
  else list.unshift(parking);
  writeStorage(KEYS.COMMUNITY_PARKINGS, list);
}

export function deleteCommunityParking(id: string): void {
  const list = getCommunityParkings().filter(p => p.id !== id);
  writeStorage(KEYS.COMMUNITY_PARKINGS, list);
}

export function getCommunityParkingById(id: string): CommunityParking | null {
  return getCommunityParkings().find(p => p.id === id) ?? null;
}

// ---- CommunityPost ----
export function getCommunityPosts(): CommunityPost[] {
  return readStorage<CommunityPost>(KEYS.COMMUNITY_POSTS);
}

export function saveCommunityPost(post: CommunityPost): void {
  const list = getCommunityPosts();
  const idx = list.findIndex(p => p.id === post.id);
  if (idx >= 0) list[idx] = post;
  else list.unshift(post);
  writeStorage(KEYS.COMMUNITY_POSTS, list);
}

export function deleteCommunityPost(id: string): void {
  const list = getCommunityPosts().filter(p => p.id !== id);
  writeStorage(KEYS.COMMUNITY_POSTS, list);
}

// ---- FavoriteParking ----
export function getFavorites(): FavoriteParking[] {
  return readStorage<FavoriteParking>(KEYS.FAVORITES);
}

export function addFavorite(parking: FavoriteParking): void {
  const list = getFavorites();
  if (list.some(f => f.id === parking.id)) return;
  list.unshift(parking);
  writeStorage(KEYS.FAVORITES, list);
}

export function removeFavorite(id: string): void {
  const list = getFavorites().filter(f => f.id !== id);
  writeStorage(KEYS.FAVORITES, list);
}

export function isFavorite(id: string): boolean {
  return getFavorites().some(f => f.id === id);
}

// ---- SavedParkingLocation ----
export function getSavedLocations(): SavedParkingLocation[] {
  return readStorage<SavedParkingLocation>(KEYS.SAVED_LOCATIONS);
}

export function saveLocation(loc: SavedParkingLocation): void {
  const list = getSavedLocations();
  list.unshift(loc);
  writeStorage(KEYS.SAVED_LOCATIONS, list);
}

export function deleteLocation(id: string): void {
  const list = getSavedLocations().filter(l => l.id !== id);
  writeStorage(KEYS.SAVED_LOCATIONS, list);
}

// ---- ID 생성 유틸 ----
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
