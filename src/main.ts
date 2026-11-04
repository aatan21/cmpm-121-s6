// Vite turns this import into a production-safe URL. Keep it as a file so
// even this tiny example demonstrates a separately deployed asset.
// @deno-types="./asset-url.d.ts"
import tileUrl from "./assets/tile.svg?no-inline";

import { buyCandle, CANDLE_COST, createGame, strike, tick } from "./state.ts";

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

const glowCounter = document.createElement("p");
glowCounter.id = "glow-counter";

const rateLine = document.createElement("p");
rateLine.id = "glow-rate";

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

// D1 step 5: the first consequential purchase. The button always shows the
// current price and only enables when the garden can afford it, so prices
// and affordability move together.
const buyCandleButton = document.createElement("button");
buyCandleButton.type = "button";
buyCandleButton.id = "buy-candle";

function render(): void {
  glowCounter.textContent = `Glow: ${Math.floor(game.glow)}`;
  const noun = game.candles === 1 ? "candle" : "candles";
  rateLine.textContent =
    `${game.candles} ${noun} burning, ${game.candles} glow each second.`;
  buyCandleButton.textContent = `Buy a tallow candle (${CANDLE_COST} glow)`;
  buyCandleButton.disabled = game.glow < CANDLE_COST;
}
render();

strikeButton.addEventListener("click", () => {
  strike(game);
  render();
  feedback.textContent = strikeMessages[strikesShown % strikeMessages.length];
  strikesShown += 1;
});

buyCandleButton.addEventListener("click", () => {
  if (buyCandle(game)) {
    render();
  }
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
    render();
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
  buyCandleButton,
);
