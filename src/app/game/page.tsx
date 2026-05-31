'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import QuestionCard from '@/components/game/QuestionCard';
import RevealScreen from '@/components/game/RevealScreen';
import Timer from '@/components/ui/Timer';
import Keypad from '@/components/game/Keypad';
import { QuestionPublic, ScoreResult, RoundScore, GameSettings, DEFAULT_SETTINGS } from '@/types';
import { getOrCreatePlayerId } from '@/lib/utils';
import { getSettings } from '@/lib/questions';

interface SessionData {
  sessionId: string;
  questions: QuestionPublic[];
  settings?: GameSettings;
}

type GamePhase = 'loading' | 'playing' | 'reveal';

export default function GamePage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [phase, setPhase] = useState<GamePhase>('loading');
  const [round, setRound] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [rounds, setRounds] = useState<RoundScore[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gameDuration, setGameDuration] = useState<number>(DEFAULT_SETTINGS.duration);
  const submitLock = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const prevent = (e: TouchEvent) => e.preventDefault();
    document.addEventListener('touchmove', prevent, { passive: false });
    return () => document.removeEventListener('touchmove', prevent);
  }, []);

  useEffect(() => {
    async function init() {
      sessionStorage.removeItem('approxense_session');
      const s = getSettings();
      setGameDuration(s.duration);
      try {
        const params = new URLSearchParams({
          duration: String(s.duration),
          categories: s.categories.join(','),
        });
        const res = await fetch(`/api/questions/session?${params}`);
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        setSession(data);
        setPhase('playing');
      } catch {
        setError('Sorular yüklenemedi. Tekrar dene.');
      }
    }
    init();
  }, []);

  async function submitGuess(value: string) {
    if (submitLock.current || !session) return;
    submitLock.current = true;
    setIsSubmitting(true);

    const guess = value ? parseInt(value, 10) : null;
    const playerId = getOrCreatePlayerId();
    const question = session.questions[round];

    try {
      const res = await fetch('/api/game/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          questionId: question.id,
          playerId,
          guessedValue: guess,
          timeRemaining: 0,
        }),
      });
      const data: ScoreResult = await res.json();
      setScoreResult(data);
      setRounds((prev) => [
        ...prev,
        { ...data, questionId: question.id, questionText: question.question_text, guessedValue: guess },
      ]);
    } catch {
      setScoreResult({ logScore: 0, percentileScore: 0, wValue: 0, finalScore: 0, actualAnswer: 0, unit: '' });
      setRounds((prev) => [
        ...prev,
        { logScore: 0, percentileScore: 0, wValue: 0, finalScore: 0, actualAnswer: 0, unit: '', questionId: question.id, questionText: question.question_text, guessedValue: guess },
      ]);
    }
    setIsSubmitting(false);
    setPhase('reveal');
  }

  function handleNext() {
    const nextRound = round + 1;
    if (nextRound >= (session?.questions.length ?? 10)) {
      sessionStorage.setItem('approxense_rounds', JSON.stringify(rounds));
      sessionStorage.removeItem('approxense_session');
      router.push('/result');
      return;
    }
    setRound(nextRound);
    setInputValue('');
    setPhase('playing');
    setScoreResult(null);
    submitLock.current = false;
  }

  if (phase === 'loading') {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        {error ? (
          <div className="text-center px-5">
            <p className="mb-4" style={{ color: 'var(--color-danger)' }}>{error}</p>
            <a href="/game" className="underline" style={{ color: 'var(--color-accent)' }}>Tekrar dene</a>
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-muted)' }}>Yükleniyor…</p>
        )}
      </div>
    );
  }

  if (!session) return null;
  const question = session.questions[round];
  const cumulativeScore = rounds.reduce((sum, r) => sum + r.finalScore, 0);

  return (
    <div style={{ height: '100%', overflow: 'hidden', position: 'relative', backgroundColor: 'var(--color-bg)' }}>
      {phase === 'playing' && (
        <>
          <div className="flex items-center justify-between px-5 pt-5">
            <button
              onClick={() => router.push('/')}
              className="text-sm px-2 py-1 rounded-lg"
              style={{ color: 'var(--color-text-muted)' }}
            >
              ← Menü
            </button>
            <Timer
              key={`${session.sessionId}-${round}`}
              duration={gameDuration}
              onExpire={() => submitGuess(inputValue)}
            />
          </div>
          <QuestionCard
            question={question}
            round={round + 1}
            total={session.questions.length}
            inputValue={inputValue}
          />
          <Keypad
            value={inputValue}
            onChange={setInputValue}
            onSubmitReady={() => submitGuess(inputValue)}
            submitReady={isSubmitting}
          />
        </>
      )}

      {phase === 'reveal' && scoreResult && (
        <>
          <div className="px-5 pt-5">
            <button
              onClick={() => router.push('/')}
              className="text-sm px-2 py-1 rounded-lg"
              style={{ color: 'var(--color-text-muted)' }}
            >
              ← Menü
            </button>
          </div>
          <RevealScreen
            question={question}
          guessedValue={rounds[round]?.guessedValue ?? null}
          scoreResult={scoreResult}
          cumulativeScore={cumulativeScore}
          round={round + 1}
          total={session.questions.length}
          onNext={handleNext}
          />
        </>
      )}
    </div>
  );
}
