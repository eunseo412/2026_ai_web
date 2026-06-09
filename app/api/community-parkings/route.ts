import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';

// GET /api/community-parkings?promoted=true
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const promotedOnly = searchParams.get('promoted') === 'true';

  let query = supabase
    .from('community_parkings')
    .select(`
      *,
      reviews(id, author, rating, comment, created_at)
    `)
    .order('created_at', { ascending: false });

  if (promotedOnly) {
    query = query.gte('likes', 50);
  }

  const { data, error } = await query;
  if (error) {
    console.error('GET community_parkings error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ parkings: data ?? [] });
}

// POST /api/community-parkings  - 주차장 등록 + 커뮤니티 게시글 자동 생성
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title, address, description, available_time, hourly_rate, monthly_rate,
      capacity, contact_method, image_url, author, lat, lng
    } = body;

    if (!title || !address) {
      return NextResponse.json({ error: '장소명과 주소는 필수입니다.' }, { status: 400 });
    }

    // 1. 주차장 등록
    const { data: parking, error: parkingError } = await supabase
      .from('community_parkings')
      .insert({
        title, address,
        description: description || '',
        available_time: available_time || '',
        hourly_rate: hourly_rate || 0,
        monthly_rate: monthly_rate || 0,
        capacity: capacity || 1,
        contact_method: contact_method || '',
        image_url: image_url || null,
        author: author || '익명',
        likes: 0,
        dislikes: 0,
        promoted: false,
        lat: lat || 37.5559,
        lng: lng || 126.9723
      })
      .select()
      .single();

    if (parkingError || !parking) {
      console.error('Insert community_parking error:', parkingError);
      return NextResponse.json({ error: parkingError?.message }, { status: 500 });
    }

    // 2. 커뮤니티 게시글 자동 생성 (category: 'parking')
    const autoContent = [
      `📍 주소: ${address}`,
      description ? `📝 설명: ${description}` : '',
      available_time ? `🕐 공유 가능 시간: ${available_time}` : '',
      hourly_rate > 0 ? `💰 시간당 요금: ${hourly_rate.toLocaleString()}원` : '💰 무료',
      monthly_rate > 0 ? `📅 월 이용료: ${monthly_rate.toLocaleString()}원` : '',
      capacity ? `🚗 주차 가능 대수: ${capacity}대` : '',
      contact_method ? `📞 연락 방법: ${contact_method}` : '',
    ].filter(Boolean).join('\n');

    await supabase.from('community_posts').insert({
      category: 'parking',
      parking_id: parking.id,
      title: `[공유주차장] ${title}`,
      content: autoContent,
      author: author || '익명',
    });

    return NextResponse.json({ parking }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
