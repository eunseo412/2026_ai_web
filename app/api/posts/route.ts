import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';

// GET /api/posts
export async function GET() {
  const { data, error } = await supabase
    .from('community_posts')
    .select(`
      id,
      title,
      content,
      author,
      views,
      created_at,
      community_comments(id)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[GET /api/posts] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ posts: data ?? [] });
}

// POST /api/posts
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, author } = body;

    if (!title || !content) {
      return NextResponse.json({ error: '제목과 내용은 필수입니다.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        title: title.trim(),
        content: content.trim(),
        author: (author || '익명').trim(),
        views: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('[POST /api/posts] error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ post: data }, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/posts] exception:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
