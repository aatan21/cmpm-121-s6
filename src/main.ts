// Vite turns this import into a production-safe URL. Keep it as a file so
// even this tiny example demonstrates a separately deployed asset.
// @deno-types="./asset-url.d.ts"
import tileUrl from "./assets/tile.svg?no-inline";

import {
  buyCandle,
  buyLantern,
  buyStriker,
  CANDLE_COST,
  createGame,
  glowPerSecond,
  LANTERN_COST,
  strike,
  STRIKER_COST,
  tick,
} from "./state.ts";

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

const strikePowerLine = document.createElement("p");
strikePowerLine.id = "strike-power";

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

// D1 step 6: the shop offers three distinct ways to feed the light. Each
// row shows its price and how many of that kind the garden already holds.
const shopHeading = document.createElement("h2");
shopHeading.textContent = "Spend glow on more light";

const buyCandleButton = document.createElement("button");
buyCandleButton.type = "button";
buyCandleButton.id = "buy-candle";

const candleOwnedLine = document.createElement("p");
candleOwnedLine.id = "candles-owned";

const buyStrikerButton = document.createElement("button");
buyStrikerButton.type = "button";
buyStrikerButton.id = "buy-striker";

const strikerOwnedLine = document.createElement("p");
strikerOwnedLine.id = "strikers-owned";

const buyLanternButton = document.createElement("button");
buyLanternButton.type = "button";
buyLanternButton.id = "buy-lantern";

const lanternOwnedLine = document.createElement("p");
lanternOwnedLine.id = "lanterns-owned";

function render(): void {
  glowCounter.textContent = `Glow: ${Math.floor(game.glow)}`;
  rateLine.textContent = `The garden gains ${
    glowPerSecond(game)
  } glow each second.`;
  strikePowerLine.hidden = game.strikers === 0;
  strikePowerLine.textContent = `Each strike now makes ${
    1 + game.strikers
  } glow.`;
  buyCandleButton.textContent = `Buy a tallow candle (${CANDLE_COST} glow)`;
  buyCandleButton.disabled = game.glow < CANDLE_COST;
  candleOwnedLine.textContent = `Tallow candles owned: ${game.candles}`;
  buyStrikerButton.textContent =
    `Buy a rosewood striker (${STRIKER_COST} glow)`;
  buyStrikerButton.disabled = game.glow < STRIKER_COST;
  strikerOwnedLine.textContent = `Rosewood strikers owned: ${game.strikers}`;
  buyLanternButton.textContent = `Buy an oil lantern (${LANTERN_COST} glow)`;
  buyLanternButton.disabled = game.glow < LANTERN_COST;
  lanternOwnedLine.textContent = `Oil lanterns owned: ${game.lanterns}`;
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

buyStrikerButton.addEventListener("click", () => {
  if (buyStriker(game)) {
    render();
  }
});

buyLanternButton.addEventListener("click", () => {
  if (buyLantern(game)) {
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
  strikePowerLine,
  strikeButton,
  feedback,
  shopHeading,
  buyCandleButton,
  candleOwnedLine,
  buyStrikerButton,
  strikerOwnedLine,
  buyLanternButton,
  lanternOwnedLine,
);
