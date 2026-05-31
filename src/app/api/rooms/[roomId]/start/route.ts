import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { selectBalancedQuestions, toPublicQuestion } from '@/lib/questions';
import { Question } from '@/types';

const schema = z.object({
  playerId: z.string().min(1).max(100),
  force: z.boolean().optional(),
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
    .eq('active', true);

  if (!questions) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }

  const selected = selectBalancedQuestions(questions as Question[]);

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

  return NextResponse.json({
    sessionId: session.id,
    startsAt: now,
    questions: selected.map(toPublicQuestion),
  });
}
