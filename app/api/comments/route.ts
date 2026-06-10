import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';

// GET /api/comments?post_id=xxx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('post_id');

  if (!postId) return NextResponse.json({ error: 'post_id 필요' }, { status: 400 });

  const { data, error } = await supabase
    .from('community_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[GET /api/comments] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ comments: data ?? [] });
}

// POST /api/comments
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { post_id, author, content } = body;

    if (!post_id || !content) {
      return NextResponse.json({ error: 'post_id와 content는 필수입니다.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('community_comments')
      .insert({ post_id, author: (author || '익명').trim(), content: content.trim() })
      .select()
      .single();

    if (error) {
      console.error('[POST /api/comments] error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ comment: data }, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/comments] exception:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/comments?id=xxx
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id 필요' }, { status: 400 });

  const { error } = await supabase.from('community_comments').delete().eq('id', id);
  if (error) {
    console.error('[DELETE /api/comments] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
