import { RoundScore } from '@/types';
import { formatScore } from '@/lib/utils';

interface ScoreDisplayProps {
  totalScore: number;
  rounds: RoundScore[];
}

export default function ScoreDisplay({ totalScore, rounds }: ScoreDisplayProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center py-6">
        <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
          Toplam Puan
        </p>
        <p className="text-6xl font-mono font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {formatScore(totalScore)}
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          / 100.00
        </p>
      </div>

      <div
        className="rounded-[16px] border divide-y"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        {rounds.map((round, i) => (
          <div key={round.questionId} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-mono w-4"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {i + 1}
              </span>
              <span
                className="text-sm"
                style={{ color: 'var(--color-text-secondary)', maxWidth: '200px' }}
              >
                {round.questionText.replace(/\*\*/g, '').slice(0, 40)}
                {round.questionText.length > 40 ? '…' : ''}
              </span>
            </div>
            <span
              className="text-sm font-mono font-medium"
              style={{ color: 'var(--color-accent)' }}
            >
              {formatScore(round.finalScore)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
