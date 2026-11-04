export interface GameState {
  glow: number; // the garden's spendable resource
  totalGlow: number; // lifetime total, kept for later pacing and stats
  candles: number; // lit tallow candles; each adds 1 glow per second
  lanterns: number; // oil lanterns; each adds 6 glow per second
  strikers: number; // rosewood strikers; each adds 1 glow per strike
}

export const CANDLE_COST = 15;
export const LANTERN_COST = 120;
export const STRIKER_COST = 50;

export function createGame(): GameState {
  // The first strike left a tallow candle burning in the dark.
  return { glow: 0, totalGlow: 0, candles: 1, lanterns: 0, strikers: 0 };
}

function gainGlow(state: GameState, amount: number): void {
  state.glow += amount;
  state.totalGlow += amount;
}

// Striking a match makes light right now; each striker makes it brighter.
export function strike(state: GameState): void {
  gainGlow(state, 1 + state.strikers);
}

// The glow the garden gathers on its own, per second.
export function glowPerSecond(state: GameState): number {
  return state.candles + state.lanterns * 6;
}

// Time passes: every burning light adds its glow for the elapsed seconds.
export function tick(state: GameState, elapsedSeconds: number): void {
  gainGlow(state, glowPerSecond(state) * elapsedSeconds);
}

// Prices rise as the garden fills with light: each further purchase of a
// kind costs 15% more per item you already own, rounded up.
export function candleCost(state: GameState): number {
  return Math.ceil(CANDLE_COST * Math.pow(1.15, state.candles));
}

export function lanternCost(state: GameState): number {
  return Math.ceil(LANTERN_COST * Math.pow(1.15, state.lanterns));
}

export function strikerCost(state: GameState): number {
  return Math.ceil(STRIKER_COST * Math.pow(1.15, state.strikers));
}

// Buying something spends glow and makes the garden brighter in its own
// way. An unaffordable purchase is refused and changes nothing.
export function buyCandle(state: GameState): boolean {
  const cost = candleCost(state);
  if (state.glow < cost) {
    return false;
  }
  state.glow -= cost;
  state.candles += 1;
  return true;
}

export function buyStriker(state: GameState): boolean {
  const cost = strikerCost(state);
  if (state.glow < cost) {
    return false;
  }
  state.glow -= cost;
  state.strikers += 1;
  return true;
}

export function buyLantern(state: GameState): boolean {
  const cost = lanternCost(state);
  if (state.glow < cost) {
    return false;
  }
  state.glow -= cost;
  state.lanterns += 1;
  return true;
}
