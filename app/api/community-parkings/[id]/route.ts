import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// GET /api/community-parkings/[id]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await supabase
    .from('community_parkings')
    .select(`*, reviews(id, author, rating, comment, created_at)`)
    .eq('id', id)
    .single();

  if (error) {
    console.error('[GET /api/community-parkings/[id]] error:', error);
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json({ parking: data });
}

// PATCH /api/community-parkings/[id] - 추천/비추천 투표
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { vote, session_key } = body;

  if (!vote || !session_key) {
    return NextResponse.json({ error: 'vote와 session_key가 필요합니다.' }, { status: 400 });
  }

  // 중복 투표 확인
  const { data: existing } = await supabase
    .from('votes')
    .select('id')
    .eq('parking_id', id)
    .eq('session_key', session_key)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: '이미 투표하셨습니다.', alreadyVoted: true }, { status: 409 });
  }

  // 투표 기록
  await supabase.from('votes').insert({ parking_id: id, session_key, vote_type: vote });

  // 현재 카운트 조회 후 업데이트
  const { data: current } = await supabase
    .from('community_parkings')
    .select('likes, dislikes')
    .eq('id', id)
    .single();

  const field = vote === 'like' ? 'likes' : 'dislikes';
  const newVal = (current?.[field] ?? 0) + 1;
  const newLikes = vote === 'like' ? newVal : (current?.likes ?? 0);
  const promoted = newLikes >= 50;

  const { data, error } = await supabase
    .from('community_parkings')
    .update({ [field]: newVal, promoted })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[PATCH /api/community-parkings/[id]] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ parking: data });
}

// DELETE /api/community-parkings/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await supabase.from('community_parkings').delete().eq('id', id);
  if (error) {
    console.error('[DELETE /api/community-parkings/[id]] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
