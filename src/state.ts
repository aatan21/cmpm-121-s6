export interface GameState {
  glow: number; // the garden's spendable resource
  totalGlow: number; // lifetime total, kept for later pacing and stats
}

export function createGame(): GameState {
  return { glow: 0, totalGlow: 0 };
}

// Striking a match makes a small amount of light right now.
export function strike(state: GameState): void {
  state.glow += 1;
  state.totalGlow += 1;
}
