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

  // Paralel: soru çek + percentile için answers tablosundan say
  const [questionResult, totalResult, belowResult] = await Promise.all([
    supabase
      .from('questions')
      .select('answer, unit')
      .eq('id', questionId)
      .single(),

    // Toplam cevap sayısı
    supabase
      .from('answers')
      .select('*', { count: 'exact', head: true })
      .eq('question_id', questionId)
      .not('guessed_value', 'is', null),

    // Guess'e eşit veya altındaki cevap sayısı (percentile için)
    guessedValue !== null
      ? supabase
          .from('answers')
          .select('*', { count: 'exact', head: true })
          .eq('question_id', questionId)
          .not('guessed_value', 'is', null)
          .lte('guessed_value', guessedValue)
      : Promise.resolve({ count: 0, error: null }),
  ]);

  if (!questionResult.data) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  const totalAnswerCount = totalResult.count ?? 0;
  const belowOrEqualCount = belowResult.count ?? 0;

  const { logScore, percentileScore, wValue, finalScore } = computeScore(
    guessedValue,
    questionResult.data.answer,
    belowOrEqualCount,
    totalAnswerCount
  );

  // Paralel: cevabı kaydet + stats counter'ı atomik artır
  await Promise.all([
    supabase.from('answers').insert({
      session_id: sessionId,
      question_id: questionId,
      player_id: playerId,
      guessed_value: guessedValue,
      log_score: logScore,
      percentile_score: percentileScore,
      w_value: wValue,
      final_score: finalScore,
      time_remaining: timeRemaining,
    }),

    guessedValue !== null
      ? supabase.rpc('increment_answer_count', { qid: questionId })
      : Promise.resolve(null),
  ]);

  return NextResponse.json({
    logScore,
    percentileScore,
    wValue,
    finalScore,
    actualAnswer: questionResult.data.answer,
    unit: questionResult.data.unit,
  });
}
