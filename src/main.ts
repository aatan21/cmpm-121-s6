// Vite turns this import into a production-safe URL. Keep it as a file so
// even this tiny example demonstrates a separately deployed asset.
// @deno-types="./asset-url.d.ts"
import tileUrl from "./assets/tile.svg?no-inline";

import { createGame, strike, tick } from "./state.ts";

const app = document.querySelector<HTMLElement>("#app")!;

const game = createGame();

const heading = document.createElement("h1");
heading.textContent = "Moth Lantern Garden";

const image = document.createElement("img");
image.src = tileUrl;
image.alt = "A teal tile with a cream circle";
image.width = 96;
image.height = 96;

const intro = document.createElement("p");
intro.textContent = "A dark garden waits. Make light, and see what arrives.";

// D1 step 2: glow is stored state, and the display always reads from that
// state, never from a parallel count.
const glowCounter = document.createElement("p");
glowCounter.id = "glow-counter";

function renderGlow(): void {
  // Glow accumulates fractionally between whole numbers; the display shows
  // whole glow.
  glowCounter.textContent = `Glow: ${Math.floor(game.glow)}`;
}
renderGlow();

// D1 step 3: candles burn on their own. The rate line names the source so
// the growth stays explainable.
const rateLine = document.createElement("p");
rateLine.id = "glow-rate";

function renderRate(): void {
  const noun = game.candles === 1 ? "candle" : "candles";
  rateLine.textContent =
    `${game.candles} ${noun} burning, ${game.candles} glow each second.`;
}
renderRate();

const strikeButton = document.createElement("button");
strikeButton.type = "button";
strikeButton.id = "strike-match";
strikeButton.textContent = "Strike a match";

const feedback = document.createElement("p");
feedback.id = "strike-feedback";

const strikeMessages = [
  "The match flares, then steadies.",
  "A brief warmth against your fingers.",
  "The wick catches; a candle stands ready.",
  "Somewhere in the dark, wings stir.",
];
let strikesShown = 0;

strikeButton.addEventListener("click", () => {
  strike(game);
  renderGlow();
  feedback.textContent = strikeMessages[strikesShown % strikeMessages.length];
  strikesShown += 1;
});

// D1 step 4: one animation loop drives all time. Each frame converts the
// elapsed milliseconds into seconds, so growth depends on real elapsed
// time rather than the number of frames, and because this loop is the only
// thing that changes glow over time, nothing is counted twice. Hidden tabs
// pause animation frames, so a gap longer than a second counts as one
// second instead of dumping stored-up growth.
let lastFrame: number | null = null;

function frame(now: number): void {
  if (lastFrame !== null) {
    const elapsedSeconds = Math.min((now - lastFrame) / 1000, 1);
    tick(game, elapsedSeconds);
    renderGlow();
  }
  lastFrame = now;
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

app.append(
  heading,
  image,
  intro,
  glowCounter,
  rateLine,
  strikeButton,
  feedback,
);
