export type Category = 'distance' | 'scale' | 'space' | 'time' | 'human';
export type GameMode = 'single' | 'multiplayer';
export type RoomStatus = 'waiting' | 'countdown' | 'playing' | 'finished';

export interface Question {
  id: string;
  category: Category;
  question_text: string;
  answer: number;
  unit: string;
  language: string;
  active: boolean;
  created_at?: string;
}

export interface QuestionPublic {
  id: string;
  category: Category;
  question_text: string;
  unit: string;
}

export interface QuestionStats {
  question_id: string;
  answer_count: number;
  answers: number[];
  updated_at: string;
}

export interface GameSession {
  id: string;
  mode: GameMode;
  room_id: string | null;
  question_ids: string[];
  created_at: string;
  completed_at: string | null;
}

export interface Answer {
  id: string;
  session_id: string;
  question_id: string;
  player_id: string;
  guessed_value: number | null;
  log_score: number | null;
  percentile_score: number | null;
  w_value: number | null;
  final_score: number | null;
  time_remaining: number | null;
  created_at: string;
}

export interface Room {
  id: string;
  status: RoomStatus;
  max_players: number;
  countdown_started_at: string | null;
  game_started_at: string | null;
  created_at: string;
}

export interface RoomPlayer {
  id: string;
  room_id: string;
  player_id: string;
  display_name: string | null;
  is_ready: boolean;
  is_connected: boolean;
  joined_at: string;
}

export interface ScoreResult {
  logScore: number;
  percentileScore: number;
  wValue: number;
  finalScore: number;
  actualAnswer: number;
  unit: string;
}

export interface RoundScore extends ScoreResult {
  questionId: string;
  questionText: string;
  guessedValue: number | null;
}

export interface AnalyticsEvent {
  eventType: string;
  sessionId?: string;
  roomId?: string;
  questionId?: string;
  category?: string;
  guessedValue?: number;
  actualValue?: number;
  logScore?: number;
  timeRemaining?: number;
  mode?: GameMode;
  playerCount?: number;
}
