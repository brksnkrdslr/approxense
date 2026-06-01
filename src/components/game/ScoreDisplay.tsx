'use client';

import { useEffect, useState } from 'react';
import { RoundScore } from '@/types';
import { formatScore } from '@/lib/utils';

interface ScoreDisplayProps {
  totalScore: number;
  rounds: RoundScore[];
}

function getScoreColor(score: number): string {
  if (score >= 8) return 'var(--color-reward)';
  if (score >= 5) return 'var(--color-accent)';
  if (score >= 2) return 'var(--color-warning)';
  return 'var(--color-danger)';
}

function getScoreGrade(total: number): { label: string; color: string } {
  if (total >= 85) return { label: 'Tahmin Dahisi', color: 'var(--color-reward)' };
  if (total >= 70) return { label: 'Çok İyi', color: 'var(--color-accent)' };
  if (total >= 50) return { label: 'Ortalama Üstü', color: 'var(--color-success)' };
  if (total >= 30) return { label: 'Gelişiyor', color: 'var(--color-warning)' };
  return { label: 'Tekrar Dene', color: 'var(--color-danger)' };
}

export default function ScoreDisplay({ totalScore, rounds }: ScoreDisplayProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const grade = getScoreGrade(totalScore);

  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const increment = totalScore / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(step * increment, totalScore);
      setDisplayScore(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [totalScore]);

  return (
    <div className="flex flex-col gap-4">
      {/* Toplam skor kartı */}
      <div
        className="rounded-2xl p-6 text-center animate-score-pop"
        style={{
          background: `linear-gradient(135deg, ${grade.color}14 0%, ${grade.color}06 100%)`,
          border: `2px solid ${grade.color}30`,
        }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-1"
          style={{ color: grade.color, letterSpacing: '0.12em' }}
        >
          {grade.label}
        </p>
        <p
          className="font-mono font-bold leading-none my-3"
          style={{ fontSize: '5rem', color: grade.color, letterSpacing: '-0.04em' }}
        >
          {formatScore(displayScore)}
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          100 üzerinden
        </p>
      </div>

      {/* Tur dökümü */}
      <div
        className="rounded-2xl border overflow-hidden animate-slide-up delay-300"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
            Tur Dökümü
          </p>
        </div>
        {rounds.map((round, i) => {
          const col = getScoreColor(round.finalScore);
          const barWidth = (round.finalScore / 10) * 100;
          return (
            <div
              key={round.questionId}
              className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <span
                className="text-xs font-mono w-4 shrink-0 text-center"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm truncate mb-1"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {round.questionText.replace(/\*\*/g, '').slice(0, 38)}
                  {round.questionText.length > 38 ? '…' : ''}
                </p>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: col,
                      transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
                    }}
                  />
                </div>
              </div>
              <span
                className="text-sm font-mono font-semibold shrink-0"
                style={{ color: col, minWidth: '36px', textAlign: 'right' }}
              >
                {formatScore(round.finalScore)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
