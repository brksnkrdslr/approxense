import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { computeScore } from '@/lib/scoring';

const schema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string().uuid(),
  playerId: z.string().min(1).max(100),
  guessedValue: z.number().positive().nullable(),
  timeRemaining: z.number().int().min(0),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', code: 'VALIDATION_ERROR' }, { status: 400 });
  }

  const { sessionId, questionId, playerId, guessedValue, timeRemaining } = parsed.data;
  const supabase = createClient();

  const { data: question } = await supabase
    .from('questions')
    .select('answer, unit')
    .eq('id', questionId)
    .single();

  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  let stats = { answer_count: 0, answers: [] as number[] };
  const { data: existingStats } = await supabase
    .from('question_stats')
    .select('answer_count, answers')
    .eq('question_id', questionId)
    .single();

  if (existingStats) {
    stats = existingStats;
  }

  const { logScore, percentileScore, wValue, finalScore } = computeScore(
    guessedValue,
    question.answer,
    stats.answers,
    stats.answer_count
  );

  await supabase.from('answers').insert({
    session_id: sessionId,
    question_id: questionId,
    player_id: playerId,
    guessed_value: guessedValue,
    log_score: logScore,
    percentile_score: percentileScore,
    w_value: wValue,
    final_score: finalScore,
    time_remaining: timeRemaining,
  });

  if (guessedValue !== null) {
    const newAnswers = [...stats.answers, guessedValue].slice(-10000);
    await supabase.from('question_stats').upsert({
      question_id: questionId,
      answer_count: stats.answer_count + 1,
      answers: newAnswers,
      updated_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    logScore,
    percentileScore,
    wValue,
    finalScore,
    actualAnswer: question.answer,
    unit: question.unit,
  });
}
