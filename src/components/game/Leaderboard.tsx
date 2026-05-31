import { formatScore } from '@/lib/utils';

interface LeaderboardEntry {
  playerId: string;
  displayName: string | null;
  score: number;
  isConnected: boolean;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentPlayerId: string;
}

export default function Leaderboard({ entries, currentPlayerId }: LeaderboardProps) {
  const sorted = [...entries].sort((a, b) => b.score - a.score);

  return (
    <div
      className="rounded-[16px] border divide-y"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {sorted.map((entry, i) => {
        const isMe = entry.playerId === currentPlayerId;
        return (
          <div
            key={entry.playerId}
            className="flex items-center justify-between px-4 py-3"
            style={isMe ? { backgroundColor: 'var(--color-surface-alt)' } : {}}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono w-4" style={{ color: 'var(--color-text-muted)' }}>
                {i + 1}
              </span>
              <span
                className="text-sm font-medium"
                style={{ color: isMe ? 'var(--color-accent)' : 'var(--color-text-primary)' }}
              >
                {entry.displayName || `Oyuncu ${i + 1}`}
                {isMe && (
                  <span className="ml-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    (Sen)
                  </span>
                )}
              </span>
              {!entry.isConnected && (
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  ayrıldı
                </span>
              )}
            </div>
            <span className="text-sm font-mono" style={{ color: 'var(--color-text-primary)' }}>
              {formatScore(entry.score)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
