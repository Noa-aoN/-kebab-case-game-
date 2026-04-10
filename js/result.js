const resultContainer = document.getElementById("resultContainer");
const resultImg = document.getElementById("resultImg");
const wordText = document.getElementById("wordText");
const hitPercentText = document.getElementById("hitPercentText");
const scoreText = document.getElementById("scoreText");
const shareButton = document.getElementById("shareButton");
const MAX_WORD_LENGTH = 80;

const params = new URLSearchParams(window.location.search);
const word = sanitizeWord(params.get("word"));
const hitPercent = sanitizeHitPercent(params.get("hitPercent"));
const result = KebabResultCore.buildResult(word, hitPercent);

function sanitizeWord(value) {
  if (!value) return "不明";

  return value.trim().slice(0, MAX_WORD_LENGTH) || "不明";
}

function sanitizeHitPercent(value) {
  const parsedValue = Number.parseFloat(value);

  if (!Number.isFinite(parsedValue)) return 0;

  return Math.min(Math.max(parsedValue, 0), 100);
}

function renderResult(result) {
  resultImg.src = result.image;
  resultImg.alt = result.matchedCase.label;
  wordText.textContent = result.wordText;
  scoreText.textContent = result.scoreText;
  scoreText.className = `font-bold ${result.rank.color} mt-2 text-center text-xl animate-pulse`;

  if (result.score >= 90) {
    resultImg.style.filter = "drop-shadow(0 0 20px rgba(255, 215, 0, 1))";
  }
}

function resizeContainer() {
  const padding = 32;
  const maxWidth = window.innerWidth * 0.8 - padding;
  const maxHeight = (window.innerHeight - 100) * 0.9 - padding;
  const size = Math.min(maxWidth, maxHeight);

  resultContainer.style.width = `${size}px`;
  resultContainer.style.height = `${size}px`;

  wordText.style.fontSize = `${Math.max(16, size * 0.06)}px`;
  scoreText.style.fontSize = `${Math.max(18, size * 0.045)}px`;
  hitPercentText.style.fontSize = `${Math.max(12, size * 0.03)}px`;
}

function shareResult() {
  const text = KebabResultCore.getShareText({
    word: result.word,
    score: result.score,
    rank: result.rank,
    matchedCase: result.matchedCase,
    hitPercent: result.hitPercent,
  });
  const pageUrl = window.location.origin + "/-kebab-case-game-/";
  const tweetUrl = KebabResultCore.makeXUrl(text, pageUrl);

  window.open(tweetUrl, "_blank", "noopener,noreferrer");
}

renderResult(result);

window.addEventListener("resize", resizeContainer);
window.addEventListener("load", resizeContainer);
shareButton.addEventListener("click", shareResult);
