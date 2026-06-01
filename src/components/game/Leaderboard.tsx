import { formatScore } from '@/lib/utils';

interface LeaderboardEntry {
  playerId: string;
  displayName: string | null;
  color: string;
  score: number;
  isConnected: boolean;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentPlayerId: string;
}

const RANK_MEDALS = [
  { label: '1', color: '#B8860B', bg: 'rgba(184,134,11,0.10)', border: 'rgba(184,134,11,0.35)' },
  { label: '2', color: '#6B7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.25)' },
  { label: '3', color: '#92400E', bg: 'rgba(146,64,14,0.08)', border: 'rgba(146,64,14,0.25)' },
];

function TrophyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"/>
      <path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/>
      <path d="M6 2h12v10a6 6 0 0 1-12 0V2z"/>
      <path d="M6 17v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1"/>
      <line x1="9" y1="22" x2="15" y2="22"/>
    </svg>
  );
}

export default function Leaderboard({ entries, currentPlayerId }: LeaderboardProps) {
  const sorted = [...entries].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const rest = sorted.slice(1);

  if (sorted.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">

      {/* 1. sıra — büyük kart */}
      {winner && (() => {
        const isMe = winner.playerId === currentPlayerId;
        const medal = RANK_MEDALS[0];
        return (
          <div
            className="rounded-2xl px-5 py-5 animate-score-pop"
            style={{
              background: `linear-gradient(135deg, ${winner.color}18 0%, ${winner.color}08 100%)`,
              border: `2px solid ${winner.color}40`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2" style={{ color: medal.color }}>
                <TrophyIcon />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ letterSpacing: '0.1em' }}>
                  1. Sıra
                </span>
              </div>
              {!winner.isConnected && (
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>ayrıldı</span>
              )}
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p
                  className="text-xl font-bold leading-tight"
                  style={{ color: winner.color, letterSpacing: '-0.02em' }}
                >
                  {winner.displayName || 'Oyuncu 1'}
                  {isMe && (
                    <span className="ml-2 text-sm font-normal" style={{ color: 'var(--color-text-secondary)' }}>
                      (Sen)
                    </span>
                  )}
                </p>
              </div>
              <p
                className="font-mono font-bold leading-none"
                style={{ fontSize: '2.4rem', color: winner.color, letterSpacing: '-0.04em' }}
              >
                {formatScore(winner.score)}
              </p>
            </div>
          </div>
        );
      })()}

      {/* 2. sıra ve sonrası */}
      {rest.length > 0 && (
        <div
          className="rounded-2xl border divide-y overflow-hidden animate-slide-up"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          {rest.map((entry, i) => {
            const rank = i + 2;
            const isMe = entry.playerId === currentPlayerId;
            const medal = RANK_MEDALS[rank - 1];
            return (
              <div
                key={entry.playerId}
                className="flex items-center justify-between px-4 py-3"
                style={isMe ? { backgroundColor: 'var(--color-surface-alt)' } : {}}
              >
                <div className="flex items-center gap-3">
                  {/* Sıra numarası */}
                  <span
                    className="text-xs font-mono font-semibold w-5 text-center shrink-0"
                    style={{ color: medal ? medal.color : 'var(--color-text-secondary)' }}
                  >
                    {rank}
                  </span>
                  {/* Renk noktası */}
                  <span
                    className="rounded-sm flex-shrink-0"
                    style={{ width: '8px', height: '8px', backgroundColor: entry.color }}
                  />
                  {/* İsim */}
                  <span
                    className="text-sm font-semibold"
                    style={{ color: entry.color }}
                  >
                    {entry.displayName || `Oyuncu ${rank}`}
                    {isMe && (
                      <span className="ml-1.5 text-xs font-normal" style={{ color: 'var(--color-text-secondary)' }}>
                        (Sen)
                      </span>
                    )}
                  </span>
                  {!entry.isConnected && (
                    <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>ayrıldı</span>
                  )}
                </div>
                <span
                  className="text-base font-mono font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {formatScore(entry.score)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
