import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { toPublicQuestion } from '@/lib/questions';
import { Question } from '@/types';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('id');
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const supabase = createClient();

  const { data: session } = await supabase
    .from('game_sessions')
    .select('question_ids')
    .eq('id', sessionId)
    .single();

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const { data: questions } = await supabase
    .from('questions')
    .select('id, category, question_text, answer, unit, language, active')
    .in('id', session.question_ids);

  if (!questions) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }

  // Soruları session'daki sıraya göre döndür
  const ordered: Question[] = (session.question_ids as string[])
    .map((id) => (questions as Question[]).find((q) => q.id === id))
    .filter((q): q is Question => q !== undefined);

  return NextResponse.json({ questions: ordered.map(toPublicQuestion) });
}
