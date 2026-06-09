'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ParkingSquare, Plus, Clock, DollarSign, Users, Phone, ArrowRight, CheckCircle2
} from 'lucide-react';
import { CommunityParking } from '../lib/types';
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
  const router = useRouter();
  const [parkings, setParkings] = useState<CommunityParking[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // DB에서 등록 목록 로드
  const fetchParkings = async () => {
    setLoadingList(true);
    try {
      const res = await fetch('/api/community-parkings');
      if (res.ok) {
        const data = await res.json();
        setParkings(data.parkings || []);
      }
    } catch (err) {
      console.error('Failed to fetch parkings:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchParkings();
  }, []);

  // 등록
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.address) return;
    setSubmitting(true);
    setSuccessMsg('');

    try {
      // 1. 주소 지오코딩 수행
      const geoRes = await fetch(`/api/geocode?q=${encodeURIComponent(form.address)}`);
      let lat = 37.5559;
      let lng = 126.9723;
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.lat && geoData.lng) {
          lat = geoData.lat;
          lng = geoData.lng;
        }
      }

      // 2. DB에 저장
      const res = await fetch('/api/community-parkings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          address: form.address,
          description: form.description,
          available_time: form.availableTime,
          hourly_rate: Number(form.hourlyRate) || 0,
          monthly_rate: Number(form.monthlyRate) || 0,
          capacity: Number(form.capacity) || 1,
          contact_method: form.contactMethod,
          lat,
          lng,
          author: '사용자',
        }),
      });

      if (res.ok) {
        setSuccessMsg('🎉 주차장이 성공적으로 공유 등록되었으며, 커뮤니티에 소개 글이 자동 발행되었습니다!');
        setForm(emptyForm);
        setShowForm(false);
        fetchParkings();
        // 6초 후 성공메시지 자동 제거
        setTimeout(() => setSuccessMsg(''), 6000);
      } else {
        const errData = await res.json();
        alert(`등록 실패: ${errData.error || '알 수 없는 오류'}`);
      }
    } catch (err: any) {
      console.error(err);
      alert('등록 중 에러가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* 상단 헤더 */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            <ParkingSquare size={28} />
            동네 주차장 등록
          </h1>
          <p className={styles.pageSubtitle}>
            빌라 앞 공터, 상가 뒤 공간 등 실생활 주차 공간을 공유해 보세요.
            등록 시 자동으로 커뮤니티 글이 발행되며, 추천 50개 이상 시 공식 주차장으로 승격됩니다!
          </p>
        </div>
        <button className={styles.primaryBtn} onClick={() => setShowForm(v => !v)}>
          <Plus size={16} />
          {showForm ? '닫기' : '장소 등록하기'}
        </button>
      </div>

      {successMsg && (
        <div className={styles.promoteBanner} style={{ backgroundColor: 'var(--bg-success-light)', border: '1px solid var(--color-success)', color: 'var(--color-success)' }}>
          <CheckCircle2 size={20} />
          <div style={{ flex: 1 }}>
            <strong>등록 완료!</strong>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>{successMsg}</p>
          </div>
          <button 
            className={styles.ghostBtn} 
            style={{ fontSize: '0.8rem', padding: '4px 8px', color: 'var(--color-success)' }}
            onClick={() => router.push('/community')}
          >
            커뮤니티 글 확인하러 가기 <ArrowRight size={12} />
          </button>
        </div>
      )}

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
                placeholder="상세 주소를 입력하세요 (지도 검색 및 계산에 사용됩니다)"
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
          <strong>사용자 평판 승격 시스템</strong>
          <p>등록 후 커뮤니티 페이지에서 추천 50개 이상을 달성하면, "주차장 찾기" 공식 지도 및 결과 리스트에 [커뮤니티 인증] 주차장으로 노출됩니다!</p>
        </div>
      </div>

      {/* 등록된 장소 목록 */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 12px' }}>등록된 공유 주차장 목록 ({parkings.length}개)</h2>
      {loadingList ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
          데이터 로딩 중...
        </div>
      ) : parkings.length === 0 ? (
        <div className={styles.emptyState}>
          <ParkingSquare size={48} style={{ color: 'var(--text-light)', marginBottom: '12px' }} />
          <p>아직 등록된 주차 공간이 없습니다.</p>
          <p>첫 번째로 공유해 보세요!</p>
        </div>
      ) : (
        <div className={styles.listGrid}>
          {parkings.map(p => {
            return (
              <div key={p.id} className={`${styles.card} ${p.promoted ? styles.promotedCard : ''}`}>
                {p.promoted && <div className={styles.promotedBadge}>🏆 공식 주차장 승격 완료</div>}
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{p.title}</h3>
                  <p className={styles.cardAddress}>📍 {p.address}</p>
                  {p.description && <p className={styles.cardDesc}>{p.description}</p>}

                  <div className={styles.cardMeta}>
                    {p.available_time && <span><Clock size={13} /> {p.available_time}</span>}
                    {p.hourly_rate > 0 && <span><DollarSign size={13} /> 시간당 {p.hourly_rate.toLocaleString()}원</span>}
                    {p.monthly_rate > 0 && <span><DollarSign size={13} /> 월 {p.monthly_rate.toLocaleString()}원</span>}
                    {p.capacity && <span><Users size={13} /> {p.capacity}대 가능</span>}
                    {p.contact_method && <span><Phone size={13} /> {p.contact_method}</span>}
                  </div>

                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                      추천: {p.likes} | 비추천: {p.dislikes}
                    </span>
                    <button
                      className={styles.ghostBtn}
                      style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                      onClick={() => router.push('/community?tab=parking')}
                    >
                      커뮤니티에서 추천 & 후기 보기
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
