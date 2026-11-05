export type GameStatus = 'WAITING' | 'RUNNING' | 'CRASHED';

export interface GameState {
    gameId: string;
    status: GameStatus;
    currentMultiplier: number;
    startTime: number;
    crashMultiplier?: number;
}

export type ServerMessage =
    | { type: 'STATE_SNAPSHOT'; payload: GameState }
    | { type: 'TICK'; payload: { gameId: string; multiplier: number } }
    | { type: 'CRASH'; payload: { gameId: string; finalMultiplier: number } };

export type GameEventListener = (state: GameState) => void;