'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Eye, Plus, Send, Trash2, ChevronLeft, Clock } from 'lucide-react';
import { getCommunityPosts, saveCommunityPost, deleteCommunityPost, generateId } from '../lib/storage';
import { CommunityPost, PostComment } from '../lib/types';
import styles from './community.module.css';

// 간단한 닉네임 세션 (localStorage)
function getSessionUser(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('pm_username') || '';
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [view, setView] = useState<'list' | 'detail' | 'write'>('list');
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [username, setUsername] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    setPosts(getCommunityPosts());
    const saved = getSessionUser();
    if (saved) { setUsername(saved); setLoggedIn(true); }
  }, []);

  // 로그인(닉네임 설정)
  function handleLogin() {
    if (!loginInput.trim()) return;
    setUsername(loginInput.trim());
    setLoggedIn(true);
    localStorage.setItem('pm_username', loginInput.trim());
    setLoginInput('');
  }

  function handleLogout() {
    setUsername('');
    setLoggedIn(false);
    localStorage.removeItem('pm_username');
    setView('list');
  }

  // 글 작성
  function handleWrite() {
    if (!newTitle.trim() || !newContent.trim()) return;
    const post: CommunityPost = {
      id: generateId(),
      title: newTitle,
      content: newContent,
      author: username,
      views: 0,
      comments: [],
      createdAt: new Date().toISOString(),
    };
    saveCommunityPost(post);
    setPosts(getCommunityPosts());
    setNewTitle('');
    setNewContent('');
    setView('list');
  }

  // 글 상세 보기 (조회수 증가)
  function openPost(post: CommunityPost) {
    const updated = { ...post, views: post.views + 1 };
    saveCommunityPost(updated);
    setSelectedPost(updated);
    setPosts(getCommunityPosts());
    setView('detail');
  }

  // 댓글 작성
  function handleComment() {
    if (!selectedPost || !commentText.trim() || !loggedIn) return;
    const comment: PostComment = {
      id: generateId(),
      author: username,
      content: commentText,
      createdAt: new Date().toISOString(),
    };
    const updated = { ...selectedPost, comments: [...selectedPost.comments, comment] };
    saveCommunityPost(updated);
    setSelectedPost(updated);
    setPosts(getCommunityPosts());
    setCommentText('');
  }

  // 댓글 삭제
  function handleDeleteComment(commentId: string) {
    if (!selectedPost) return;
    const updated = { ...selectedPost, comments: selectedPost.comments.filter(c => c.id !== commentId) };
    saveCommunityPost(updated);
    setSelectedPost(updated);
    setPosts(getCommunityPosts());
  }

  // 게시글 삭제
  function handleDeletePost(id: string) {
    if (!confirm('게시글을 삭제하시겠습니까?')) return;
    deleteCommunityPost(id);
    setPosts(getCommunityPosts());
    setView('list');
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  }

  // ----------- 렌더 -----------
  return (
    <div className={styles.page}>
      {/* 상단 헤더 */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}><MessageSquare size={28} /> 커뮤니티</h1>
          <p className={styles.pageSubtitle}>주차 정보를 나누고 꿀팁을 공유하세요.</p>
        </div>

        {/* 로그인/닉네임 영역 */}
        <div className={styles.authArea}>
          {loggedIn ? (
            <div className={styles.loggedIn}>
              <span className={styles.userBadge}>👤 {username}</span>
              <button className={styles.ghostBtn} onClick={handleLogout}>로그아웃</button>
              {view === 'list' && (
                <button className={styles.primaryBtn} onClick={() => setView('write')}>
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
                style={{ maxWidth: '160px' }}
              />
              <button className={styles.primaryBtn} onClick={handleLogin}>참여하기</button>
            </div>
          )}
        </div>
      </div>

      {/* 글쓰기 화면 */}
      {view === 'write' && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>새 게시글 작성</h2>
          <input
            className={styles.input}
            placeholder="제목을 입력하세요"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            style={{ marginBottom: '12px' }}
          />
          <textarea
            className={styles.textarea}
            rows={8}
            placeholder="내용을 입력하세요. 주차 꿀팁, 정보 공유, 질문 등 자유롭게 작성하세요."
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
          />
          <div className={styles.formActions} style={{ marginTop: '12px' }}>
            <button className={styles.primaryBtn} onClick={handleWrite}>게시하기</button>
            <button className={styles.ghostBtn} onClick={() => setView('list')}>취소</button>
          </div>
        </div>
      )}

      {/* 글 목록 */}
      {view === 'list' && (
        <div className={styles.card}>
          {!loggedIn && (
            <div className={styles.loginNotice}>
              💡 닉네임을 설정하면 글을 작성할 수 있습니다. 비회원도 읽기는 가능합니다.
            </div>
          )}

          {posts.length === 0 ? (
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
                  <th className={styles.th}><Eye size={13} /></th>
                  <th className={styles.th}><MessageSquare size={13} /></th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id} className={styles.tr} onClick={() => openPost(post)}>
                    <td className={styles.tdTitle}>{post.title}</td>
                    <td className={styles.td}>{post.author}</td>
                    <td className={styles.td}>{formatDate(post.createdAt)}</td>
                    <td className={styles.td}>{post.views}</td>
                    <td className={styles.td}>{post.comments.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* 글 상세 */}
      {view === 'detail' && selectedPost && (
        <div className={styles.card}>
          <button className={styles.backBtn} onClick={() => setView('list')}>
            <ChevronLeft size={16} /> 목록으로
          </button>

          <div className={styles.postHeader}>
            <h2 className={styles.postTitle}>{selectedPost.title}</h2>
            <div className={styles.postMeta}>
              <span>👤 {selectedPost.author}</span>
              <span><Clock size={12} /> {formatDate(selectedPost.createdAt)}</span>
              <span><Eye size={12} /> {selectedPost.views}</span>
              {selectedPost.author === username && (
                <button className={styles.deletePostBtn} onClick={() => handleDeletePost(selectedPost.id)}>
                  <Trash2 size={13} /> 삭제
                </button>
              )}
            </div>
          </div>

          <div className={styles.postContent}>{selectedPost.content}</div>

          {/* 댓글 */}
          <div className={styles.commentSection}>
            <h3 className={styles.commentTitle}>
              <MessageSquare size={16} /> 댓글 {selectedPost.comments.length}개
            </h3>

            {selectedPost.comments.map(c => (
              <div key={c.id} className={styles.commentItem}>
                <div className={styles.commentHeader}>
                  <strong>{c.author}</strong>
                  <span className={styles.commentDate}>{formatDate(c.createdAt)}</span>
                  {c.author === username && (
                    <button className={styles.deleteCommentBtn} onClick={() => handleDeleteComment(c.id)}>
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <p className={styles.commentContent}>{c.content}</p>
              </div>
            ))}

            {loggedIn ? (
              <div className={styles.commentForm}>
                <textarea
                  className={styles.textarea}
                  rows={2}
                  placeholder="댓글을 입력하세요..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                />
                <button className={styles.primaryBtn} onClick={handleComment}>
                  <Send size={14} /> 댓글 등록
                </button>
              </div>
            ) : (
              <p className={styles.loginNotice}>댓글을 작성하려면 닉네임을 설정하세요.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
