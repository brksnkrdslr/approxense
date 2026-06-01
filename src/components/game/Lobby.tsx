'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import SettingsPanel from '@/components/game/SettingsPanel';
import { GameSettings } from '@/types';

interface LobbyPlayer {
  playerId: string;
  displayName: string | null;
  color: string;
  isReady: boolean;
  isConnected: boolean;
}

interface LobbyProps {
  players: LobbyPlayer[];
  countdown: number | null;
  currentPlayerId: string;
  isReady: boolean;
  onReady: () => void;
  onStartNow: () => void;
  joinUrl: string;
  settings: GameSettings;
  onSettingsChange: (s: GameSettings) => void;
  isHost: boolean;
  isSolo: boolean;
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  );
}

export default function Lobby({
  players,
  countdown,
  currentPlayerId,
  isReady,
  onReady,
  onStartNow,
  joinUrl,
  settings,
  onSettingsChange,
  isHost,
  isSolo,
}: LobbyProps) {
  const [copied, setCopied] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const router = useRouter();

  const readyCount = players.filter((p) => p.isReady).length;
  const canStartNow = readyCount > players.length / 2;

  async function shareLink() {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Approxense', text: 'Benimle Approxense oyna!', url: joinUrl });
        return;
      }
    } catch {}
    try {
      await navigator.clipboard.writeText(joinUrl);
    } catch {
      const el = document.createElement('input');
      el.value = joinUrl;
      Object.assign(el.style, { position: 'fixed', top: '0', left: '0', opacity: '0', fontSize: '16px' });
      el.readOnly = true;
      document.body.appendChild(el);
      el.focus();
      el.setSelectionRange(0, joinUrl.length);
      try { document.execCommand('copy'); } catch {}
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const shortUrl = joinUrl.replace(/^https?:\/\//, '');

  return (
    <div className="px-5 pt-5 pb-8 flex flex-col gap-5 animate-fade-up">

      {/* Üst bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-sm cursor-pointer"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Geri
        </button>
        {countdown !== null && (
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--color-accent)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-accent)' }} />
            <span className="text-sm font-mono font-semibold">{countdown}s</span>
          </div>
        )}
      </div>

      {/* Oyuncular */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.12em' }}>
            Oyuncular
          </p>
          <p className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
            {readyCount}/{players.length} hazır
          </p>
        </div>

        <div
          className="rounded-2xl border divide-y overflow-hidden"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          {players.map((player, i) => {
            const isMe = player.playerId === currentPlayerId;
            const initial = (player.displayName || `O${i + 1}`).slice(0, 1).toUpperCase();
            return (
              <div key={player.playerId} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                    style={{
                      width: '36px',
                      height: '36px',
                      backgroundColor: player.color,
                      fontSize: '0.875rem',
                      boxShadow: `0 2px 8px ${player.color}40`,
                    }}
                  >
                    {initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight" style={{ color: player.color }}>
                      {player.displayName || `Oyuncu ${i + 1}`}
                      {isMe && <span className="ml-1.5 text-xs font-normal" style={{ color: 'var(--color-text-muted)' }}>sen</span>}
                    </p>
                  </div>
                </div>
                {/* Ready badge */}
                <div
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: player.isReady ? 'rgba(16,185,129,0.1)' : 'var(--color-surface-alt)',
                    color: player.isReady ? 'var(--color-success)' : 'var(--color-text-muted)',
                    transition: 'background-color 0.2s, color 0.2s',
                  }}
                >
                  {player.isReady ? (
                    <>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      Hazır
                    </>
                  ) : 'Bekliyor'}
                </div>
              </div>
            );
          })}

          {players.length === 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Bağlanılıyor…</p>
            </div>
          )}

          {/* Davet slot */}
          <button
            onClick={shareLink}
            className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
            style={{
              backgroundColor: copied ? 'rgba(16,185,129,0.06)' : 'transparent',
              transition: 'background-color 0.2s',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: copied ? 'rgba(16,185,129,0.12)' : 'var(--color-surface-alt)',
                  border: `2px dashed ${copied ? 'var(--color-success)' : 'var(--color-border)'}`,
                  transition: 'background-color 0.2s, border-color 0.2s',
                }}
              >
                {copied ? (
                  <CheckIcon />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-muted)' }}>
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                )}
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: copied ? 'var(--color-success)' : 'var(--color-text-muted)', transition: 'color 0.2s' }}
              >
                {copied ? 'Link kopyalandı!' : 'Oyuncu davet et'}
              </span>
            </div>
            {!copied && (
              <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
                link kopyala
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Ayarlar */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <button
          className="w-full flex items-center justify-between px-4 py-3.5 cursor-pointer"
          onClick={() => isHost && setSettingsOpen((v) => !v)}
          style={{ opacity: !isHost && !settingsOpen ? 0.7 : 1 }}
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Oyun Ayarları
          </span>
          <div className="flex items-center gap-2">
            {!isHost && (
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Host ayarlıyor</span>
            )}
            {isHost && (
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: settingsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: 'var(--color-text-muted)' }}
              >
                <path d="M6 9l6 6 6-6"/>
              </svg>
            )}
          </div>
        </button>

        {settingsOpen && (
          <div className="px-4 pb-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <div className="pt-4">
              <SettingsPanel settings={settings} onChange={onSettingsChange} readonly={!isHost} />
            </div>
          </div>
        )}
      </div>

      {/* Butonlar */}
      <div className="flex flex-col gap-3">
        <Button onClick={onReady} variant={isReady ? 'secondary' : 'primary'}>
          {isSolo
            ? 'Tek Başına Oyna'
            : isReady
            ? 'Hazır — İptal et'
            : 'Hazır'}
        </Button>
        {canStartNow && !isSolo && (
          <Button onClick={onStartNow} variant="secondary">
            Hemen Başla
          </Button>
        )}
      </div>
    </div>
  );
}
