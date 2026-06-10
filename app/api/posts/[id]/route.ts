import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// GET /api/posts/[id] - 상세 + 댓글 + 조회수 증가
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 조회수 증가
  try {
    const { data: current } = await supabase
      .from('community_posts')
      .select('views')
      .eq('id', id)
      .single();
    if (current) {
      await supabase
        .from('community_posts')
        .update({ views: (current.views ?? 0) + 1 })
        .eq('id', id);
    }
  } catch {
    // 조회수 증가 실패는 무시
  }

  const { data, error } = await supabase
    .from('community_posts')
    .select(`
      id,
      title,
      content,
      author,
      views,
      created_at,
      community_comments(id, author, content, created_at)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('[GET /api/posts/[id]] error:', error);
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json({ post: data });
}

// DELETE /api/posts/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await supabase.from('community_posts').delete().eq('id', id);
  if (error) {
    console.error('[DELETE /api/posts/[id]] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
