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

// The garden is the whole interface: the lantern is the way you make
// light, the counters sit quietly in its corner, and the shop waits
// below.
const garden = document.createElement("div");
garden.id = "garden";

// Steady light spilling into the dark; it brightens as the garden
// gathers more glow per second.
const lanternGlow = document.createElement("div");
lanternGlow.id = "lantern-glow";

const strikeButton = document.createElement("button");
strikeButton.type = "button";
strikeButton.id = "strike-match";
strikeButton.className = "lantern-strike";
strikeButton.setAttribute("aria-label", "Strike a match");

const lantern = document.createElement("img");
lantern.src = lanternUrl;
lantern.alt = "";
lantern.draggable = false;
lantern.width = 120;
lantern.height = 120;

strikeButton.append(lantern);

const moths = document.createElement("div");
moths.id = "moths";

const stats = document.createElement("div");
stats.id = "stats";

const glowCounter = document.createElement("div");
glowCounter.id = "glow-counter";

const statDetail = document.createElement("div");
statDetail.id = "stat-detail";

stats.append(glowCounter, statDetail);

const gardenHint = document.createElement("p");
gardenHint.id = "garden-hint";
gardenHint.textContent = "Strike the lantern to make light.";

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

// Flavor feedback fades in over the garden and drifts away again.
let feedbackTimer: ReturnType<typeof setTimeout> | undefined;

function showFeedback(message: string): void {
  feedback.textContent = message;
  feedback.classList.add("show");
  clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => feedback.classList.remove("show"), 2600);
}

// The shop: three quiet rows, one per kind of light.
const shop = document.createElement("div");
shop.id = "shop";

const candleItem = document.createElement("div");
candleItem.className = "shop-item";

const candleInfo = document.createElement("div");
candleInfo.className = "shop-info";

const candleName = document.createElement("p");
candleName.className = "shop-name";
candleName.textContent = "Tallow candle";

const candleOwned = document.createElement("span");
candleOwned.id = "candles-owned";
candleOwned.className = "owned-badge";

const candleDesc = document.createElement("p");
candleDesc.className = "shop-desc";
candleDesc.textContent = "Cheap, honest light.";

candleName.append(candleOwned);
candleInfo.append(candleName, candleDesc);

const buyCandleButton = document.createElement("button");
buyCandleButton.type = "button";
buyCandleButton.id = "buy-candle";

candleItem.append(candleInfo, buyCandleButton);

const strikerItem = document.createElement("div");
strikerItem.className = "shop-item";

const strikerInfo = document.createElement("div");
strikerInfo.className = "shop-info";

const strikerName = document.createElement("p");
strikerName.className = "shop-name";
strikerName.textContent = "Rosewood striker";

const strikerOwned = document.createElement("span");
strikerOwned.id = "strikers-owned";
strikerOwned.className = "owned-badge";

const strikerDesc = document.createElement("p");
strikerDesc.className = "shop-desc";
strikerDesc.textContent = "Fits the hand and strikes true.";

strikerName.append(strikerOwned);
strikerInfo.append(strikerName, strikerDesc);

const buyStrikerButton = document.createElement("button");
buyStrikerButton.type = "button";
buyStrikerButton.id = "buy-striker";

strikerItem.append(strikerInfo, buyStrikerButton);

const lanternItem = document.createElement("div");
lanternItem.className = "shop-item";

const lanternInfo = document.createElement("div");
lanternInfo.className = "shop-info";

const lanternName = document.createElement("p");
lanternName.className = "shop-name";
lanternName.textContent = "Oil lantern";

const lanternOwned = document.createElement("span");
lanternOwned.id = "lanterns-owned";
lanternOwned.className = "owned-badge";

const lanternDesc = document.createElement("p");
lanternDesc.className = "shop-desc";
lanternDesc.textContent = "Steady through the wind; moths gather round.";

lanternName.append(lanternOwned);
lanternInfo.append(lanternName, lanternDesc);

const buyLanternButton = document.createElement("button");
buyLanternButton.type = "button";
buyLanternButton.id = "buy-lantern";

lanternItem.append(lanternInfo, buyLanternButton);

shop.append(candleItem, strikerItem, lanternItem);

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
  const strikePower = 1 + game.strikers;
  const parts = [
    `${glowPerSecond(game)} glow each second`,
    `${mothCount(game)} moths`,
  ];
  if (strikePower > 1) {
    parts.push(`${strikePower} glow per strike`);
  }
  statDetail.textContent = parts.join(" · ");
  candleOwned.textContent = `×${game.candles}`;
  strikerOwned.textContent = `×${game.strikers}`;
  lanternOwned.textContent = `×${game.lanterns}`;
  buyCandleButton.textContent = `Buy · ${candleCost(game)} glow`;
  buyCandleButton.disabled = game.glow < candleCost(game);
  buyStrikerButton.textContent = `Buy · ${strikerCost(game)} glow`;
  buyStrikerButton.disabled = game.glow < strikerCost(game);
  buyLanternButton.textContent = `Buy · ${lanternCost(game)} glow`;
  buyLanternButton.disabled = game.glow < lanternCost(game);
  // The garden itself brightens as steady light gathers.
  const bright = Math.min(glowPerSecond(game), 20);
  lanternGlow.style.opacity = `${Math.min(0.3 + bright * 0.05, 1)}`;
  lanternGlow.style.transform = `translate(-50%, -50%) scale(${
    1 + bright * 0.05
  })`;
  renderMoths();
}
render();

strikeButton.addEventListener("click", () => {
  strike(game);
  render();
  showFeedback(strikeMessages[strikesShown % strikeMessages.length]);
  strikesShown += 1;
  if (strikesShown === 1) {
    gardenHint.classList.add("hidden");
  }
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

garden.append(lanternGlow, strikeButton, moths, stats, gardenHint, feedback);
app.append(heading, garden, shop);
