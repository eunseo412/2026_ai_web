// =========================================
// ParkingMate - localStorage 유틸리티
// 즐겨찾기(FavoriteParking), 주차위치(SavedParkingLocation) 전용
// =========================================

import { FavoriteParking, SavedParkingLocation } from './types';

// ---- 키 상수 ----
const KEYS = {
  FAVORITES:       'pm_favorites',
  SAVED_LOCATIONS: 'pm_saved_locations',
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

// ---- FavoriteParking (단골 주차장) ----
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

// ---- SavedParkingLocation (주차 위치 찾기) ----
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
