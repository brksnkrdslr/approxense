import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { selectBalancedQuestions, toPublicQuestion } from '@/lib/questions';
import { Question } from '@/types';

export async function GET(req: NextRequest) {
  const supabase = createClient();

  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .eq('active', true);

  if (error || !questions) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }

  const selected = selectBalancedQuestions(questions as Question[]);

  const { data: session, error: sessionError } = await supabase
    .from('game_sessions')
    .insert({
      mode: 'single',
      question_ids: selected.map((q) => q.id),
    })
    .select()
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }

  return NextResponse.json({
    sessionId: session.id,
    questions: selected.map(toPublicQuestion),
  });
}
