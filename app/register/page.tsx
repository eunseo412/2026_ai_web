'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ParkingSquare, ThumbsUp, ThumbsDown, Star, Upload, Plus, Trash2,
  Clock, DollarSign, Users, Phone, ChevronDown, ChevronUp, MessageSquare
} from 'lucide-react';
import {
  getCommunityParkings, saveCommunityParking, deleteCommunityParking, generateId
} from '../lib/storage';
import { CommunityParking, ParkingReview } from '../lib/types';
import styles from './register.module.css';

// ---- 등록 폼 초기값 ----
const emptyForm = {
  title: '',
  address: '',
  description: '',
  availableTime: '',
  hourlyRate: '',
  monthlyRate: '',
  capacity: '',
  contactMethod: '',
};

export default function RegisterPage() {
  const [parkings, setParkings] = useState<CommunityParking[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewForms, setReviewForms] = useState<Record<string, { author: string; rating: number; comment: string }>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  // 로드
  useEffect(() => {
    setParkings(getCommunityParkings());
  }, []);

  // 이미지 업로드
  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImageDataUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  // 등록
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.address) return;
    setSubmitting(true);
    const newParking: CommunityParking = {
      id: generateId(),
      title: form.title,
      address: form.address,
      description: form.description,
      availableTime: form.availableTime,
      hourlyRate: Number(form.hourlyRate) || 0,
      monthlyRate: Number(form.monthlyRate) || 0,
      capacity: Number(form.capacity) || 1,
      contactMethod: form.contactMethod,
      imageDataUrl,
      likes: 0,
      dislikes: 0,
      reviews: [],
      promoted: false,
      createdAt: new Date().toISOString(),
    };
    saveCommunityParking(newParking);
    setParkings(getCommunityParkings());
    setForm(emptyForm);
    setImageDataUrl(undefined);
    setShowForm(false);
    setSubmitting(false);
  }

  // 추천/비추천
  function handleVote(id: string, type: 'like' | 'dislike') {
    const list = getCommunityParkings();
    const p = list.find(x => x.id === id);
    if (!p) return;
    if (type === 'like') p.likes += 1;
    else p.dislikes += 1;
    p.promoted = p.likes >= 50;
    saveCommunityParking(p);
    setParkings(getCommunityParkings());
  }

  // 후기 제출
  function handleReview(id: string) {
    const rf = reviewForms[id];
    if (!rf || !rf.author || !rf.comment) return;
    const list = getCommunityParkings();
    const p = list.find(x => x.id === id);
    if (!p) return;
    const review: ParkingReview = {
      id: generateId(),
      author: rf.author,
      rating: rf.rating || 5,
      comment: rf.comment,
      createdAt: new Date().toISOString(),
    };
    p.reviews.push(review);
    saveCommunityParking(p);
    setParkings(getCommunityParkings());
    setReviewForms(prev => ({ ...prev, [id]: { author: '', rating: 5, comment: '' } }));
  }

  function handleDelete(id: string) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    deleteCommunityParking(id);
    setParkings(getCommunityParkings());
  }

  function avgRating(reviews: ParkingReview[]) {
    if (!reviews.length) return 0;
    return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  }

  return (
    <div className={styles.page}>
      {/* 상단 헤더 */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            <ParkingSquare size={28} />
            내 주차장 등록
          </h1>
          <p className={styles.pageSubtitle}>
            빌라 앞 공터, 상가 뒤 공간 등 실생활 주차 공간을 공유해 보세요.
            추천 50개 이상 시 검색 결과에도 노출됩니다.
          </p>
        </div>
        <button className={styles.primaryBtn} onClick={() => setShowForm(v => !v)}>
          <Plus size={16} />
          {showForm ? '닫기' : '장소 등록하기'}
        </button>
      </div>

      {/* 등록 폼 */}
      {showForm && (
        <form className={styles.card} onSubmit={handleSubmit}>
          <h2 className={styles.cardTitle}>새 주차 공간 등록</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>장소명 *</label>
              <input
                className={styles.input}
                required
                placeholder="예: 강남구 역삼동 빌라 앞 공터"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>주소 *</label>
              <input
                className={styles.input}
                required
                placeholder="상세 주소를 입력하세요"
                value={form.address}
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              />
            </div>
            <div className={styles.formGroupFull}>
              <label className={styles.label}>상세 설명</label>
              <textarea
                className={styles.textarea}
                rows={3}
                placeholder="주차 방법, 진입 경로, 주의사항 등을 자유롭게 작성하세요."
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}><Clock size={14} /> 공유 가능 시간</label>
              <input
                className={styles.input}
                placeholder="예: 평일 19:00~08:00, 주말 전일"
                value={form.availableTime}
                onChange={e => setForm(p => ({ ...p, availableTime: e.target.value }))}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}><DollarSign size={14} /> 시간당 요금 (원)</label>
              <input
                className={styles.input}
                type="number"
                min={0}
                placeholder="0 입력 시 무료"
                value={form.hourlyRate}
                onChange={e => setForm(p => ({ ...p, hourlyRate: e.target.value }))}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}><DollarSign size={14} /> 월 이용 요금 (원)</label>
              <input
                className={styles.input}
                type="number"
                min={0}
                placeholder="0 입력 시 없음"
                value={form.monthlyRate}
                onChange={e => setForm(p => ({ ...p, monthlyRate: e.target.value }))}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}><Users size={14} /> 주차 가능 대수</label>
              <input
                className={styles.input}
                type="number"
                min={1}
                placeholder="1"
                value={form.capacity}
                onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}><Phone size={14} /> 연락 방법</label>
              <input
                className={styles.input}
                placeholder="전화, 카카오톡 오픈채팅 링크 등"
                value={form.contactMethod}
                onChange={e => setForm(p => ({ ...p, contactMethod: e.target.value }))}
              />
            </div>
            <div className={styles.formGroupFull}>
              <label className={styles.label}><Upload size={14} /> 사진 업로드</label>
              <div className={styles.uploadArea} onClick={() => fileRef.current?.click()}>
                {imageDataUrl
                  ? <img src={imageDataUrl} alt="업로드된 사진" className={styles.uploadPreview} />
                  : <span>클릭하여 사진 선택</span>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
            </div>
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryBtn} disabled={submitting}>
              {submitting ? '등록 중...' : '등록하기'}
            </button>
            <button type="button" className={styles.ghostBtn} onClick={() => setShowForm(false)}>
              취소
            </button>
          </div>
        </form>
      )}

      {/* 승격 안내 배너 */}
      <div className={styles.promoteBanner}>
        <span style={{ fontSize: '1.2rem' }}>🚀</span>
        <div>
          <strong>승격 시스템</strong>
          <p>추천 수 50개 이상 시 공식 주차장 검색 결과에도 노출됩니다!</p>
        </div>
      </div>

      {/* 등록된 장소 목록 */}
      {parkings.length === 0 ? (
        <div className={styles.emptyState}>
          <ParkingSquare size={48} style={{ color: 'var(--text-light)', marginBottom: '12px' }} />
          <p>아직 등록된 주차 공간이 없습니다.</p>
          <p>첫 번째로 공유해 보세요!</p>
        </div>
      ) : (
        <div className={styles.listGrid}>
          {parkings.map(p => {
            const isExpanded = expandedId === p.id;
            const rf = reviewForms[p.id] || { author: '', rating: 5, comment: '' };
            return (
              <div key={p.id} className={`${styles.card} ${p.promoted ? styles.promotedCard : ''}`}>
                {p.promoted && <div className={styles.promotedBadge}>🏆 검색 결과 노출 중</div>}
                {p.imageDataUrl && (
                  <img src={p.imageDataUrl} alt={p.title} className={styles.cardImage} />
                )}
                <div className={styles.cardBody}>
                  <div className={styles.cardTitleRow}>
                    <h3 className={styles.cardTitle}>{p.title}</h3>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(p.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className={styles.cardAddress}>📍 {p.address}</p>
                  {p.description && <p className={styles.cardDesc}>{p.description}</p>}

                  <div className={styles.cardMeta}>
                    {p.availableTime && <span><Clock size={13} /> {p.availableTime}</span>}
                    {p.hourlyRate > 0 && <span><DollarSign size={13} /> 시간당 {p.hourlyRate.toLocaleString()}원</span>}
                    {p.monthlyRate > 0 && <span><DollarSign size={13} /> 월 {p.monthlyRate.toLocaleString()}원</span>}
                    {p.capacity && <span><Users size={13} /> {p.capacity}대</span>}
                    {p.contactMethod && <span><Phone size={13} /> {p.contactMethod}</span>}
                  </div>

                  {/* 별점 & 추천 수 */}
                  <div className={styles.statsRow}>
                    <span className={styles.ratingBadge}>
                      <Star size={13} fill="currentColor" /> {avgRating(p.reviews)} ({p.reviews.length}개 후기)
                    </span>
                    <span>등록일: {new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* 추천/비추천 */}
                  <div className={styles.voteRow}>
                    <button className={styles.likeBtn} onClick={() => handleVote(p.id, 'like')}>
                      <ThumbsUp size={15} /> 추천 {p.likes}
                    </button>
                    <button className={styles.dislikeBtn} onClick={() => handleVote(p.id, 'dislike')}>
                      <ThumbsDown size={15} /> 비추천 {p.dislikes}
                    </button>
                  </div>

                  {/* 후기 토글 */}
                  <button
                    className={styles.ghostBtn}
                    style={{ width: '100%', marginTop: '8px' }}
                    onClick={() => setExpandedId(isExpanded ? null : p.id)}
                  >
                    <MessageSquare size={14} />
                    후기 {p.reviews.length}개
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {/* 후기 목록 */}
                  {isExpanded && (
                    <div className={styles.reviewSection}>
                      {p.reviews.map(r => (
                        <div key={r.id} className={styles.reviewItem}>
                          <div className={styles.reviewHeader}>
                            <strong>{r.author}</strong>
                            <span className={styles.reviewRating}>
                              {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                            </span>
                            <span className={styles.reviewDate}>
                              {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className={styles.reviewComment}>{r.comment}</p>
                        </div>
                      ))}

                      {/* 후기 작성 폼 */}
                      <div className={styles.reviewForm}>
                        <h4>후기 작성</h4>
                        <input
                          className={styles.input}
                          placeholder="닉네임"
                          value={rf.author}
                          onChange={e => setReviewForms(prev => ({
                            ...prev, [p.id]: { ...rf, author: e.target.value }
                          }))}
                        />
                        <select
                          className={styles.input}
                          value={rf.rating}
                          onChange={e => setReviewForms(prev => ({
                            ...prev, [p.id]: { ...rf, rating: Number(e.target.value) }
                          }))}
                        >
                          {[5, 4, 3, 2, 1].map(n => (
                            <option key={n} value={n}>{'★'.repeat(n)} {n}점</option>
                          ))}
                        </select>
                        <textarea
                          className={styles.textarea}
                          rows={2}
                          placeholder="이용 후기를 남겨주세요."
                          value={rf.comment}
                          onChange={e => setReviewForms(prev => ({
                            ...prev, [p.id]: { ...rf, comment: e.target.value }
                          }))}
                        />
                        <button
                          className={styles.primaryBtn}
                          onClick={() => handleReview(p.id)}
                          type="button"
                        >
                          후기 등록
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
