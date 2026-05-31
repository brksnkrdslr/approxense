'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getOrCreatePlayerId, getOrCreateDisplayName, getPlayerColor, savePlayerColor, PLAYER_COLORS } from '@/lib/utils';
import Lobby from '@/components/game/Lobby';
import QuestionCard from '@/components/game/QuestionCard';
import RevealScreen from '@/components/game/RevealScreen';
import Timer from '@/components/ui/Timer';
import Keypad from '@/components/game/Keypad';
import Leaderboard from '@/components/game/Leaderboard';
import { QuestionPublic, ScoreResult, RoundScore } from '@/types';

type RoomPhase = 'lobby' | 'countdown' | 'playing' | 'reveal' | 'finished';

interface LobbyPlayer {
  playerId: string;
  displayName: string | null;
  color: string;
  isReady: boolean;
  isConnected: boolean;
}

interface LeaderboardEntry {
  playerId: string;
  displayName: string | null;
  color: string;
  score: number;
  isConnected: boolean;
}

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const playerId = useRef(getOrCreatePlayerId());

  // Nickname overlay — sadece daha önce özelleştirilmemiş kullanıcılara göster
  const [showNickname, setShowNickname] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('approxense_display_name');
    return !saved || saved.startsWith('Misafir');
  });
  const [nickInput, setNickInput] = useState('');
  const [nickColor, setNickColor] = useState(() =>
    typeof window !== 'undefined' ? getPlayerColor() : PLAYER_COLORS[0]
  );

  const [phase, setPhase] = useState<RoomPhase>('lobby');
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionPublic[]>([]);
  const [round, setRound] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [rounds, setRounds] = useState<RoundScore[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [joinUrl, setJoinUrl] = useState('');
  const [nextPressedBy, setNextPressedBy] = useState<Set<string>>(new Set());
  const [startCountdown, setStartCountdown] = useState(3);
  const [restartReadyBy, setRestartReadyBy] = useState<Set<string>>(new Set());
  const [readyPlayerIds, setReadyPlayerIds] = useState<string[]>([]);
  const [shouldStart, setShouldStart] = useState(false);
  const [answerReadyBy, setAnswerReadyBy] = useState<string[]>([]);
  const [myAnswerReady, setMyAnswerReady] = useState(false);
  const inputValueRef = useRef('');
  const [roundAnswers, setRoundAnswers] = useState<{ playerId: string; displayName: string | null; guessedValue: number | null; finalScore: number }[]>([]);
  const [myDisplayName, setMyDisplayName] = useState<string>(() =>
    typeof window !== 'undefined' ? getOrCreateDisplayName() : ''
  );
  const myColor = typeof window !== 'undefined' ? getPlayerColor() : '#6366f1';
  const submitLock = useRef(false);
  const submitGuessRef = useRef<(value: string) => Promise<void>>(async () => {});
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const connectedPlayersRef = useRef<string[]>([]);

  const supabase = createClient();

  useEffect(() => {
    setJoinUrl(`${window.location.origin}/room/${roomId}`);
  }, [roomId]);

  // Tüm room page'de scroll kapalı
  useEffect(() => {
    window.scrollTo(0, 0);
    const prevent = (e: TouchEvent) => e.preventDefault();
    document.addEventListener('touchmove', prevent, { passive: false });
    return () => document.removeEventListener('touchmove', prevent);
  }, []);

  useEffect(() => {
    const pid = playerId.current;
    const initialName = getOrCreateDisplayName();
    let myName = initialName;
    fetch(`/api/rooms/${roomId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: pid, displayName: initialName }),
    }).then((r) => r.json()).then((d) => {
      if (d.displayName) {
        myName = d.displayName;
        setMyDisplayName(d.displayName);
      }
    });

    const channel = supabase.channel(`room:${roomId}`, {
      config: {
        presence: { key: pid },
        broadcast: { self: true }, // gönderen de kendi mesajını alsın
      },
    });
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'game_start' }, async ({ payload }) => {
        setSessionId(payload.sessionId);
        const res = await fetch(`/api/game/session?id=${payload.sessionId}`);
        if (!res.ok) return;
        const data = await res.json();
        setQuestions(data.questions);
        setPhase('countdown');
      })
      .on('broadcast', { event: 'restart_ready' }, ({ payload }: { payload: { playerId: string } }) => {
        // Lobideki badge ve ready listesini güncelle
        setPlayers((prev) =>
          prev.map((p) => p.playerId === payload.playerId ? { ...p, isReady: true } : p)
        );
        setReadyPlayerIds((prev) =>
          prev.includes(payload.playerId) ? prev : [...prev, payload.playerId]
        );
        setRestartReadyBy((prev) => {
          const next = new Set(prev);
          next.add(payload.playerId);
          const allReady = connectedPlayersRef.current.every((id) => next.has(id));
          if (allReady) {
            next.clear();
            // Herkes hazır — oyunu sıfırla ve başlat
            setRound(0);
            setRounds([]);
            setLeaderboard([]);
            setScoreResult(null);
            setInputValue('');
            setIsReady(false);
            setPlayers((prev) => prev.map((p) => ({ ...p, isReady: false })));
            setReadyPlayerIds([]);
            submitLock.current = false;
            // Sadece ilk basan (en küçük playerId) start'ı çağırır — race condition önleme
            const sorted = [...connectedPlayersRef.current].sort();
            if (sorted[0] === playerId.current) {
              channelRef.current?.send({
                type: 'broadcast',
                event: 'trigger_start',
                payload: {},
              });
            }
          }
          return next;
        });
      })
      .on('broadcast', { event: 'restart_unready' }, ({ payload }: { payload: { playerId: string } }) => {
        setPlayers((prev) =>
          prev.map((p) => p.playerId === payload.playerId ? { ...p, isReady: false } : p)
        );
        setReadyPlayerIds((prev) => prev.filter((id) => id !== payload.playerId));
        setRestartReadyBy((prev) => {
          const next = new Set(prev);
          next.delete(payload.playerId);
          return next;
        });
        if (payload.playerId === playerId.current) setIsReady(false);
      })
      .on('broadcast', { event: 'trigger_start' }, () => {
        // İlk oyuncu start'ı tetikledi, herkes hazır duruma geçti
        // startGame'i burada doğrudan çağırmak için flag kullanıyoruz
        setShouldStart(true);
      })
      .on('broadcast', { event: 'player_answer' }, ({ payload }: { payload: { playerId: string; displayName: string | null; guessedValue: number | null; finalScore: number } }) => {
        setRoundAnswers((prev) => {
          const next = prev.filter((a) => a.playerId !== payload.playerId);
          return [...next, payload];
        });
      })
      .on('broadcast', { event: 'answer_ready' }, ({ payload }: { payload: { playerId: string } }) => {
        setAnswerReadyBy((prev) => {
          const next = [...prev.filter((id) => id !== payload.playerId), payload.playerId];
          const allReady = connectedPlayersRef.current.length >= 2 &&
            connectedPlayersRef.current.every((id) => next.includes(id));
          if (allReady) {
            setAnswerReadyBy([]);
            setMyAnswerReady(false);
            submitGuessRef.current(inputValueRef.current);
          }
          return allReady ? [] : next;
        });
      })
      .on('broadcast', { event: 'answer_unready' }, ({ payload }: { payload: { playerId: string } }) => {
        setAnswerReadyBy((prev) => prev.filter((id) => id !== payload.playerId));
        if (payload.playerId === playerId.current) setMyAnswerReady(false);
      })
      .on('broadcast', { event: 'player_next' }, ({ payload }: { payload: { playerId: string; round: number } }) => {
        setNextPressedBy((prev) => {
          const next = new Set(prev);
          next.add(payload.playerId);
          // Bağlı oyuncuların hepsi bastıysa geç
          const allPressed = connectedPlayersRef.current.every((id) => next.has(id));
          if (allPressed) {
            next.clear();
            setRound((r) => {
              const nextRound = payload.round + 1;
              if (nextRound >= 10) {
                setPhase('finished');
              } else {
                setInputValue('');
                setScoreResult(null);
                setPhase('playing');
                setMyAnswerReady(false);
                setAnswerReadyBy([]);
                setRoundAnswers([]);
                submitLock.current = false;
              }
              return nextRound < 10 ? nextRound : r;
            });
          }
          return next;
        });
      })
      .on('broadcast', { event: 'player_score' }, ({ payload }: { payload: { playerId: string; displayName: string; color?: string; totalScore: number } }) => {
        setLeaderboard((prev) => {
          const next = prev.filter((e) => e.playerId !== payload.playerId);
          return [...next, { playerId: payload.playerId, displayName: payload.displayName, color: payload.color ?? '#6366f1', score: payload.totalScore, isConnected: true }]
            .sort((a, b) => b.score - a.score);
        });
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ playerId: string; displayName: string; color?: string }>();
        const entries = Object.values(state).flat();
        connectedPlayersRef.current = [...new Set(entries.map((e) => e.playerId))];
        setPlayers((prev) => {
          const map = new Map(prev.map((p) => [p.playerId, p]));
          entries.forEach((e) => {
            const existing = map.get(e.playerId);
            map.set(e.playerId, {
              playerId: e.playerId,
              displayName: e.displayName ?? existing?.displayName ?? null,
              color: e.color ?? existing?.color ?? '#6366f1',
              isReady: existing?.isReady ?? false,
              isConnected: true,
            });
          });
          // Ayrılanları sil
          map.forEach((_, key) => {
            if (!connectedPlayersRef.current.includes(key)) map.delete(key);
          });
          return Array.from(map.values());
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ playerId: pid, displayName: myName, color: getPlayerColor() });
        }
      });

    return () => {
      channel.unsubscribe();
      fetch(`/api/rooms/${roomId}/players/${pid}`, { method: 'DELETE' });
    };
  }, [roomId]);

  // inputValue ve submitGuess ref'lerini güncel tut (broadcast closure'ları için)
  useEffect(() => { inputValueRef.current = inputValue; }, [inputValue]);
  useEffect(() => { submitGuessRef.current = submitGuess; });

  // 3-2-1 geri sayım
  useEffect(() => {
    if (phase !== 'countdown') return;
    setStartCountdown(3);
    const interval = setInterval(() => {
      setStartCountdown((n) => {
        if (n <= 1) {
          clearInterval(interval);
          setPhase('playing');
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Trigger start (restart flow)
  useEffect(() => {
    if (!shouldStart) return;
    setShouldStart(false);
    startGame();
  }, [shouldStart]);

  async function startGame() {
    const res = await fetch(`/api/rooms/${roomId}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: playerId.current, force: true }),
    });
    if (!res.ok) return;
    const data = await res.json();
    // Broadcast sadece sessionId — her client kendi sorularını çeker
    await channelRef.current?.send({
      type: 'broadcast',
      event: 'game_start',
      payload: { sessionId: data.sessionId },
    });
  }

  function handleReady() {
    if (isReady) {
      // İptal et
      setIsReady(false);
      channelRef.current?.send({
        type: 'broadcast',
        event: 'restart_unready',
        payload: { playerId: playerId.current },
      });
    } else {
      // Hazır ol
      setIsReady(true);
      fetch(`/api/rooms/${roomId}/ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: playerId.current }),
      });
      channelRef.current?.send({
        type: 'broadcast',
        event: 'restart_ready',
        payload: { playerId: playerId.current },
      });
    }
  }

  async function handleStartNow() {
    await startGame();
  }

  function handleAnswerReady() {
    if (myAnswerReady) {
      setMyAnswerReady(false);
      channelRef.current?.send({
        type: 'broadcast',
        event: 'answer_unready',
        payload: { playerId: playerId.current },
      });
    } else {
      setMyAnswerReady(true);
      channelRef.current?.send({
        type: 'broadcast',
        event: 'answer_ready',
        payload: { playerId: playerId.current },
      });
    }
  }

  async function submitGuess(value: string) {
    if (submitLock.current || !sessionId || questions.length === 0) return;
    submitLock.current = true;

    const guess = value ? parseInt(value, 10) : null;
    const question = questions[round];

    try {
      const res = await fetch('/api/game/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: question.id,
          playerId: playerId.current,
          guessedValue: guess,
          timeRemaining: 0,
        }),
      });
      const data: ScoreResult = await res.json();
      setScoreResult(data);
      setRounds((prev) => [
        ...prev,
        { ...data, questionId: question.id, questionText: question.question_text, guessedValue: guess },
      ]);

      const newScore = rounds.reduce((s, r) => s + r.finalScore, 0) + data.finalScore;
      // Kendi skorunu güncelle
      setLeaderboard((prev) => {
        const next = prev.filter((e) => e.playerId !== playerId.current);
        return [...next, { playerId: playerId.current, displayName: myDisplayName, color: myColor, score: newScore, isConnected: true }]
          .sort((a, b) => b.score - a.score);
      });
      // Diğer oyunculara skor ve cevap broadcast et
      channelRef.current?.send({
        type: 'broadcast',
        event: 'player_score',
        payload: { playerId: playerId.current, displayName: myDisplayName, color: myColor, totalScore: newScore },
      });
      channelRef.current?.send({
        type: 'broadcast',
        event: 'player_answer',
        payload: { playerId: playerId.current, displayName: myDisplayName, guessedValue: guess, finalScore: data.finalScore },
      });
    } catch {
      // show reveal with 0
      setScoreResult({ logScore: 0, percentileScore: 0, wValue: 0, finalScore: 0, actualAnswer: 0, unit: '' });
    }

    setPhase('reveal');
  }

  function handleNext() {
    // Broadcast "sonraki"ya bastım" — hepsi basınca geçilir
    channelRef.current?.send({
      type: 'broadcast',
      event: 'player_next',
      payload: { playerId: playerId.current, round },
    });
  }

  const cumulativeScore = rounds.reduce((s, r) => s + r.finalScore, 0);

  if (showNickname) {
    return (
      <div className="h-full flex flex-col justify-center px-5 gap-5" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div>
          <h2 className="text-2xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Takma Ad</h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Diğer oyuncular seni böyle görecek</p>
        </div>

        <div className="flex gap-2">
          <input
            autoFocus
            type="text"
            value={nickInput}
            onChange={(e) => setNickInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (nickInput.trim()) localStorage.setItem('approxense_display_name', nickInput.trim());
                savePlayerColor(nickColor);
                setMyDisplayName(nickInput.trim() || getOrCreateDisplayName());
                setShowNickname(false);
              }
            }}
            placeholder="Takma adın (isteğe bağlı)"
            maxLength={20}
            className="flex-1 rounded-[12px] border px-4 text-base outline-none"
            style={{ height: '52px', backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          />
          <button
            onClick={() => {
              const idx = PLAYER_COLORS.indexOf(nickColor);
              setNickColor(PLAYER_COLORS[(idx + 1) % PLAYER_COLORS.length]);
            }}
            className="rounded-[12px] flex-shrink-0"
            style={{ width: '52px', height: '52px', backgroundColor: nickColor, boxShadow: `0 0 0 3px var(--color-bg), 0 0 0 5px ${nickColor}` }}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {PLAYER_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setNickColor(color)}
              className="rounded-full"
              style={{
                width: '32px', height: '32px', backgroundColor: color,
                outline: nickColor === color ? `3px solid ${color}` : 'none',
                outlineOffset: '2px',
                transform: nickColor === color ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        <div className="rounded-[12px] border px-4 py-3 flex items-center gap-2" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Önizleme:</span>
          <span className="text-sm font-bold" style={{ color: nickColor }}>{nickInput.trim() || 'Takma Adın'}</span>
        </div>

        <button
          onClick={() => {
            if (nickInput.trim()) localStorage.setItem('approxense_display_name', nickInput.trim());
            savePlayerColor(nickColor);
            setMyDisplayName(nickInput.trim() || getOrCreateDisplayName());
            setShowNickname(false);
          }}
          className="w-full rounded-[12px] text-base font-medium"
          style={{ height: '52px', backgroundColor: 'var(--color-accent)', color: 'white' }}
        >
          Odaya Gir
        </button>
      </div>
    );
  }

  if (phase === 'lobby') {
    return (
      <div style={{ height: '100%', overflowY: 'auto', position: 'relative', backgroundColor: 'var(--color-bg)' }}>
      <Lobby
        players={players}
        countdown={countdown}
        currentPlayerId={playerId.current}
        isReady={isReady}
        onReady={handleReady}
        onStartNow={handleStartNow}
        joinUrl={joinUrl}
      />
      </div>
    );
  }

  if (phase === 'countdown' && questions.length > 0) {
    return (
      <div style={{ height: '100%', overflow: 'hidden', position: 'relative', backgroundColor: 'var(--color-bg)' }}>
        {/* Arka planda blur'lu soru */}
        <div style={{ filter: 'blur(6px)', opacity: 0.4, pointerEvents: 'none' }}>
          <div className="flex items-center justify-end px-5 pt-5">
            <div className="text-3xl font-mono font-medium w-10 text-right" style={{ color: 'var(--color-text-primary)' }}>
              {20}
            </div>
          </div>
          <QuestionCard question={questions[0]} round={1} total={questions.length} inputValue="" />
        </div>
        {/* Geri sayım */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <p className="text-sm font-medium tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
            Hazır mısın?
          </p>
          <div
            className="font-mono font-semibold transition-all"
            style={{ fontSize: '7rem', lineHeight: 1, color: 'var(--color-text-primary)' }}
          >
            {startCountdown}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'playing' && questions.length > 0) {
    const question = questions[round];
    return (
      <div style={{ height: '100%', overflow: 'hidden', position: 'relative', backgroundColor: 'var(--color-bg)' }}>
        <div className="flex items-center justify-between px-5 pt-5">
          <button
            onClick={() => router.push('/')}
            className="text-sm px-2 py-1 rounded-lg"
            style={{ color: 'var(--color-text-muted)' }}
          >
            ← Menü
          </button>
          <Timer
            key={`${sessionId}-${round}`}
            duration={30}
            onExpire={() => submitGuess(inputValue)}
          />
        </div>
        <QuestionCard question={question} round={round + 1} total={questions.length} inputValue={inputValue} />
        <Keypad
          value={inputValue}
          onChange={setInputValue}
          onSubmitReady={handleAnswerReady}
          submitReady={myAnswerReady}
          submitReadyCount={answerReadyBy.length}
          totalPlayers={connectedPlayersRef.current.length}
        />
      </div>
    );
  }

  if (phase === 'reveal' && scoreResult && questions.length > 0) {
    return (
      <div style={{ height: '100%', overflow: 'hidden', position: 'relative', backgroundColor: 'var(--color-bg)' }}>
        <div className="px-5 pt-5">
          <button
            onClick={() => router.push('/')}
            className="text-sm px-2 py-1 rounded-lg"
            style={{ color: 'var(--color-text-muted)' }}
          >
            ← Menü
          </button>
        </div>
        <RevealScreen
          question={questions[round]}
          guessedValue={rounds[round]?.guessedValue ?? null}
          scoreResult={scoreResult}
          cumulativeScore={cumulativeScore}
          round={round + 1}
          total={questions.length}
          onNext={handleNext}
          currentPlayerId={playerId.current}
          leaderboard={leaderboard}
          roundAnswers={roundAnswers}
          isMultiplayer
        />
      </div>
    );
  }

  if (phase === 'finished') {
    const myRestartReady = readyPlayerIds.includes(playerId.current);
    return (
      <div style={{ height: '100%', overflowY: 'auto', backgroundColor: 'var(--color-bg)' }}>
      <div className="px-5 pt-6 pb-8 flex flex-col gap-4">
        <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Oyun Bitti
        </h2>
        <Leaderboard entries={leaderboard} currentPlayerId={playerId.current} />

        {/* Oyuncu hazır durumları */}
        {players.length > 0 && (
          <div
            className="rounded-[12px] border divide-y"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
          >
            {players.map(({ playerId: pid, displayName, color }) => {
              const name = displayName ?? (pid === playerId.current ? myDisplayName : 'Oyuncu');
              const ready = readyPlayerIds.includes(pid);
              const isMe = pid === playerId.current;
              const playerColor = isMe ? myColor : color;
              return (
                <div key={pid} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-sm flex-shrink-0" style={{ width: '10px', height: '10px', backgroundColor: playerColor }} />
                    <span className="text-sm font-bold" style={{ color: playerColor }}>
                      {name}{isMe && <span className="ml-1 text-xs font-normal" style={{ color: 'var(--color-text-muted)' }}>(Sen)</span>}
                    </span>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: ready ? 'rgba(16,185,129,0.12)' : 'var(--color-surface-alt)',
                      color: ready ? 'var(--color-success)' : 'var(--color-text-muted)',
                    }}
                  >
                    {ready ? '✓ Hazır' : 'Bekliyor'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Tekrar Oyna — broadcast ile senkronize */}
        <button
          className="w-full rounded-[12px] text-base font-medium"
          style={{
            minHeight: '52px',
            backgroundColor: myRestartReady ? 'var(--color-surface)' : 'var(--color-accent)',
            color: myRestartReady ? 'var(--color-text-secondary)' : 'white',
            border: myRestartReady ? '1px solid var(--color-border)' : 'none',
          }}
          onClick={() => {
            channelRef.current?.send({
              type: 'broadcast',
              event: myRestartReady ? 'restart_unready' : 'restart_ready',
              payload: { playerId: playerId.current },
            });
          }}
        >
          {myRestartReady ? '⏳ Bekleniyor… (İptal için bas)' : 'Tekrar Oyna — Hazır'}
        </button>

        {/* Lobiye Dön — link ile yeni oyuncu davet etmek için */}
        <button
          className="w-full rounded-[12px] text-base font-medium border"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', minHeight: '52px' }}
          onClick={async () => {
            await fetch(`/api/rooms/${roomId}/reset`, { method: 'POST' });
            setPhase('lobby');
            setRound(0);
            setRounds([]);
            setLeaderboard([]);
            setScoreResult(null);
            setInputValue('');
            setIsReady(false);
            setRestartReadyBy(new Set());
            submitLock.current = false;
          }}
        >
          Lobiye Dön
        </button>

        <button
          className="w-full rounded-[12px] text-base font-medium"
          style={{ color: 'var(--color-text-muted)', minHeight: '44px' }}
          onClick={() => router.push('/')}
        >
          Ana Sayfa
        </button>
      </div>
      </div>
    );
  }

  return null;
}
