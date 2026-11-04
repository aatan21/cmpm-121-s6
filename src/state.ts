export interface GameState {
  glow: number; // the garden's spendable resource
  totalGlow: number; // lifetime total, kept for later pacing and stats
  candles: number; // lit tallow candles; each adds 1 glow per second
}

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

// One second passes; every burning candle adds its light.
export function tickSecond(state: GameState): void {
  gainGlow(state, state.candles);
}
