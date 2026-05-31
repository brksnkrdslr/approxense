'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ScoreDisplay from '@/components/game/ScoreDisplay';
import { RoundScore } from '@/types';
import { getSettings } from '@/lib/questions';

export default function ResultPage() {
  const router = useRouter();
  const [rounds, setRounds] = useState<RoundScore[]>([]);

  useEffect(() => {
    const raw = sessionStorage.getItem('approxense_rounds');
    if (!raw) { router.replace('/'); return; }
    setRounds(JSON.parse(raw));
  }, []);

  async function handlePlayAgain() {
    const s = getSettings();
    const params = new URLSearchParams({
      duration: String(s.duration),
      categories: s.categories.join(','),
    });
    const res = await fetch(`/api/questions/session?${params}`);
    if (!res.ok) return;
    sessionStorage.removeItem('approxense_rounds');
    router.push('/game');
  }

  const totalScore = rounds.reduce((sum, r) => sum + r.finalScore, 0);
  if (rounds.length === 0) return null;

  return (
    <div className="h-full px-5 pt-6 pb-6 overflow-y-auto flex flex-col gap-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <ScoreDisplay totalScore={totalScore} rounds={rounds} />

      <button
        onClick={handlePlayAgain}
        className="w-full rounded-[12px] text-base font-medium"
        style={{ height: '52px', backgroundColor: 'var(--color-accent)', color: 'white' }}
      >
        Tekrar Oyna
      </button>

      <button
        onClick={() => router.push('/')}
        className="w-full rounded-[12px] text-base font-medium border"
        style={{ height: '52px', backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
      >
        Ana Sayfa
      </button>
    </div>
  );
}
