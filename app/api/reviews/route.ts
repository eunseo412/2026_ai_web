import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';

// GET /api/reviews?parking_id=xxx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parkingId = searchParams.get('parking_id');

  let query = supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (parkingId) {
    query = query.eq('parking_id', parkingId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reviews: data ?? [] });
}

// POST /api/reviews
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { parking_id, author, rating, comment } = body;

    if (!parking_id || !comment) {
      return NextResponse.json({ error: 'parking_id와 comment는 필수입니다.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({ parking_id, author: author || '익명', rating: rating || 5, comment })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ review: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
