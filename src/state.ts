export interface GameState {
  glow: number; // the garden's spendable resource
  totalGlow: number; // lifetime total, kept for later pacing and stats
  candles: number; // lit tallow candles; each adds 1 glow per second
}

// A tallow candle costs this much glow.
export const CANDLE_COST = 15;

export function createGame(): GameState {
  // The first strike left a tallow candle burning in the dark.
  return { glow: 0, totalGlow: 0, candles: 1 };
}

function gainGlow(state: GameState, amount: number): void {
  state.glow += amount;
  state.totalGlow += amount;
}

// Striking a match makes a small amount of light right now.
export function strike(state: GameState): void {
  gainGlow(state, 1);
}

// Time passes: every burning candle adds its light for the elapsed seconds.
export function tick(state: GameState, elapsedSeconds: number): void {
  gainGlow(state, state.candles * elapsedSeconds);
}

// Buying a candle spends glow and adds a light that keeps burning. An
// unaffordable purchase is refused and changes nothing.
export function buyCandle(state: GameState): boolean {
  if (state.glow < CANDLE_COST) {
    return false;
  }
  state.glow -= CANDLE_COST;
  state.candles += 1;
  return true;
}
