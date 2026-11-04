// Vite turns this import into a production-safe URL. Keep it as a file so
// even this tiny example demonstrates a separately deployed asset.
// @deno-types="./asset-url.d.ts"
import tileUrl from "./assets/tile.svg?no-inline";

import { createGame, strike, tickSecond } from "./state.ts";

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
  glowCounter.textContent = `Glow: ${game.glow}`;
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

// A repeating timer adds candle light each second while clicking still
// works.
setInterval(() => {
  tickSecond(game);
  renderGlow();
}, 1000);

app.append(
  heading,
  image,
  intro,
  glowCounter,
  rateLine,
  strikeButton,
  feedback,
);
