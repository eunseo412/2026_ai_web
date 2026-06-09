import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';

// GET /api/posts?category=review&parking_id=xxx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const parkingId = searchParams.get('parking_id');

  let query = supabase
    .from('community_posts')
    .select(`*, comments(id), community_parkings(title, address)`)
    .order('created_at', { ascending: false });

  if (category) query = query.eq('category', category);
  if (parkingId) query = query.eq('parking_id', parkingId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data ?? [] });
}

// POST /api/posts
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, parking_id, title, content, author } = body;

    if (!title || !content) {
      return NextResponse.json({ error: '제목과 내용은 필수입니다.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        category: category || 'review',
        parking_id: parking_id || null,
        title,
        content,
        author: author || '익명',
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ post: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
