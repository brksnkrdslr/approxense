import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, ...rest } = body;

    if (!eventType) {
      return NextResponse.json({ error: 'Missing eventType' }, { status: 400 });
    }

    const supabase = createClient();
    await supabase.from('analytics_events').insert({
      event_type: eventType,
      session_id: rest.sessionId ?? null,
      room_id: rest.roomId ?? null,
      question_id: rest.questionId ?? null,
      category: rest.category ?? null,
      guessed_value: rest.guessedValue ?? null,
      actual_value: rest.actualValue ?? null,
      log_score: rest.logScore ?? null,
      time_remaining: rest.timeRemaining ?? null,
      mode: rest.mode ?? null,
      player_count: rest.playerCount ?? null,
    });
  } catch {
    // fire-and-forget: never block caller
  }

  return NextResponse.json({ success: true }, { status: 202 });
}
