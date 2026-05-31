import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { selectQuestions, toPublicQuestion } from '@/lib/questions';
import { Question, Category, ALL_CATEGORIES, DEFAULT_SETTINGS, GameSettings } from '@/types';

const schema = z.object({
  playerId: z.string().min(1).max(100),
  force: z.boolean().optional(),
  settings: z.object({
    duration: z.number().optional(),
    categories: z.array(z.string()).optional(),
  }).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const rawSettings = parsed.data.settings;
  const categories: Category[] = ((rawSettings?.categories ?? ALL_CATEGORIES) as string[])
    .filter((c) => ALL_CATEGORIES.includes(c as Category)) as Category[];
  const duration = ([15, 30, 45, 60].includes(rawSettings?.duration ?? 0)
    ? rawSettings?.duration : DEFAULT_SETTINGS.duration) as GameSettings['duration'];
  const settings: GameSettings = {
    duration,
    categories: categories.length > 0 ? categories : ALL_CATEGORIES,
  };

  const supabase = createClient();

  if (!parsed.data.force) {
    const { data: players } = await supabase
      .from('room_players')
      .select('is_ready')
      .eq('room_id', roomId)
      .eq('is_connected', true);

    const total = players?.length ?? 0;
    const readyCount = players?.filter((p) => p.is_ready).length ?? 0;

    if (readyCount <= total / 2) {
      return NextResponse.json({ error: 'Not enough ready players' }, { status: 403 });
    }
  }

  const { data: questions } = await supabase
    .from('questions')
    .select('id, category, question_text, answer, unit, language, active')
    .eq('active', true)
    .in('category', settings.categories);

  if (!questions) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }

  const selected = selectQuestions(questions as Question[], settings);

  const { data: session } = await supabase
    .from('game_sessions')
    .insert({ mode: 'multiplayer', room_id: roomId, question_ids: selected.map((q) => q.id) })
    .select()
    .single();

  if (!session) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }

  const now = new Date().toISOString();
  await supabase
    .from('rooms')
    .update({ status: 'playing', game_started_at: now })
    .eq('id', roomId);

  return NextResponse.json({ sessionId: session.id, startsAt: now, settings });
}
