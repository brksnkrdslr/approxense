'use client';

import { useState } from 'react';
import { ScoreResult, QuestionPublic } from '@/types';
import { formatScore, numberToTurkish } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface RevealScreenProps {
  question: QuestionPublic;
  guessedValue: number | null;
  scoreResult: ScoreResult;
  cumulativeScore: number;
  round: number;
  total: number;
  onNext: () => void;
  currentPlayerId?: string;
  leaderboard?: { playerId: string; displayName: string | null; score: number }[];
  roundAnswers?: { playerId: string; displayName: string | null; guessedValue: number | null; finalScore: number }[];
  isMultiplayer?: boolean;
}

function renderQuestionText(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} style={{ color: 'var(--color-accent)' }}>{part}</strong> : part
  );
}

export default function RevealScreen({
  question,
  guessedValue,
  scoreResult,
  cumulativeScore,
  round,
  total,
  onNext,
  currentPlayerId,
  leaderboard,
  roundAnswers,
  isMultiplayer = false,
}: RevealScreenProps) {
  const [nextPressed, setNextPressed] = useState(false);
  const isLast = round === total;

  function handleNext() {
    setNextPressed(true);
    onNext();
  }

  return (
    <div className="px-5 pt-6 pb-48 flex flex-col gap-6">
      {/* Soru + skorlar */}
      <div
        className="rounded-[16px] border p-5 flex flex-col gap-4"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {renderQuestionText(question.question_text)}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[12px] p-3 text-center" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Tahminin</p>
            <p
              className="font-mono font-medium break-all leading-tight"
              style={{
                color: 'var(--color-text-primary)',
                fontSize: guessedValue !== null && guessedValue.toLocaleString('tr-TR').length > 9 ? '0.8rem' : '1.125rem',
              }}
            >
              {guessedValue !== null ? guessedValue.toLocaleString('tr-TR') : '—'}
            </p>
            {guessedValue !== null && guessedValue >= 1000 && (
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
                {numberToTurkish(guessedValue)}
              </p>
            )}
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{question.unit}</p>
          </div>

          <div className="rounded-[12px] p-3 text-center" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Doğru Cevap</p>
            <p
              className="font-mono font-medium break-all leading-tight"
              style={{
                color: 'var(--color-success)',
                fontSize: scoreResult.actualAnswer.toLocaleString('tr-TR').length > 9 ? '0.8rem' : '1.125rem',
              }}
            >
              {scoreResult.actualAnswer.toLocaleString('tr-TR')}
            </p>
            {scoreResult.actualAnswer >= 1000 && (
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
                {numberToTurkish(scoreResult.actualAnswer)}
              </p>
            )}
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{scoreResult.unit}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Bu tur</span>
          <span className="text-2xl font-mono font-medium" style={{ color: 'var(--color-accent)' }}>
            {formatScore(scoreResult.finalScore)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Toplam</span>
          <span className="text-lg font-mono" style={{ color: 'var(--color-text-primary)' }}>
            {formatScore(cumulativeScore)}
          </span>
        </div>
      </div>

      {/* Diğer oyuncuların cevapları */}
      {roundAnswers && roundAnswers.length > 0 && (
        <div
          className="rounded-[16px] border p-5"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>Bu Tur Cevaplar</p>
          <div className="flex flex-col gap-2">
            {roundAnswers.map((a) => {
              const isMe = a.playerId === currentPlayerId;
              return (
                <div key={a.playerId} className="flex items-center justify-between gap-2">
                  <span className="text-xs w-20 truncate shrink-0" style={{ color: isMe ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>
                    {a.displayName ?? 'Oyuncu'}{isMe ? ' (Sen)' : ''}
                  </span>
                  <div className="flex-1 text-right">
                    <span className="text-sm font-mono" style={{ color: 'var(--color-text-primary)' }}>
                      {a.guessedValue !== null ? a.guessedValue.toLocaleString('tr-TR') : '—'}
                    </span>
                  </div>
                  <span className="text-sm font-mono w-10 text-right shrink-0" style={{ color: 'var(--color-accent)' }}>
                    {formatScore(a.finalScore)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {leaderboard && leaderboard.length > 0 && (
        <div
          className="rounded-[16px] border p-5"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>Sıralama</p>
          <div className="flex flex-col gap-2">
            {leaderboard.map((player, i) => {
              const isMe = player.playerId === currentPlayerId;
              return (
                <div key={player.playerId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono w-5" style={{ color: 'var(--color-text-muted)' }}>{i + 1}</span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: isMe ? 'var(--color-accent)' : 'var(--color-text-primary)' }}
                    >
                      {player.displayName || `Oyuncu ${i + 1}`}
                      {isMe && <span className="ml-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>(Sen)</span>}
                    </span>
                  </div>
                  <span className="text-sm font-mono" style={{ color: 'var(--color-accent)' }}>
                    {formatScore(player.score)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sonraki butonu */}
      <div
        className="absolute bottom-0 left-0 right-0 p-4"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <Button onClick={handleNext} disabled={nextPressed}>
          {nextPressed && isMultiplayer
            ? '⏳ Diğerleri bekleniyor…'
            : isLast
            ? 'Sonuçları Gör'
            : 'Sonraki →'}
        </Button>
      </div>
    </div>
  );
}
