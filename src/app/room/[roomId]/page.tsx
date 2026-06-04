'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getOrCreatePlayerId, getOrCreateDisplayName, getPlayerColor, getPlayerHue, hueToColor, savePlayerHue, getSavedDisplayName, pickGuestName } from '@/lib/utils';
import { getSettings, saveSettings } from '@/lib/questions';
import { GameSettings, DEFAULT_SETTINGS } from '@/types';
import SettingsPanel from '@/components/game/SettingsPanel';
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
    return !getSavedDisplayName();
  });
  // nickInput: kayıtlı isim yoksa komik isimle başlar, players yüklenince güncellenir
  const [nickInput, setNickInput] = useState(() => pickGuestName());
  const [nickHue, setNickHue] = useState(() =>
    typeof window !== 'undefined' ? getPlayerHue() : 240
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
  const [roomSettings, setRoomSettings] = useState<GameSettings>(() =>
    typeof window !== 'undefined' ? getSettings() : DEFAULT_SETTINGS
  );
  const [answerReadyBy, setAnswerReadyBy] = useState<string[]>([]);
  const [hostPlayerId, setHostPlayerId] = useState<string | null>(null);
  const [myAnswerReady, setMyAnswerReady] = useState(false);
  const [gameDuration, setGameDuration] = useState<number>(DEFAULT_SETTINGS.duration);
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_SETTINGS.duration);
  const inputValueRef = useRef('');
  const [roundAnswers, setRoundAnswers] = useState<{ playerId: string; displayName: string | null; color?: string; guessedValue: number | null; finalScore: number }[]>([]);
  const [playerReactions, setPlayerReactions] = useState<Record<string, { emoji: string; seq: number }>>({});
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

  // Sadece oyun sırasında (playing/reveal/countdown) scroll kilitli
  useEffect(() => {
    if (phase !== 'playing' && phase !== 'reveal' && phase !== 'countdown') return;
    const prevent = (e: TouchEvent) => e.preventDefault();
    document.addEventListener('touchmove', prevent, { passive: false });
    return () => document.removeEventListener('touchmove', prevent);
  }, [phase]);

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
      .on('broadcast', { event: 'settings_update' }, ({ payload }: { payload: { settings: GameSettings } }) => {
        setRoomSettings(payload.settings);
      })
      .on('broadcast', { event: 'game_start' }, async ({ payload }) => {
        setSessionId(payload.sessionId);
        if (payload.duration) setGameDuration(payload.duration);
        // Ready state'leri burada sıfırla — phase değişmeden önce değil
        setIsReady(false);
        setPlayers((prev) => prev.map((p) => ({ ...p, isReady: false })));
        setReadyPlayerIds([]);
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
            // (isReady / players ready state'leri game_start handler'da sıfırlanır, burada değil)
            setRound(0);
            setRounds([]);
            setLeaderboard([]);
            setScoreResult(null);
            setInputValue('');
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
      .on('broadcast', { event: 'player_answer' }, ({ payload }: { payload: { playerId: string; displayName: string | null; color?: string; guessedValue: number | null; finalScore: number } }) => {
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
            // setMyAnswerReady(false) burada YOK — phase 'reveal'e geçince zaten sıfırlanır
            submitGuessRef.current(inputValueRef.current);
          }
          return allReady ? [] : next;
        });
      })
      .on('broadcast', { event: 'answer_unready' }, ({ payload }: { payload: { playerId: string } }) => {
        setAnswerReadyBy((prev) => prev.filter((id) => id !== payload.playerId));
        if (payload.playerId === playerId.current) setMyAnswerReady(false);
      })
      .on('broadcast', { event: 'player_reaction' }, ({ payload }: { payload: { playerId: string; emoji: string } }) => {
        setPlayerReactions((prev) => ({
          ...prev,
          [payload.playerId]: { emoji: payload.emoji, seq: (prev[payload.playerId]?.seq ?? 0) + 1 },
        }));
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
                setPlayerReactions({});
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
        const state = channel.presenceState<{ playerId: string; displayName: string; color?: string; isCreator?: boolean }>();
        const entries = Object.values(state).flat();
        connectedPlayersRef.current = [...new Set(entries.map((e) => e.playerId))];
        // Host: önce isCreator olan, yoksa ilk bağlanan (presence sırasına göre ilk)
        const creatorEntry = entries.find((e) => e.isCreator);
        const hostId = creatorEntry ? creatorEntry.playerId : entries[0]?.playerId ?? null;
        setHostPlayerId(hostId);
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

        const connected = connectedPlayersRef.current;

        // Oyuncu düştüğünde answer_ready bekleyenler yeniden kontrol et
        setAnswerReadyBy((prev) => {
          if (connected.length < 1) return prev;
          const allReady = connected.every((id) => prev.includes(id));
          if (allReady && prev.length > 0) {
            setMyAnswerReady(false);
            submitGuessRef.current(inputValueRef.current);
            return [];
          }
          return prev;
        });

        // Oyuncu düştüğünde player_next bekleyenler yeniden kontrol et
        setNextPressedBy((prev) => {
          if (connected.length < 1) return prev;
          const allPressed = connected.every((id) => prev.has(id));
          if (allPressed && prev.size > 0) {
            const next = new Set<string>();
            setRound((r) => {
              const nextRound = r + 1;
              if (nextRound >= 10) {
                setPhase('finished');
              } else {
                setInputValue('');
                setScoreResult(null);
                setPhase('playing');
                setMyAnswerReady(false);
                setAnswerReadyBy([]);
                setRoundAnswers([]);
                setPlayerReactions({});
                submitLock.current = false;
              }
              return nextRound < 10 ? nextRound : r;
            });
            return next;
          }
          return prev;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // nickname overlay gösteriliyorsa track'i ertele — confirmNickname'de yapılacak
          const currentName = localStorage.getItem('approxense_display_name') || myName;
          const isCreator = sessionStorage.getItem('approxense_created_room') === roomId;
          await channel.track({ playerId: pid, displayName: currentName, color: getPlayerColor(), isCreator });
        }
      });

    return () => {
      channel.unsubscribe();
      fetch(`/api/rooms/${roomId}/players/${pid}`, { method: 'DELETE' });
    };
  }, [roomId]);

  // Overlay açıksa ve players yüklenince — odadaki isimleri kontrol et, uygun komik isim öner
  const nickInputTouchedRef = useRef(false);
  useEffect(() => {
    if (!showNickname || nickInputTouchedRef.current || players.length === 0) return;
    const takenNames = players.map((p) => p.displayName).filter(Boolean) as string[];
    setNickInput(pickGuestName(takenNames));
  }, [players, showNickname]);

  // inputValue ve submitGuess ref'lerini güncel tut (broadcast closure'ları için)
  useEffect(() => { inputValueRef.current = inputValue; }, [inputValue]);
  useEffect(() => { submitGuessRef.current = submitGuess; });

  // Pencere kapanınca hazır durumunu iptal et
  const isReadyRef = useRef(false);
  useEffect(() => { isReadyRef.current = isReady; }, [isReady]);
  useEffect(() => {
    function cancelReady() {
      if (!isReadyRef.current) return;
      channelRef.current?.send({
        type: 'broadcast',
        event: 'restart_unready',
        payload: { playerId: playerId.current },
      });
    }
    window.addEventListener('beforeunload', cancelReady);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') cancelReady();
    });
    return () => {
      window.removeEventListener('beforeunload', cancelReady);
    };
  }, []);

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
      body: JSON.stringify({ playerId: playerId.current, force: true, settings: roomSettings }),
    });
    if (!res.ok) return;
    const data = await res.json();
    const finalSettings: GameSettings = data.settings ?? roomSettings;
    await channelRef.current?.send({
      type: 'broadcast',
      event: 'game_start',
      payload: { sessionId: data.sessionId, duration: finalSettings.duration },
    });
  }

  function handleReady() {
    const isSolo = connectedPlayersRef.current.length <= 1;

    if (isSolo) {
      // Tek başına → tek oyunculu mod
      saveSettings(roomSettings);
      router.push('/game');
      return;
    }

    if (isReady) {
      setIsReady(false);
      channelRef.current?.send({
        type: 'broadcast',
        event: 'restart_unready',
        payload: { playerId: playerId.current },
      });
    } else {
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
        payload: { playerId: playerId.current, displayName: myDisplayName, color: myColor, guessedValue: guess, finalScore: data.finalScore },
      });
    } catch {
      // show reveal with 0
      setScoreResult({ logScore: 0, percentileScore: 0, wValue: 0, finalScore: 0, actualAnswer: 0, unit: '' });
    }

    setPhase('reveal');
  }

  function handleNext() {
    const isLastRound = round + 1 >= questions.length;
    if (isLastRound) {
      // Son turda herkesin beklemesine gerek yok — direkt sonuç ekranına geç
      setPhase('finished');
      return;
    }
    // Ara turlarda hepsi basınca geçilir
    channelRef.current?.send({
      type: 'broadcast',
      event: 'player_next',
      payload: { playerId: playerId.current, round },
    });
  }

  const cumulativeScore = rounds.reduce((s, r) => s + r.finalScore, 0);

  const NICK_COLORS = [
    { hue: 0,   hex: '#EF4444' }, { hue: 20,  hex: '#F97316' },
    { hue: 45,  hex: '#F59E0B' }, { hue: 84,  hex: '#84CC16' },
    { hue: 142, hex: '#22C55E' }, { hue: 172, hex: '#14B8A6' },
    { hue: 200, hex: '#0EA5E9' }, { hue: 231, hex: '#6366F1' },
    { hue: 262, hex: '#A855F7' }, { hue: 291, hex: '#D946EF' },
    { hue: 330, hex: '#F43F5E' }, { hue: 0,   hex: '#78716C' },
  ];
  const [nickSelectedColor, setNickSelectedColor] = useState(NICK_COLORS[7]);

  if (showNickname) {
    const displayPreview = nickInput.trim() || 'Oyuncu';
    const confirmNickname = () => {
      const isEmpty = !nickInput.trim();
      const newName = isEmpty ? pickGuestName() : nickInput.trim();
      if (isEmpty) {
        const randColor = [
          { hue: 0, hex: '#EF4444' }, { hue: 20, hex: '#F97316' }, { hue: 45, hex: '#F59E0B' },
          { hue: 84, hex: '#84CC16' }, { hue: 142, hex: '#22C55E' }, { hue: 172, hex: '#14B8A6' },
          { hue: 200, hex: '#0EA5E9' }, { hue: 231, hex: '#6366F1' }, { hue: 262, hex: '#A855F7' },
          { hue: 291, hex: '#D946EF' }, { hue: 330, hex: '#F43F5E' },
        ][Math.floor(Math.random() * 11)];
        setNickSelectedColor(randColor);
        setNickHue(randColor.hue);
      }
      localStorage.setItem('approxense_display_name', newName);
      savePlayerHue(nickSelectedColor.hue);
      setNickHue(nickSelectedColor.hue);
      setMyDisplayName(newName);
      setShowNickname(false);
      channelRef.current?.track({
        playerId: playerId.current,
        displayName: newName,
        color: nickSelectedColor.hex,
        isCreator: sessionStorage.getItem('approxense_created_room') === roomId,
      });
    };
    return (
      <div className="h-full flex flex-col overflow-hidden animate-fade-up" style={{ backgroundColor: 'var(--color-bg)' }}>
        {/* Avatar önizleme */}
        <div className="flex flex-col items-center pt-10 pb-6 px-5">
          <div
            className="rounded-full flex items-center justify-center font-bold text-white mb-4"
            style={{
              width: '72px', height: '72px',
              backgroundColor: nickSelectedColor.hex,
              fontSize: '1.75rem',
              boxShadow: `0 8px 24px ${nickSelectedColor.hex}50`,
              transition: 'background-color 0.25s, box-shadow 0.25s',
            }}
          >
            {displayPreview.slice(0, 1).toUpperCase()}
          </div>
          <p className="text-lg font-semibold" style={{ color: nickSelectedColor.hex, transition: 'color 0.25s', letterSpacing: '-0.02em' }}>
            {displayPreview}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Diğer oyuncular seni böyle görecek</p>
        </div>

        <div className="px-5 mb-5">
          <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.12em' }}>
            Takma Ad
          </label>
          <input
            autoFocus
            type="text"
            value={nickInput}
            onChange={(e) => { nickInputTouchedRef.current = true; setNickInput(e.target.value); }}
            onKeyDown={(e) => e.key === 'Enter' && confirmNickname()}
            placeholder="Takma adın"
            maxLength={20}
            className="w-full rounded-2xl border px-4 text-base font-semibold outline-none"
            style={{
              height: '52px',
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
              caretColor: nickSelectedColor.hex,
            }}
          />
        </div>

        <div className="px-5 mb-6">
          <label className="block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.12em' }}>
            Renk
          </label>
          <div className="grid grid-cols-6 gap-3">
            {NICK_COLORS.map((color) => {
              const isSelected = nickSelectedColor.hex === color.hex;
              return (
                <button
                  key={color.hex + color.hue}
                  onClick={() => setNickSelectedColor(color)}
                  className="rounded-full cursor-pointer flex items-center justify-center"
                  style={{
                    width: '100%', aspectRatio: '1',
                    backgroundColor: color.hex,
                    boxShadow: isSelected ? `0 0 0 3px var(--color-bg), 0 0 0 5px ${color.hex}` : 'none',
                    transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                    transition: 'transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s',
                  }}
                >
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 mt-auto pb-8">
          <button
            onClick={confirmNickname}
            className="w-full rounded-2xl text-base font-semibold text-white cursor-pointer active:scale-95"
            style={{
              height: '54px',
              backgroundColor: nickSelectedColor.hex,
              boxShadow: `0 4px 20px ${nickSelectedColor.hex}40`,
              transition: 'background-color 0.25s, box-shadow 0.25s, transform 0.1s',
              letterSpacing: '-0.01em',
            }}
          >
            Odaya Gir
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'lobby' || phase === 'countdown') {
    const isCountingDown = phase === 'countdown';
    return (
      <div style={{ height: '100%', position: 'relative', backgroundColor: 'var(--color-bg)' }}>
        {/* Lobby içeriği — countdown sırasında blurlanır */}
        <div
          style={{
            height: '100%',
            overflowY: isCountingDown ? 'hidden' : 'auto',
            overscrollBehavior: 'contain',
            filter: isCountingDown ? 'blur(5px)' : 'none',
            opacity: isCountingDown ? 0.35 : 1,
            pointerEvents: isCountingDown ? 'none' : 'auto',
            transition: 'filter 0.3s ease, opacity 0.3s ease',
          }}
        >
          <Lobby
            players={players}
            countdown={countdown}
            currentPlayerId={playerId.current}
            isReady={isReady}
            onReady={handleReady}
            onStartNow={handleStartNow}
            joinUrl={joinUrl}
            settings={roomSettings}
            onSettingsChange={(s) => {
              setRoomSettings(s);
              channelRef.current?.send({
                type: 'broadcast',
                event: 'settings_update',
                payload: { settings: s },
              });
            }}
            isHost={hostPlayerId === playerId.current || connectedPlayersRef.current.length === 0}
            isSolo={connectedPlayersRef.current.length <= 1}
            onEditNickname={() => setShowNickname(true)}
          />
        </div>

        {/* Geri sayım overlay — sadece countdown phase'inde */}
        {isCountingDown && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ pointerEvents: 'none' }}
          >
            <p
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: 'var(--color-text-secondary)', letterSpacing: '0.14em' }}
            >
              Hazır mısın?
            </p>
            <div
              className="font-mono font-bold animate-score-pop"
              key={startCountdown}
              style={{
                fontSize: '8rem',
                lineHeight: 1,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.04em',
              }}
            >
              {startCountdown}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'playing' && questions.length > 0) {
    const question = questions[round];
    return (
      <div style={{ height: '100%', overflow: 'hidden', position: 'relative', backgroundColor: 'var(--color-bg)' }}>
        <div className="hidden">
          <Timer
            key={`${sessionId}-${round}`}
            duration={gameDuration}
            onExpire={() => submitGuess(inputValue)}
            onTick={setTimeLeft}
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
          timeLeft={timeLeft}
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
          nextPressedBy={nextPressedBy}
          playerReactions={playerReactions}
          onReaction={(emoji) => {
            channelRef.current?.send({
              type: 'broadcast',
              event: 'player_reaction',
              payload: { playerId: playerId.current, emoji },
            });
          }}
          isMultiplayer
        />
      </div>
    );
  }

  if (phase === 'finished') {
    const myRestartReady = readyPlayerIds.includes(playerId.current);
    return (
      <div style={{ height: '100%', overflowY: 'auto', overscrollBehavior: 'contain', backgroundColor: 'var(--color-bg)' }}>
      <div className="px-5 pt-6 pb-8 flex flex-col gap-4">
        {(() => {
          const winner = [...leaderboard].sort((a, b) => b.score - a.score)[0];
          const winnerIsMe = winner?.playerId === playerId.current;
          return (
            <div className="mb-1 animate-fade-up">
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-secondary)', letterSpacing: '0.12em' }}>
                Oyun Bitti
              </p>
              <h2 className="text-2xl font-bold leading-tight" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                {winner
                  ? winnerIsMe
                    ? 'Sen kazandın!'
                    : `${winner.displayName ?? 'Oyuncu'} kazandı`
                  : 'Sonuçlar'}
              </h2>
            </div>
          );
        })()}
        <Leaderboard entries={leaderboard} currentPlayerId={playerId.current} readyPlayerIds={readyPlayerIds} />

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
