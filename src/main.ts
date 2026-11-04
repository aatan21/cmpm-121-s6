// Vite turns this import into a production-safe URL. Keep it as a file so
// the garden's lantern deploys as its own named asset.
// @deno-types="./asset-url.d.ts"
import lanternUrl from "./assets/lantern.svg?no-inline";

import {
  buyCandle,
  buyLantern,
  buyStriker,
  candleCost,
  createGame,
  glowPerSecond,
  lanternCost,
  mothCount,
  strike,
  strikerCost,
  tick,
} from "./state.ts";

const app = document.querySelector<HTMLElement>("#app")!;

const game = createGame();

const heading = document.createElement("h1");
heading.textContent = "Moth Lantern Garden";

const intro = document.createElement("p");
intro.textContent = "A dark garden waits. Make light, and see what arrives.";

// The garden itself: the lantern is the way you make light, and steady
// light draws moths out of the dark. A real button wrapping the image
// keeps the action keyboard- and screen-reader-friendly.
const garden = document.createElement("div");
garden.id = "garden";

const strikeButton = document.createElement("button");
strikeButton.type = "button";
strikeButton.id = "strike-match";
strikeButton.className = "lantern-strike";
strikeButton.setAttribute("aria-label", "Strike a match");

const lantern = document.createElement("img");
lantern.src = lanternUrl;
lantern.alt = "";
lantern.width = 96;
lantern.height = 96;

strikeButton.append(lantern);

const moths = document.createElement("div");
moths.id = "moths";

garden.append(strikeButton, moths);

const gardenHint = document.createElement("p");
gardenHint.id = "garden-hint";
gardenHint.textContent = "Strike the lantern to make light.";

const mothLine = document.createElement("p");
mothLine.id = "moth-line";

const glowCounter = document.createElement("p");
glowCounter.id = "glow-counter";

const rateLine = document.createElement("p");
rateLine.id = "glow-rate";

const strikePowerLine = document.createElement("p");
strikePowerLine.id = "strike-power";

const feedback = document.createElement("p");
feedback.id = "strike-feedback";

const strikeMessages = [
  "The match flares, then steadies.",
  "A brief warmth against your fingers.",
  "The wick catches; a candle stands ready.",
  "Somewhere in the dark, wings stir.",
  "A moth settles on the lantern's rim.",
];
let strikesShown = 0;

// D1 step 6: the shop offers three distinct ways to feed the light. Each
// row shows its price, what it is like to live with, and how many of that
// kind the garden already holds.
const shopHeading = document.createElement("h2");
shopHeading.textContent = "Spend glow on more light";

const buyCandleButton = document.createElement("button");
buyCandleButton.type = "button";
buyCandleButton.id = "buy-candle";

const candleDescription = document.createElement("p");
candleDescription.className = "shop-description";
candleDescription.textContent =
  "Cheap, honest light. It burns wherever the dark is thickest.";

const candleOwnedLine = document.createElement("p");
candleOwnedLine.id = "candles-owned";

const buyStrikerButton = document.createElement("button");
buyStrikerButton.type = "button";
buyStrikerButton.id = "buy-striker";

const strikerDescription = document.createElement("p");
strikerDescription.className = "shop-description";
strikerDescription.textContent =
  "Fits the hand and strikes true, so every match burns brighter.";

const strikerOwnedLine = document.createElement("p");
strikerOwnedLine.id = "strikers-owned";

const buyLanternButton = document.createElement("button");
buyLanternButton.type = "button";
buyLanternButton.id = "buy-lantern";

const lanternDescription = document.createElement("p");
lanternDescription.className = "shop-description";
lanternDescription.textContent =
  "Steady through the wind. Moths come from far around to circle it.";

const lanternOwnedLine = document.createElement("p");
lanternOwnedLine.id = "lanterns-owned";

// Moths are derived from steady light, never stored. The drifting glyphs
// only need rebuilding when the count itself changes.
const MAX_VISIBLE_MOTHS = 24;
let shownMoths = -1;

function renderMoths(): void {
  const wanted = Math.min(mothCount(game), MAX_VISIBLE_MOTHS);
  if (wanted === shownMoths) {
    return;
  }
  shownMoths = wanted;
  moths.replaceChildren();
  for (let i = 0; i < wanted; i++) {
    const moth = document.createElement("span");
    moth.className = "moth";
    moth.style.left = `${5 + Math.random() * 90}%`;
    moth.style.top = `${15 + Math.random() * 70}%`;
    moth.style.animationDuration = `${3 + Math.random() * 4}s`;
    moth.style.animationDelay = `${-Math.random() * 4}s`;
    moths.append(moth);
  }
}

function render(): void {
  glowCounter.textContent = `Glow: ${Math.floor(game.glow)}`;
  rateLine.textContent = `The garden gains ${
    glowPerSecond(game)
  } glow each second.`;
  const mothTotal = mothCount(game);
  mothLine.textContent = mothTotal === 1
    ? "1 moth drifts through the garden, drawn to the light."
    : `${mothTotal} moths drift through the garden, drawn to the light.`;
  strikePowerLine.hidden = game.strikers === 0;
  strikePowerLine.textContent = `Each strike now makes ${
    1 + game.strikers
  } glow.`;
  buyCandleButton.textContent = `Buy a tallow candle (${
    candleCost(game)
  } glow)`;
  buyCandleButton.disabled = game.glow < candleCost(game);
  candleOwnedLine.textContent = `Tallow candles owned: ${game.candles}`;
  buyStrikerButton.textContent = `Buy a rosewood striker (${
    strikerCost(game)
  } glow)`;
  buyStrikerButton.disabled = game.glow < strikerCost(game);
  strikerOwnedLine.textContent = `Rosewood strikers owned: ${game.strikers}`;
  buyLanternButton.textContent = `Buy an oil lantern (${
    lanternCost(game)
  } glow)`;
  buyLanternButton.disabled = game.glow < lanternCost(game);
  lanternOwnedLine.textContent = `Oil lanterns owned: ${game.lanterns}`;
  renderMoths();
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
  intro,
  garden,
  gardenHint,
  mothLine,
  glowCounter,
  rateLine,
  strikePowerLine,
  feedback,
  shopHeading,
  buyCandleButton,
  candleDescription,
  candleOwnedLine,
  buyStrikerButton,
  strikerDescription,
  strikerOwnedLine,
  buyLanternButton,
  lanternDescription,
  lanternOwnedLine,
);
