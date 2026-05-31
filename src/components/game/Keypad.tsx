'use client';

interface KeypadProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  // Hazır butonu
  onSubmitReady?: () => void;
  submitReady?: boolean;       // bu oyuncu hazır mı
  submitReadyCount?: number;   // kaç oyuncu hazır (çok oyunculu)
  totalPlayers?: number;       // toplam oyuncu sayısı
}

const KEYS = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['.000', '0', '⌫'],
];

function BackspaceIcon() {
  return (
    <svg width="22" height="18" viewBox="0 0 22 18" fill="currentColor">
      <path d="M9 0L0 9l9 9h13V0H9zm11 16H9.83L2.42 9l7.41-7H20v14zm-7.59-11L9 7.41 10.59 9 9 10.59 10.41 12 12 10.41 13.59 12 15 10.59 13.41 9 15 7.41z"/>
    </svg>
  );
}

export default function Keypad({
  value,
  onChange,
  disabled = false,
  onSubmitReady,
  submitReady = false,
  submitReadyCount,
  totalPlayers,
}: KeypadProps) {
  function handleKey(key: string) {
    if (disabled) return;

    if (key === '⌫') {
      onChange(value.slice(0, -1));
      return;
    }

    if (key === '.000') {
      if (value === '' || value === '0') return;
      const next = value + '000';
      if (next.length > 15) return;
      onChange(next);
      return;
    }

    if (key === '0' && value === '') return;

    const next = value + key;
    if (next.length > 15) return;
    onChange(next);
  }

  const showHazir = !!onSubmitReady;
  const isMulti = totalPlayers !== undefined && totalPlayers > 1;
  const readyLabel = isMulti
    ? submitReady
      ? `⏳ Bekleniyor… ${submitReadyCount ?? 1}/${totalPlayers} (İptal)`
      : 'Hazır'
    : submitReady
      ? '⏳ Hesaplanıyor…'
      : 'Hazır';

  return (
    <div
      className="absolute bottom-0 left-0 right-0 w-full"
      style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}
    >
      {showHazir && (
        <div className="px-3 pt-3">
          <button
            onClick={onSubmitReady}
            className="w-full rounded-[10px] text-base font-medium transition-colors"
            style={{
              minHeight: '52px',
              backgroundColor: submitReady ? 'var(--color-surface-alt)' : 'var(--color-accent)',
              color: submitReady ? 'var(--color-text-secondary)' : 'white',
              border: submitReady ? '1px solid var(--color-border)' : 'none',
            }}
          >
            {readyLabel}
          </button>
        </div>
      )}

      <div className="p-3 grid grid-rows-4 gap-2">
        {KEYS.map((row, ri) => (
          <div key={ri} className="grid grid-cols-3 gap-2">
            {row.map((key) => (
              <button
                key={key}
                aria-label={key}
                disabled={disabled}
                onClick={() => handleKey(key)}
                className="rounded-[10px] border font-mono font-medium transition-colors active:scale-95 disabled:opacity-40 flex items-center justify-center"
                style={{
                  minHeight: '64px',
                  fontSize: '1.25rem',
                  backgroundColor: key === '⌫' ? 'rgba(239,68,68,0.08)' : 'var(--color-surface)',
                  borderColor: key === '⌫' ? 'rgba(239,68,68,0.25)' : 'var(--color-border)',
                  color: key === '⌫' ? 'var(--color-danger)' : 'var(--color-text-primary)',
                }}
              >
                {key === '⌫' ? <BackspaceIcon /> : key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
