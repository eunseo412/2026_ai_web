'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  MessageSquare, Eye, Plus, Send, Trash2, ChevronLeft, Clock,
  ThumbsUp, ThumbsDown, Star, Phone, Users, MapPin, AlertCircle, ParkingSquare
} from 'lucide-react';
import { CommunityParking, CommunityPost, Review } from '../lib/types';
import styles from './community.module.css';

// 닉네임 로컬 세션
function getSessionUser(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('pm_username') || '';
}

// 투표 세션 키 생성 유틸
function getSessionKey(): string {
  if (typeof window === 'undefined') return 'temp-key';
  let key = localStorage.getItem('pm_vote_session_key');
  if (!key) {
    key = `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem('pm_vote_session_key', key);
  }
  return key;
}

function CommunityContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 탭 상태: 'parking' | 'review'
  const [activeTab, setActiveTab] = useState<'parking' | 'review'>('parking');

  // 데이터 상태
  const [parkings, setParkings] = useState<CommunityParking[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);

  // 뷰 상태: 'list' | 'detail' | 'write'
  const [view, setView] = useState<'list' | 'detail' | 'write'>('list');

  // 선택된 상세 데이터
  const [selectedParking, setSelectedParking] = useState<CommunityParking | null>(null);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [linkedPosts, setLinkedPosts] = useState<CommunityPost[]>([]); // 주차장 관련 커뮤니티 글 목록

  // 유저 정보
  const [username, setUsername] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState('');

  // 탭2 글쓰기 폼
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [selectedParkingId, setSelectedParkingId] = useState<string>(''); // 선택된 주차장 ID
  const [manualAddress, setManualAddress] = useState(''); // 수동 주소 입력

  // 댓글/후기 폼
  const [commentText, setCommentText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [votedMsg, setVotedMsg] = useState('');

  // 탭 쿼리 처리
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'review') {
      setActiveTab('review');
    } else {
      setActiveTab('parking');
    }
  }, [searchParams]);

  // 로그인 상태 로드
  useEffect(() => {
    const saved = getSessionUser();
    if (saved) {
      setUsername(saved);
      setLoggedIn(true);
    }
  }, []);

  // 활성 탭 데이터 로드
  useEffect(() => {
    setView('list');
    setSelectedParking(null);
    setSelectedPost(null);
    setLinkedPosts([]);

    if (activeTab === 'parking') {
      loadParkings();
    } else {
      loadPosts();
    }
  }, [activeTab]);

  // 주차장 목록 불러오기
  const loadParkings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/community-parkings');
      if (res.ok) {
        const data = await res.json();
        setParkings(data.parkings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 일반 후기 게시글 목록 불러오기
  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts?category=review');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 로그인 처리
  function handleLogin() {
    if (!loginInput.trim()) return;
    setUsername(loginInput.trim());
    setLoggedIn(true);
    localStorage.setItem('pm_username', loginInput.trim());
    setLoginInput('');
  }

  // 로그아웃 처리
  function handleLogout() {
    setUsername('');
    setLoggedIn(false);
    localStorage.removeItem('pm_username');
    setView('list');
  }

  // 탭1: 주차장 상세 보기
  const openParkingDetail = async (id: string) => {
    setLoading(true);
    setVotedMsg('');
    try {
      // 1. 주차장 데이터 로드 (후기 목록 포함)
      const res = await fetch(`/api/community-parkings/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedParking(data.parking);

        // 2. 이 주차장과 연동된 커뮤니티 후기글 목록 불러오기 (Section 6: 주차장별 후기 모아보기)
        const postsRes = await fetch(`/api/posts?category=review&parking_id=${id}`);
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setLinkedPosts(postsData.posts || []);
        }
        setView('detail');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 탭2: 일반 게시글 상세 보기 (조회수 증가 포함)
  const openPostDetail = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedPost(data.post);
        setView('detail');
        if (activeTab === 'review') {
          loadPosts(); // 조회수 목록 갱신
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 추천/비추천 처리 (커뮤니티 상세 내에서 수행)
  const handleVote = async (voteType: 'like' | 'dislike') => {
    if (!selectedParking) return;
    setVotedMsg('');
    try {
      const session_key = getSessionKey();
      const res = await fetch(`/api/community-parkings/${selectedParking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote: voteType, session_key })
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedParking(data.parking);
        setVotedMsg(voteType === 'like' ? '추천되었습니다! 👍' : '비추천되었습니다! 👎');
        loadParkings();
      } else if (res.status === 409) {
        setVotedMsg('이미 이 주차장에 투표하셨습니다. ⚠️');
      } else {
        alert('투표 처리 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 후기 등록 (탭1 주차장 상세)
  const handleAddReview = async () => {
    if (!selectedParking || !reviewComment.trim()) return;
    const authorName = loggedIn ? username : '익명';
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parking_id: selectedParking.id,
          author: authorName,
          rating: reviewRating,
          comment: reviewComment,
        })
      });

      if (res.ok) {
        setReviewComment('');
        setReviewRating(5);
        openParkingDetail(selectedParking.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 탭2 일반 게시글 등록
  const handleWritePost = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      // 주차장이 선택된 경우 또는 수동 주소가 있는 경우 내용을 보강하거나 연결
      let parkingId = selectedParkingId ? selectedParkingId : null;
      let finalContent = newContent;

      if (!parkingId && manualAddress.trim()) {
        finalContent = `📍 입력된 관련 주소: ${manualAddress}\n\n${newContent}`;
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'review',
          parking_id: parkingId,
          title: newTitle,
          content: finalContent,
          author: username || '익명',
        })
      });

      if (res.ok) {
        setNewTitle('');
        setNewContent('');
        setSelectedParkingId('');
        setManualAddress('');
        setView('list');
        loadPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 댓글 등록 (탭2 일반 게시글 상세)
  const handleAddComment = async () => {
    if (!selectedPost || !commentText.trim()) return;
    const authorName = loggedIn ? username : '익명';
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: selectedPost.id,
          author: authorName,
          content: commentText,
        })
      });

      if (res.ok) {
        setCommentText('');
        openPostDetail(selectedPost.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/comments?id=${commentId}`, { method: 'DELETE' });
      if (res.ok && selectedPost) {
        openPostDetail(selectedPost.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 게시글 삭제 (탭2)
  const handleDeletePost = async (id: string) => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setView('list');
        loadPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  function formatDate(iso: string) {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  }

  // 별점 평균 표시 유틸
  function getAvgRating(reviewsList?: Review[]) {
    if (!reviewsList || reviewsList.length === 0) return '0.0';
    const sum = reviewsList.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviewsList.length).toFixed(1);
  }

  return (
    <div className={styles.page}>
      {/* 상단 헤더 */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}><MessageSquare size={28} /> 커뮤니티</h1>
          <p className={styles.pageSubtitle}>공유 주차장 정보를 확인하고 주차 생생 후기를 공유하세요.</p>
        </div>

        {/* 닉네임 로그인 영역 */}
        <div className={styles.authArea}>
          {loggedIn ? (
            <div className={styles.loggedIn}>
              <span className={styles.userBadge}>👤 {username}</span>
              <button className={styles.ghostBtn} onClick={handleLogout}>로그아웃</button>
              {activeTab === 'review' && view === 'list' && (
                <button 
                  className={styles.primaryBtn} 
                  onClick={() => {
                    setView('write');
                    // 글쓰기 시 주차장 선택 목록용으로 로드
                    loadParkings();
                  }}
                >
                  <Plus size={15} /> 후기 글쓰기
                </button>
              )}
            </div>
          ) : (
            <div className={styles.loginRow}>
              <input
                className={styles.input}
                placeholder="닉네임 입력"
                value={loginInput}
                onChange={e => setLoginInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{ maxWidth: '140px' }}
              />
              <button className={styles.primaryBtn} onClick={handleLogin}>참여하기</button>
            </div>
          )}
        </div>
      </div>

      {/* 2개 탭 구조 */}
      {view === 'list' && (
        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'parking' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('parking')}
          >
            🚗 공유 주차장
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'review' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('review')}
          >
            ✍️ 주차장 후기 게시판
          </button>
        </div>
      )}

      {/* 1. 글쓰기 뷰 (탭2 주차장 후기 게시판 전용) */}
      {view === 'write' && activeTab === 'review' && (
        <div className={styles.card}>
          <button className={styles.backBtn} onClick={() => setView('list')}>
            <ChevronLeft size={16} /> 목록으로
          </button>
          <h2 className={styles.cardTitle}>새 후기 게시글 작성</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                제목 *
              </label>
              <input
                className={styles.input}
                placeholder="예: 서울역 서부 주차 후기 공유합니다"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
            </div>

            {/* 주차장 선택 또는 주소 입력 (Section 5) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                  공유 주차장 연동 선택
                </label>
                <select
                  className={styles.input}
                  value={selectedParkingId}
                  onChange={e => {
                    setSelectedParkingId(e.target.value);
                    if (e.target.value) setManualAddress('');
                  }}
                >
                  <option value="">-- 주차장 선택 안 함 --</option>
                  {parkings.map(p => (
                    <option key={p.id} value={p.id}>{p.title} ({p.address})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                  또는 주소 직접 입력
                </label>
                <input
                  className={styles.input}
                  placeholder="예: 부산시 동구 초량동..."
                  value={manualAddress}
                  disabled={!!selectedParkingId}
                  onChange={e => setManualAddress(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                본문 내용 *
              </label>
              <textarea
                className={styles.textarea}
                rows={8}
                placeholder="상세한 후기를 남겨주세요. 요금 대비 서비스, 입출차 편의성, 혼잡도 정보를 공유하면 큰 도움이 됩니다."
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button className={styles.primaryBtn} onClick={handleWritePost}>게시하기</button>
            <button className={styles.ghostBtn} onClick={() => setView('list')}>취소</button>
          </div>
        </div>
      )}

      {/* 2. 리스트 뷰 */}
      {view === 'list' && (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              로딩 중입니다...
            </div>
          ) : activeTab === 'parking' ? (
            /* 탭1: 공유 주차장 목록 */
            <div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                💡 동네 주차장 등록 페이지에서 추가된 실생활 공유 주차 공간들입니다. 클릭하여 상세 정보와 평가를 확인하세요.
              </p>
              {parkings.length === 0 ? (
                <div className={styles.emptyState}>
                  <ParkingSquare size={48} style={{ color: 'var(--text-light)', marginBottom: '12px' }} />
                  <p>등록된 공유 주차장이 없습니다. '동네 주차장 등록' 메뉴에서 등록해 보세요!</p>
                </div>
              ) : (
                <div className={styles.parkingGrid}>
                  {parkings.map(p => (
                    <div 
                      key={p.id} 
                      className={`${styles.parkingCard} ${p.promoted ? styles.promotedCard : ''}`}
                      onClick={() => openParkingDetail(p.id)}
                    >
                      <div>
                        {p.promoted && (
                          <div className={styles.promotedBadge} style={{ marginBottom: '8px' }}>
                            🏆 [커뮤니티 인증] 주차장 찾기 노출 중
                          </div>
                        )}
                        <h3 className={styles.parkingTitle}>{p.title}</h3>
                        <p className={styles.parkingAddress}>📍 {p.address}</p>
                        
                        <div className={styles.parkingMeta}>
                          {p.available_time && <span>🕐 가능시간: {p.available_time}</span>}
                          <span>💰 시간당 요금: {p.hourly_rate > 0 ? `${p.hourly_rate.toLocaleString()}원` : '무료'}</span>
                        </div>
                      </div>

                      <div className={styles.parkingFooter}>
                        <div className={styles.parkingStats}>
                          <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>👍 {p.likes}</span>
                          <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>👎 {p.dislikes}</span>
                          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>💬 후기 {p.reviews?.length || 0}</span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                          {formatDate(p.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* 탭2: 주차장 후기 게시판 목록 */
            <div className={styles.card} style={{ padding: '20px' }}>
              {!loggedIn && (
                <div className={styles.loginNotice}>
                  💡 닉네임을 설정하고 참여하시면 생생한 주차 후기를 작성할 수 있습니다.
                </div>
              )}

              {posts.length === 0 ? (
                <div className={styles.emptyState}>
                  <MessageSquare size={48} style={{ color: 'var(--text-light)', marginBottom: '12px' }} />
                  <p>아직 등록된 후기 글이 없습니다. 첫 번째 글을 작성해 보세요!</p>
                </div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>제목</th>
                      <th className={styles.th}>작성자</th>
                      <th className={styles.th}>작성일</th>
                      <th className={styles.th} style={{ textAlign: 'center' }}><Eye size={13} /></th>
                      <th className={styles.th} style={{ textAlign: 'center' }}><MessageSquare size={13} /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map(post => (
                      <tr key={post.id} className={styles.tr} onClick={() => openPostDetail(post.id)}>
                        <td className={styles.tdTitle}>
                          {post.title}
                          {post.parking_id && (
                            <span 
                              style={{ 
                                marginLeft: '8px', 
                                fontSize: '0.75rem', 
                                padding: '2px 6px', 
                                borderRadius: '4px', 
                                background: 'var(--bg-success-light)', 
                                color: 'var(--color-success)',
                                fontWeight: 700
                              }}
                            >
                              🔑 주차장 연동
                            </span>
                          )}
                        </td>
                        <td className={styles.td}>{post.author}</td>
                        <td className={styles.td}>{formatDate(post.created_at)}</td>
                        <td className={styles.td} style={{ textAlign: 'center' }}>{post.views}</td>
                        <td className={styles.td} style={{ textAlign: 'center' }}>{post.comments?.length || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {/* 3. 상세 뷰 */}
      {view === 'detail' && (
        <>
          {activeTab === 'parking' && selectedParking ? (
            /* 탭1 주차장 상세 뷰 */
            <div className={styles.card}>
              <button className={styles.backBtn} onClick={() => setView('list')}>
                <ChevronLeft size={16} /> 목록으로
              </button>

              <div className={styles.postHeader}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <h2 className={styles.postTitle} style={{ margin: 0 }}>[공유주차장] {selectedParking.title}</h2>
                  {selectedParking.promoted && (
                    <span style={{ background: 'var(--bg-warning-light)', color: 'var(--color-warning)', padding: '4px 10px', borderRadius: '50px', fontSize: '0.78rem', fontWeight: 700 }}>
                      🏆 공식 승격됨
                    </span>
                  )}
                </div>
                <div className={styles.postMeta}>
                  <span>📍 {selectedParking.address}</span>
                  <span>👤 등록자: {selectedParking.author}</span>
                  <span>📅 등록일: {formatDate(selectedParking.created_at)}</span>
                </div>
              </div>

              {/* 주차장 상세 스펙 */}
              <div className={styles.detailGrid}>
                {/* 왼쪽 컬럼: 기본스펙 + 평판 투표 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>주차장 상세 정보</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
                      {selectedParking.description && <div><strong>설명:</strong> <span style={{ color: 'var(--text-muted)' }}>{selectedParking.description}</span></div>}
                      <div><strong>🕐 공유 가능 시간:</strong> <span style={{ color: 'var(--text-muted)' }}>{selectedParking.available_time || '연중무휴'}</span></div>
                      <div><strong>💰 시간당 요금:</strong> <span style={{ color: 'var(--text-muted)' }}>{selectedParking.hourly_rate > 0 ? `${selectedParking.hourly_rate.toLocaleString()}원` : '무료'}</span></div>
                      <div><strong>📅 월 이용 요금:</strong> <span style={{ color: 'var(--text-muted)' }}>{selectedParking.monthly_rate > 0 ? `${selectedParking.monthly_rate.toLocaleString()}원` : '없음'}</span></div>
                      <div><strong>🚗 수용 가능 대수:</strong> <span style={{ color: 'var(--text-muted)' }}>{selectedParking.capacity}대</span></div>
                      <div><strong>📞 공유 문의처:</strong> <span style={{ color: 'var(--text-muted)' }}>{selectedParking.contact_method || '정보 없음'}</span></div>
                    </div>
                  </div>

                  {/* 평판 투표 영역 (Section 2) */}
                  <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>주차장 추천 및 평가</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                      이 공유주차장에 대한 신뢰도를 평가해 주세요. 추천 50개 달성 시 검색 지도에 등재됩니다!
                    </p>
                    <div className={styles.voteRow}>
                      <button className={styles.likeBtn} onClick={() => handleVote('like')}>
                        <ThumbsUp size={16} /> 추천 {selectedParking.likes}
                      </button>
                      <button className={styles.dislikeBtn} onClick={() => handleVote('dislike')}>
                        <ThumbsDown size={16} /> 비추천 {selectedParking.dislikes}
                      </button>
                    </div>
                    {votedMsg && (
                      <p style={{ marginTop: '10px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {votedMsg}
                      </p>
                    )}
                  </div>

                  {/* Section 6: 이 주차장 관련 후기 게시판 글 모아보기 */}
                  <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      📖 연동 후기 게시판 글 ({linkedPosts.length}개)
                    </h3>
                    {linkedPosts.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', margin: 0 }}>
                        이 주차장과 연동되어 작성된 자유 후기글이 없습니다. 후기 게시판에서 첫 글을 등록해 연동해 보세요!
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {linkedPosts.map(lp => (
                          <div 
                            key={lp.id} 
                            style={{ 
                              padding: '10px', 
                              borderRadius: '6px', 
                              border: '1px solid var(--border)', 
                              background: 'var(--bg-card)',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                            onClick={() => {
                              // 탭을 후기 게시판으로 바꾸고 글 세팅
                              setActiveTab('review');
                              openPostDetail(lp.id);
                            }}
                          >
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{lp.title}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>👤 {lp.author} | {formatDate(lp.created_at)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 오른쪽 컬럼: 후기 별점평가 목록 + 작성 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className={styles.commentSection} style={{ marginTop: 0 }}>
                    <h3 className={styles.commentTitle} style={{ borderBottom: 'none', paddingBottom: 0 }}>
                      ⭐ 사용자 평점 후기 ({selectedParking.reviews?.length || 0}개)
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.2rem', color: 'var(--color-warning)', fontWeight: 800 }}>
                      ★ {getAvgRating(selectedParking.reviews)} / 5.0
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                      {(!selectedParking.reviews || selectedParking.reviews.length === 0) ? (
                        <p style={{ fontSize: '0.83rem', color: 'var(--text-light)', textAlign: 'center', padding: '20px 0' }}>
                          아직 작성된 이용평이 없습니다.
                        </p>
                      ) : (
                        selectedParking.reviews.map(r => (
                          <div key={r.id} className={styles.commentItem} style={{ padding: '10px' }}>
                            <div className={styles.commentHeader}>
                              <strong>{r.author}</strong>
                              <span style={{ color: 'var(--color-warning)', fontSize: '0.78rem' }}>
                                {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                              </span>
                              <span className={styles.commentDate}>{formatDate(r.created_at)}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-muted)' }}>{r.comment}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* 후기 작성 폼 */}
                    <div className={styles.commentForm} style={{ background: 'var(--bg-main)' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 6px' }}>후기 별점 남기기</h4>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                        <select
                          className={styles.input}
                          style={{ maxWidth: '110px', padding: '6px 8px', fontSize: '0.82rem' }}
                          value={reviewRating}
                          onChange={e => setReviewRating(Number(e.target.value))}
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ 5점</option>
                          <option value={4}>⭐⭐⭐⭐ 4점</option>
                          <option value={3}>⭐⭐⭐ 3점</option>
                          <option value={2}>⭐⭐ 2점</option>
                          <option value={1}>⭐ 1점</option>
                        </select>
                      </div>
                      <textarea
                        className={styles.textarea}
                        rows={2}
                        placeholder="실제 이용 후기를 남겨주세요."
                        value={reviewComment}
                        onChange={e => setReviewComment(e.target.value)}
                        style={{ fontSize: '0.82rem' }}
                      />
                      <button className={styles.primaryBtn} style={{ padding: '6px 12px', fontSize: '0.82rem', marginLeft: 'auto' }} onClick={handleAddReview}>
                        등록
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 탭2 일반 후기글 상세 뷰 */
            selectedPost && (
              <div className={styles.card}>
                <button className={styles.backBtn} onClick={() => setView('list')}>
                  <ChevronLeft size={16} /> 목록으로
                </button>

                <div className={styles.postHeader}>
                  <h2 className={styles.postTitle}>{selectedPost.title}</h2>
                  <div className={styles.postMeta}>
                    <span>👤 작성자: {selectedPost.author}</span>
                    <span><Clock size={12} /> 작성일: {formatDate(selectedPost.created_at)}</span>
                    <span><Eye size={12} /> 조회수: {selectedPost.views}</span>
                    {selectedPost.author === username && (
                      <button className={styles.deletePostBtn} onClick={() => handleDeletePost(selectedPost.id)}>
                        <Trash2 size={13} /> 삭제
                      </button>
                    )}
                  </div>
                </div>

                {/* 연동 주차장 카드 표시 (Section 5) */}
                {selectedPost.community_parkings && (
                  <div 
                    style={{ 
                      background: 'var(--primary-light)', 
                      border: '1px solid var(--primary)', 
                      borderRadius: '8px', 
                      padding: '14px 18px', 
                      marginBottom: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onClick={() => {
                      if (selectedPost.parking_id) {
                        setActiveTab('parking');
                        openParkingDetail(selectedPost.parking_id);
                      }
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', display: 'block', marginBottom: '2px' }}>
                        🔗 연동된 공유 주차장 정보 (클릭 시 이동)
                      </span>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        {selectedPost.community_parkings.title}
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '10px' }}>
                        {selectedPost.community_parkings.address}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>자세히 보기 &gt;</span>
                  </div>
                )}

                <div className={styles.postContent}>{selectedPost.content}</div>

                {/* 댓글 영역 */}
                <div className={styles.commentSection}>
                  <h3 className={styles.commentTitle}>
                    <MessageSquare size={16} /> 댓글 {selectedPost.comments?.length || 0}개
                  </h3>

                  {selectedPost.comments && selectedPost.comments.map(c => (
                    <div key={c.id} className={styles.commentItem}>
                      <div className={styles.commentHeader}>
                        <strong>{c.author}</strong>
                        <span className={styles.commentDate}>{formatDate(c.created_at)}</span>
                        {c.author === username && (
                          <button className={styles.deleteCommentBtn} onClick={() => handleDeleteComment(c.id)}>
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <p className={styles.commentContent}>{c.content}</p>
                    </div>
                  ))}

                  <div className={styles.commentForm}>
                    <textarea
                      className={styles.textarea}
                      rows={2}
                      placeholder={loggedIn ? "댓글을 입력하세요..." : "댓글을 작성하려면 로그인(닉네임 입력)해 주세요."}
                      value={commentText}
                      disabled={!loggedIn}
                      onChange={e => setCommentText(e.target.value)}
                    />
                    <button 
                      className={styles.primaryBtn} 
                      onClick={handleAddComment} 
                      disabled={!loggedIn}
                      style={{ marginLeft: 'auto', padding: '8px 16px', fontSize: '0.82rem' }}
                    >
                      <Send size={13} /> 댓글 등록
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}

export default function CommunityPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)' }}>로딩 중...</div>}>
      <CommunityContent />
    </Suspense>
  );
}
