// Vite turns this import into a production-safe URL. Keep it as a file so
// even this tiny example demonstrates a separately deployed asset.
// @deno-types="./asset-url.d.ts"
import tileUrl from "./assets/tile.svg?no-inline";

const app = document.querySelector<HTMLElement>("#app")!;

const heading = document.createElement("h1");
heading.textContent = "Moth Lantern Garden";

const image = document.createElement("img");
image.src = tileUrl;
image.alt = "A teal tile with a cream circle";
image.width = 96;
image.height = 96;

const intro = document.createElement("p");
intro.textContent = "A dark garden waits. Make light, and see what arrives.";

// D1 step 1: a button created through TypeScript, with an identity and a
// click handler.
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
  feedback.textContent = strikeMessages[strikesShown % strikeMessages.length];
  strikesShown += 1;
});

app.append(heading, image, intro, strikeButton, feedback);
