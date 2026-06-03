'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ScoreDisplay from '@/components/game/ScoreDisplay';
import Button from '@/components/ui/Button';
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
    <div className="h-full px-5 pt-6 overflow-y-auto flex flex-col gap-4" style={{ backgroundColor: 'var(--color-bg)', paddingBottom: 'max(24px, env(safe-area-inset-bottom))', overscrollBehavior: 'contain' }}>
      <ScoreDisplay totalScore={totalScore} rounds={rounds} />

      <Button onClick={handlePlayAgain}>Tekrar Oyna</Button>
      <Button variant="secondary" onClick={() => router.push('/')}>Ana Sayfa</Button>
    </div>
  );
}
