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
  const readyCount = players.filter((p) => p.isReady).length;
  const canStartNow = readyCount > players.length / 2;

  async function shareLink() {
    // 1. Native share (HTTPS'de çalışır)
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Approxense',
          text: 'Benimle Approxense oyna!',
          url: joinUrl,
        });
        return;
      }
    } catch {
      // iptal edildi veya desteklenmiyor
    }

    // 2. Clipboard API (HTTPS'de çalışır)
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    } catch {
      // HTTP'de çalışmıyor, execCommand'a dön
    }

    // 3. execCommand fallback (HTTP dahil her yerde çalışır)
    const el = document.createElement('input');
    el.value = joinUrl;
    el.style.position = 'fixed';
    el.style.top = '0';
    el.style.left = '0';
    el.style.opacity = '0';
    el.style.fontSize = '16px'; // iOS zoom'u önle
    el.readOnly = true;
    document.body.appendChild(el);
    el.focus();
    el.setSelectionRange(0, joinUrl.length);
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
    document.body.removeChild(el);
  }

  const [copied, setCopied] = useState(false);
  const router = useRouter();

  return (
    <div className="px-5 pt-6 pb-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="text-sm px-2 py-1 rounded-lg"
          style={{ color: 'var(--color-text-muted)' }}
        >
          ← Ana Sayfa
        </button>
        {countdown !== null && (
          <div className="flex items-center gap-1">
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Başlıyor:
            </span>
            <span className="text-xl font-mono font-medium" style={{ color: 'var(--color-accent)' }}>
              {countdown}s
            </span>
          </div>
        )}
      </div>

      <div
        className="rounded-[16px] border divide-y"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        {players.map((player, i) => {
          const isMe = player.playerId === currentPlayerId;
          return (
            <div key={player.playerId} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span
                  className="rounded-sm flex-shrink-0"
                  style={{ width: '10px', height: '10px', backgroundColor: player.color }}
                />
                <span
                  className="text-sm font-bold"
                  style={{ color: player.color }}
                >
                  {player.displayName || `Oyuncu ${i + 1}`}
                  {isMe && (
                    <span className="ml-1 text-xs font-normal" style={{ color: 'var(--color-text-muted)' }}>
                      (Sen)
                    </span>
                  )}
                </span>
              </div>
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  backgroundColor: player.isReady ? 'rgba(16,185,129,0.1)' : 'var(--color-surface-alt)',
                  color: player.isReady ? 'var(--color-success)' : 'var(--color-text-muted)',
                }}
              >
                {player.isReady ? 'Hazır' : 'Bekleniyor'}
              </span>
            </div>
          );
        })}

        {players.length === 0 && (
          <p className="px-4 py-4 text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
            Henüz oyuncu yok
          </p>
        )}
      </div>

      <button
        onClick={shareLink}
        className="w-full rounded-[12px] border px-4 py-4 text-sm font-medium flex items-center justify-center gap-2"
        style={{
          backgroundColor: copied ? 'rgba(16,185,129,0.08)' : 'var(--color-surface)',
          borderColor: copied ? 'var(--color-success)' : 'var(--color-border)',
          color: copied ? 'var(--color-success)' : 'var(--color-text-primary)',
        }}
      >
        <span>{copied ? '✓' : '🔗'}</span>
        <span>{copied ? 'Link kopyalandı!' : 'Yeni oyuncu davet et'}</span>
      </button>

      {/* Ayarlar */}
      <div className="rounded-[16px] border px-4 py-4" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Oyun Ayarları</span>
          {!isHost && <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Host ayarlıyor</span>}
        </div>
        <SettingsPanel settings={settings} onChange={onSettingsChange} readonly={!isHost} />
      </div>

      <div className="flex flex-col gap-3">
        <Button onClick={onReady} variant={isReady ? 'secondary' : 'primary'}>
          {isSolo ? 'Tek Başına Oyna' : isReady ? '⏳ Bekleniyor… (İptal için bas)' : 'Hazır'}
        </Button>
        {canStartNow && (
          <Button onClick={onStartNow} variant="secondary">
            Hemen Başla
          </Button>
        )}
      </div>
    </div>
  );
}
