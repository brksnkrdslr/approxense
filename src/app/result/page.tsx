'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ScoreDisplay from '@/components/game/ScoreDisplay';
import Button from '@/components/ui/Button';
import { RoundScore } from '@/types';

export default function ResultPage() {
  const router = useRouter();
  const [rounds, setRounds] = useState<RoundScore[]>([]);

  useEffect(() => {
    const raw = sessionStorage.getItem('approxense_rounds');
    if (!raw) {
      router.replace('/play');
      return;
    }
    setRounds(JSON.parse(raw));
  }, []);

  async function handlePlayAgain() {
    const res = await fetch('/api/questions/session?mode=single');
    if (!res.ok) return;
    const data = await res.json();
    sessionStorage.setItem('approxense_session', JSON.stringify(data));
    sessionStorage.removeItem('approxense_rounds');
    router.push('/game');
  }

  const totalScore = rounds.reduce((sum, r) => sum + r.finalScore, 0);

  if (rounds.length === 0) return null;

  return (
    <div
      className="h-full px-5 pt-6 pb-28 overflow-y-auto"
      style={{ backgroundColor: 'var(--color-bg)', position: 'relative' }}
    >
      <ScoreDisplay totalScore={totalScore} rounds={rounds} />

      <div
        className="absolute bottom-0 left-0 right-0 p-4"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <Button onClick={handlePlayAgain}>Tekrar Oyna</Button>
      </div>
    </div>
  );
}
