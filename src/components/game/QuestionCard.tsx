import { QuestionPublic } from '@/types';
import { numberToTurkish } from '@/lib/utils';

interface QuestionCardProps {
  question: QuestionPublic;
  round: number;
  total: number;
  inputValue: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  distance: '#6366F1',
  scale:    '#F97316',
  space:    '#10B981',
  time:     '#F59E0B',
  human:    '#EC4899',
};

const CATEGORY_LABELS: Record<string, string> = {
  distance: 'Mesafe',
  scale:    'Ağırlık',
  space:    'Alan',
  time:     'Zaman',
  human:    'İnsan',
};

function renderQuestionText(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
        {part}
      </strong>
    ) : (
      part
    )
  );
}

export default function QuestionCard({ question, round, total, inputValue }: QuestionCardProps) {
  const progress = round / total;
  const catColor = CATEGORY_COLORS[question.category] ?? 'var(--color-accent)';
  const catLabel = CATEGORY_LABELS[question.category] ?? question.category;

  return (
    <div className="px-5 pt-5 pb-4 animate-fade-up">
      {/* Progress bar */}
      <div
        className="w-full h-1 rounded-full mb-4 overflow-hidden"
        style={{ backgroundColor: 'var(--color-border)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress * 100}%`, backgroundColor: catColor }}
        />
      </div>

      {/* Üst satır: kategori + tur */}
      <div className="flex items-center justify-between mb-5">
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: `${catColor}18`,
            color: catColor,
            letterSpacing: '0.02em',
          }}
        >
          {catLabel}
        </span>
        <span
          className="text-sm font-mono"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {round} / {total}
        </span>
      </div>

      {/* Soru metni */}
      <p
        className="text-xl font-semibold leading-snug mb-6 animate-fade-up delay-100"
        style={{
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.02em',
        }}
      >
        {renderQuestionText(question.question_text)}
      </p>

      {/* Input gösterimi */}
      <div
        className="rounded-2xl border px-4 py-4"
        style={{
          backgroundColor: inputValue ? 'var(--color-surface)' : 'var(--color-surface-alt)',
          borderColor: inputValue ? catColor : 'var(--color-border)',
          borderWidth: inputValue ? '2px' : '1px',
          transition: 'border-color 0.2s, background-color 0.2s',
        }}
      >
        <div className="flex items-baseline justify-end gap-2">
          <span
            className="text-4xl font-mono font-bold tracking-tight"
            style={{
              color: inputValue ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              transition: 'color 0.15s',
              letterSpacing: '-0.03em',
            }}
          >
            {inputValue ? parseInt(inputValue, 10).toLocaleString('tr-TR') : '—'}
          </span>
          {inputValue && (
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {question.unit}
            </span>
          )}
        </div>
        {inputValue && parseInt(inputValue, 10) >= 1000 && (
          <p
            className="text-xs mt-1 text-right"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {numberToTurkish(parseInt(inputValue, 10))}
          </p>
        )}
      </div>
    </div>
  );
}
