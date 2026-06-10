'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare, Eye, Plus, Send, Trash2, ChevronLeft, Clock,
} from 'lucide-react';
import { CommunityPost, CommunityComment } from '../lib/types';
import styles from './community.module.css';

// ── 닉네임 로컬 세션 ──────────────────────────────────────
function getSessionUser(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('pm_username') || '';
}

// ── 뷰 타입 ───────────────────────────────────────────────
type View = 'list' | 'detail' | 'write';

// ── 날짜 포맷 ─────────────────────────────────────────────
function formatDate(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
function CommunityContent() {
  const router = useRouter();

  // 데이터 상태
  const [posts, setPosts]           = useState<CommunityPost[]>([]);
  const [loading, setLoading]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [view, setView]             = useState<View>('list');

  // 선택된 게시글
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);

  // 유저 정보
  const [username, setUsername]     = useState('');
  const [loggedIn, setLoggedIn]     = useState(false);
  const [loginInput, setLoginInput] = useState('');

  // 글쓰기 폼
  const [newTitle, setNewTitle]     = useState('');
  const [newContent, setNewContent] = useState('');

  // 댓글 폼
  const [commentText, setCommentText]   = useState('');
  const [addingComment, setAddingComment] = useState(false);

  // ── 초기 로드 ──────────────────────────────────────────
  useEffect(() => {
    const saved = getSessionUser();
    if (saved) { setUsername(saved); setLoggedIn(true); }
    loadPosts();
  }, []);

  // ── 게시글 목록 ────────────────────────────────────────
  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '불러오기 실패');
      setPosts(data.posts || []);
    } catch (err: any) {
      console.error('loadPosts:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── 로그인 ─────────────────────────────────────────────
  function handleLogin() {
    const name = loginInput.trim();
    if (!name) return;
    setUsername(name);
    setLoggedIn(true);
    localStorage.setItem('pm_username', name);
    setLoginInput('');
  }

  function handleLogout() {
    setUsername('');
    setLoggedIn(false);
    localStorage.removeItem('pm_username');
  }

  // ── 게시글 상세 ────────────────────────────────────────
  const openPostDetail = async (id: string) => {
    setLoading(true);
    setCommentText('');
    try {
      const res = await fetch(`/api/posts/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSelectedPost(data.post);
      setView('detail');
      // 목록 조회수 갱신
      loadPosts();
    } catch (err: any) {
      alert('게시글을 불러오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── 게시글 작성 ────────────────────────────────────────
  const handleWritePost = async () => {
    if (!newTitle.trim()) { alert('제목을 입력해 주세요.'); return; }
    if (!newContent.trim()) { alert('내용을 입력해 주세요.'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          author: username || '익명',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '게시 실패');

      // 성공 → 폼 초기화 후 목록으로
      setNewTitle('');
      setNewContent('');
      setView('list');
      await loadPosts();
    } catch (err: any) {
      alert(`게시글 등록 실패: ${err.message}`);
      console.error('handleWritePost:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── 게시글 삭제 ────────────────────────────────────────
  const handleDeletePost = async (id: string) => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제 실패');
      setView('list');
      await loadPosts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ── 댓글 작성 ──────────────────────────────────────────
  const handleAddComment = async () => {
    if (!selectedPost) return;
    if (!commentText.trim()) { alert('댓글 내용을 입력해 주세요.'); return; }

    setAddingComment(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: selectedPost.id,
          author: username || '익명',
          content: commentText.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '댓글 등록 실패');

      setCommentText('');
      // 상세 새로고침
      await openPostDetail(selectedPost.id);
    } catch (err: any) {
      alert(`댓글 등록 실패: ${err.message}`);
      console.error('handleAddComment:', err);
    } finally {
      setAddingComment(false);
    }
  };

  // ── 댓글 삭제 ──────────────────────────────────────────
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/comments?id=${commentId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제 실패');
      if (selectedPost) await openPostDetail(selectedPost.id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ── 목록으로 돌아가기 ─────────────────────────────────
  const goToList = () => {
    setView('list');
    setSelectedPost(null);
    setCommentText('');
  };

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <div className={styles.page}>

      {/* ── 상단 헤더 ─────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            <MessageSquare size={28} /> 커뮤니티
          </h1>
          <p className={styles.pageSubtitle}>
            주차 경험과 정보를 자유롭게 공유하세요.
          </p>
        </div>

        {/* 닉네임 로그인 영역 */}
        <div className={styles.authArea}>
          {loggedIn ? (
            <div className={styles.loggedIn}>
              <span className={styles.userBadge}>👤 {username}</span>
              <button className={styles.ghostBtn} onClick={handleLogout}>로그아웃</button>
              {view === 'list' && (
                <button
                  className={styles.primaryBtn}
                  onClick={() => {
                    setNewTitle('');
                    setNewContent('');
                    setView('write');
                  }}
                >
                  <Plus size={15} /> 글쓰기
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

      {/* ── 글쓰기 뷰 ─────────────────────────────────── */}
      {view === 'write' && (
        <div className={styles.card}>
          <button className={styles.backBtn} onClick={goToList}>
            <ChevronLeft size={16} /> 목록으로
          </button>
          <h2 className={styles.cardTitle}>새 게시글 작성</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                제목 *
              </label>
              <input
                className={styles.input}
                placeholder="예: 강남역 근처 저렴한 주차장 후기"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                내용 *
              </label>
              <textarea
                className={styles.textarea}
                rows={10}
                placeholder="주차 경험, 요금 정보, 팁 등을 자유롭게 공유해 주세요."
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              className={styles.primaryBtn}
              onClick={handleWritePost}
              disabled={submitting}
            >
              {submitting ? '게시 중...' : '게시하기'}
            </button>
            <button className={styles.ghostBtn} onClick={goToList}>취소</button>
          </div>
        </div>
      )}

      {/* ── 게시글 목록 뷰 ────────────────────────────── */}
      {view === 'list' && (
        <div className={styles.card} style={{ padding: '20px' }}>
          {!loggedIn && (
            <div className={styles.loginNotice}>
              💡 닉네임을 설정하면 글쓰기와 댓글을 작성할 수 있습니다.
            </div>
          )}

          {loading ? (
            <div className={styles.emptyState}>
              <p>로딩 중...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className={styles.emptyState}>
              <MessageSquare size={48} style={{ color: 'var(--text-light)', marginBottom: '12px' }} />
              <p>아직 게시글이 없습니다. 첫 번째 글을 작성해 보세요!</p>
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
                    <td className={styles.tdTitle}>{post.title}</td>
                    <td className={styles.td}>{post.author}</td>
                    <td className={styles.td}>{formatDate(post.created_at)}</td>
                    <td className={styles.td} style={{ textAlign: 'center' }}>{post.views}</td>
                    <td className={styles.td} style={{ textAlign: 'center' }}>
                      {post.community_comments?.length ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── 게시글 상세 뷰 ────────────────────────────── */}
      {view === 'detail' && selectedPost && (
        <div className={styles.card}>
          <button className={styles.backBtn} onClick={goToList}>
            <ChevronLeft size={16} /> 목록으로
          </button>

          <div className={styles.postHeader}>
            <h2 className={styles.postTitle}>{selectedPost.title}</h2>
            <div className={styles.postMeta}>
              <span>👤 작성자: {selectedPost.author}</span>
              <span><Clock size={12} /> {formatDate(selectedPost.created_at)}</span>
              <span><Eye size={12} /> 조회수: {selectedPost.views}</span>
              {selectedPost.author === username && (
                <button
                  className={styles.deletePostBtn}
                  onClick={() => handleDeletePost(selectedPost.id)}
                >
                  <Trash2 size={13} /> 삭제
                </button>
              )}
            </div>
          </div>

          <div className={styles.postContent}>{selectedPost.content}</div>

          {/* 댓글 영역 */}
          <div className={styles.commentSection}>
            <h3 className={styles.commentTitle}>
              <MessageSquare size={16} />
              댓글 {selectedPost.community_comments?.length ?? 0}개
            </h3>

            {selectedPost.community_comments && selectedPost.community_comments.length > 0 ? (
              selectedPost.community_comments.map((c: CommunityComment) => (
                <div key={c.id} className={styles.commentItem}>
                  <div className={styles.commentHeader}>
                    <strong>{c.author}</strong>
                    <span className={styles.commentDate}>{formatDate(c.created_at)}</span>
                    {c.author === username && (
                      <button
                        className={styles.deleteCommentBtn}
                        onClick={() => handleDeleteComment(c.id)}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <p className={styles.commentContent}>{c.content}</p>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', padding: '12px 0' }}>
                아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
              </p>
            )}

            {/* 댓글 작성 폼 */}
            <div className={styles.commentForm}>
              <textarea
                className={styles.textarea}
                rows={2}
                placeholder={
                  loggedIn
                    ? '댓글을 입력하세요...'
                    : '댓글을 작성하려면 닉네임을 먼저 설정해 주세요.'
                }
                value={commentText}
                disabled={!loggedIn || addingComment}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && e.ctrlKey) handleAddComment();
                }}
              />
              <button
                className={styles.primaryBtn}
                onClick={handleAddComment}
                disabled={!loggedIn || addingComment}
                style={{ marginLeft: 'auto', padding: '8px 16px', fontSize: '0.82rem' }}
              >
                <Send size={13} />
                {addingComment ? '등록 중...' : '댓글 등록'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 페이지 export (Suspense 래핑) ─────────────────────────
export default function CommunityPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)' }}>
          로딩 중...
        </div>
      }
    >
      <CommunityContent />
    </Suspense>
  );
}
