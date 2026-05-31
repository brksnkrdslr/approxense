import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { selectQuestions, toPublicQuestion } from '@/lib/questions';
import { Question, Category, ALL_CATEGORIES, DEFAULT_SETTINGS, GameSettings } from '@/types';

export async function GET(req: NextRequest) {
  const url = req.nextUrl;

  // Settings from query params
  const durationParam = Number(url.searchParams.get('duration') ?? DEFAULT_SETTINGS.duration);
  const duration = ([15, 30, 45, 60].includes(durationParam) ? durationParam : 30) as GameSettings['duration'];

  const catParam = url.searchParams.get('categories');
  const categories: Category[] = catParam
    ? (catParam.split(',').filter((c) => ALL_CATEGORIES.includes(c as Category)) as Category[])
    : ALL_CATEGORIES;

  const settings: GameSettings = { duration, categories: categories.length > 0 ? categories : ALL_CATEGORIES };

  const supabase = createClient();

  const { data: questions, error } = await supabase
    .from('questions')
    .select('id, category, question_text, answer, unit, language, active')
    .eq('active', true)
    .in('category', settings.categories);

  if (error || !questions) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }

  const selected = selectQuestions(questions as Question[], settings);

  const { data: session, error: sessionError } = await supabase
    .from('game_sessions')
    .insert({ mode: 'single', question_ids: selected.map((q) => q.id) })
    .select()
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }

  return NextResponse.json({
    sessionId: session.id,
    questions: selected.map(toPublicQuestion),
    settings,
  });
}
