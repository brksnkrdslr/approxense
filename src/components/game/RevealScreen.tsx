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
  roundAnswers?: { playerId: string; displayName: string | null; color?: string; guessedValue: number | null; finalScore: number }[];
  isMultiplayer?: boolean;
}

function renderQuestionText(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} style={{ color: 'var(--color-accent)', fontWeight: 700 }}>{part}</strong> : part
  );
}

function getScoreColor(score: number): string {
  if (score >= 8) return 'var(--color-reward)';
  if (score >= 5) return 'var(--color-accent)';
  if (score >= 2) return 'var(--color-warning)';
  return 'var(--color-danger)';
}

function getScoreLabel(score: number): string {
  if (score >= 9) return 'Mükemmel!';
  if (score >= 7) return 'Harika!';
  if (score >= 5) return 'İyi!';
  if (score >= 2) return 'Fena değil';
  return 'Kaçırdın';
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
  roundAnswers,
  isMultiplayer = false,
}: RevealScreenProps) {
  const [nextPressed, setNextPressed] = useState(false);
  const isLast = round === total;
  const scoreColor = getScoreColor(scoreResult.finalScore);
  const scoreLabel = getScoreLabel(scoreResult.finalScore);

  function handleNext() {
    setNextPressed(true);
    onNext();
  }

  return (
    <div className="px-5 pt-5 pb-48 flex flex-col gap-4 overflow-y-auto animate-fade-in" style={{ height: '100%' }}>

      {/* Skor büyük — en üstte */}
      <div
        className="rounded-2xl p-5 text-center animate-score-pop"
        style={{
          background: `linear-gradient(135deg, ${scoreColor}14 0%, ${scoreColor}06 100%)`,
          border: `2px solid ${scoreColor}30`,
        }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: scoreColor, letterSpacing: '0.12em' }}
        >
          {scoreLabel}
        </p>
        <p
          className="font-mono font-bold leading-none"
          style={{ fontSize: '4rem', color: scoreColor, letterSpacing: '-0.04em' }}
        >
          {formatScore(scoreResult.finalScore)}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Toplam: <span className="font-mono font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatScore(cumulativeScore)}</span>
        </p>
      </div>

      {/* Soru + cevaplar */}
      <div
        className="rounded-2xl border p-4 flex flex-col gap-4 animate-slide-up delay-100"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <p className="text-sm leading-snug text-center" style={{ color: 'var(--color-text-secondary)' }}>
          {renderQuestionText(question.question_text)}
        </p>

        <div className="grid grid-cols-2 gap-3">
          {/* Tahmin */}
          <div
            className="rounded-xl p-3 text-center"
            style={{ backgroundColor: 'var(--color-surface-alt)' }}
          >
            <p className="text-xs mb-2 font-medium" style={{ color: 'var(--color-text-muted)' }}>Tahminin</p>
            <p
              className="font-mono font-bold break-all leading-tight"
              style={{
                color: 'var(--color-text-primary)',
                fontSize: guessedValue !== null && guessedValue.toLocaleString('tr-TR').length > 9 ? '0.75rem' : '1.1rem',
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

          {/* Doğru cevap */}
          <div
            className="rounded-xl p-3 text-center animate-reveal-answer delay-200"
            style={{
              backgroundColor: 'var(--color-accent-subtle, #6366f115)',
              border: '1.5px solid var(--color-accent)',
            }}
          >
            <p className="text-xs mb-2 font-medium" style={{ color: 'var(--color-accent)' }}>Doğru Cevap</p>
            <p
              className="font-mono font-bold break-all leading-tight"
              style={{
                color: 'var(--color-accent)',
                fontSize: scoreResult.actualAnswer.toLocaleString('tr-TR').length > 9 ? '0.75rem' : '1.1rem',
              }}
            >
              {scoreResult.actualAnswer.toLocaleString('tr-TR')}
            </p>
            {scoreResult.actualAnswer >= 1000 && (
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-accent)', opacity: 0.7 }}>
                {numberToTurkish(scoreResult.actualAnswer)}
              </p>
            )}
            <p className="text-xs mt-1" style={{ color: 'var(--color-accent)', opacity: 0.7 }}>{scoreResult.unit}</p>
          </div>
        </div>

        {/* Tur göstergesi */}
        <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Tur {round} / {total}</span>
          <div className="flex gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: i < round ? 'var(--color-accent)' : 'var(--color-border)',
                  transition: 'background-color 0.3s',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Çok oyunculu sıralama */}
      {roundAnswers && roundAnswers.length > 0 && (
        <div
          className="rounded-2xl border p-4 animate-slide-up delay-200"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
            Tur Sıralaması
          </p>
          <div className="flex flex-col gap-2">
            {[...roundAnswers].sort((a, b) => b.finalScore - a.finalScore).map((a, i) => {
              const isMe = a.playerId === currentPlayerId;
              const playerColor = a.color ?? 'var(--color-accent)';
              const scoreCol = getScoreColor(a.finalScore);
              return (
                <div key={a.playerId} className="flex items-center gap-3">
                  {/* Sıra */}
                  <span className="text-xs font-mono w-4 shrink-0 text-center" style={{ color: 'var(--color-text-muted)' }}>{i + 1}</span>
                  {/* Avatar */}
                  <div
                    className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                    style={{ width: '28px', height: '28px', backgroundColor: playerColor, fontSize: '0.7rem', boxShadow: `0 1px 6px ${playerColor}50` }}
                  >
                    {(a.displayName ?? 'O').slice(0, 1).toUpperCase()}
                  </div>
                  {/* İsim */}
                  <span className="text-sm font-semibold flex-1 truncate" style={{ color: playerColor, fontFamily: 'DM Sans, sans-serif' }}>
                    {a.displayName ?? 'Oyuncu'}{isMe ? <span className="ml-1 text-xs font-normal" style={{ color: 'var(--color-text-muted)' }}>(sen)</span> : ''}
                  </span>
                  {/* Tahmin + Puan */}
                  <div className="flex flex-col items-end shrink-0 gap-0.5">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>cevap</span>
                      <span className="text-xs font-mono font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {a.guessedValue !== null ? a.guessedValue.toLocaleString('tr-TR') : '—'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>puan</span>
                      <span className="text-sm font-mono font-bold" style={{ color: scoreCol }}>
                        {formatScore(a.finalScore)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sonraki butonu */}
      <div
        className="absolute bottom-0 left-0 right-0 p-4"
        style={{ backgroundColor: 'var(--color-bg)', borderTop: '1px solid var(--color-border)' }}
      >
        <Button onClick={handleNext} disabled={nextPressed}>
          {nextPressed && isMultiplayer
            ? '⏳ Diğerleri bekleniyor…'
            : isLast
            ? 'Sonuçları Gör →'
            : 'Sonraki Soru →'}
        </Button>
      </div>
    </div>
  );
}
