// === 要素取得 ===
const resultContainer = document.getElementById('resultContainer');
const resultImg = document.getElementById("resultImg");
const wordText = document.getElementById("wordText");
const hitPercentText = document.getElementById("hitPercentText");
const scoreText = document.getElementById("scoreText");

// === URLパラメータ取得 ===
const params = new URLSearchParams(window.location.search);
const word = params.get("word") || "不明";
const hitPercent = parseFloat(params.get("hitPercent")) || 0;

// === ケース判定用パターン ===
const patterns = [
  { regex: /^[a-z][A-Z][a-z0-9]+([A-Z][a-z0-9]*)*$/, img: "image/hungarian.png", label: "ハンガリアン記法" },
  { regex: /^[a-z]+([A-Z][a-z0-9]*)+$/, img: "image/camel.png", label: "キャメルケース" },
  { regex: /^[A-Z][a-z0-9]+([A-Z][a-z0-9]*)+$/, img: "image/upper_camel.png", label: "アッパーキャメルケース" },
  { regex: /^[a-z0-9]+(_[a-z0-9]+)+$/, img: "image/snake.png", label: "スネークケース" },
  { regex: /^[A-Z0-9]+(_[A-Z0-9]+)+$/, img: "image/upper_snake.png", label: "アッパースネークケース" },
  { regex: /^[a-z0-9]+( [a-z0-9]+)+$/, img: "image/ok_kebab.png", label: "ケバブケース", isKebabTarget: true },
  { regex: /^[A-Z][a-z0-9]+( [A-Z][a-z0-9]+)+$/, img: "image/ok_kebab.png", label: "アッパーケバブケース", isKebabTarget: true },
  { regex: /^[a-z0-9]+(\.[a-z0-9]+)+$/, img: "image/dot.png", label: "ドット記法" },
];

// === マッチングと結果画像設定 ===
const matched = patterns.find(p => p.regex.test(word)) || { img: "image/miss_kebab.png", label: "不明" };
const isKebabTarget = Boolean(matched.isKebabTarget);
resultImg.src = matched.img;
resultImg.alt = matched.label;

// === 単語表示（ケバブ用に置換） ===
wordText.textContent = word.replace(" ", "-");

// === スコア算出関数 ===
const calcScore = hitPercent => {
  const diff = Math.abs(hitPercent - 50);
  return Math.max(0, Math.round(100 - diff * 2));
};

// === ランク判定関数 ===
const getRank = (score, matched, isKebabTarget) => {
  if (isKebabTarget) {
    if (score >= 100) return { label: "Perfect!", color: "text-orange-300" };
    if (score >= 90) return { label: "Great!", color: "text-yellow-300" };
    if (score >= 75) return { label: "Good!", color: "text-green-300" };
    if (score >= 50) return { label: "OK!", color: "text-blue-300" };
    return { label: "Miss...", color: "text-red-400" };
  } else {
    return { label: matched.label + "を刺した！", color: "text-red-400" };
  }
};

// === ケバブ用結果画像判定関数 ===
const getKebabResultImage = score => {
  if (score >= 100) return "image/perfect_kebab.png";
  if (score >= 90) return "image/great_kebab.png";
  if (score >= 75) return "image/good_kebab.png";
  if (score >= 50) return "image/ok_kebab.png";
  return "image/miss_kebab.png";
};

// === スコア表示文言生成関数 ===
const getScoreText = (score, rank, isKebabTarget, hitPercent) => {
  if (!isKebabTarget) return rank.label;

  return hitPercent >= 85
    ? `下から ${Math.round(100 - hitPercent)}% 地点に刺さった！`
    : `${rank.label}　${score}点`;
};

// === Xシェア文言生成関数 ===
const getShareText = ({ word, score, rank, matched, isKebabTarget, hitPercent }) => {
  const borderLine = "-------------------------------\n";
  const wordDisplay = isKebabTarget
    ? word.replace("-", " ").replace("_", " ")
    : word.replace("-", " ");
  const resultCase = (isKebabTarget && hitPercent >= 85)
    ? "新スネークケース"
    : matched.label;
  const rankText = isKebabTarget
    ? rank.label
    : "判定不能！";
  const resultSkewer = isKebabTarget
    ? ""
    : "串";

  return `🥙 #ケバブケースゲーム 🥙\n${borderLine}🍖素材：「${wordDisplay}」を串刺し！\n🥙仕上がり：${resultCase}${resultSkewer}\n💯スコア：${score}点\n🎯評価：${rankText}\n${borderLine}`;
};

const makeXUrl = (text, url) => {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
};

// === スコア・ランク判定 ===
const score = calcScore(hitPercent);
const rank = getRank(score, matched, isKebabTarget);

// === ケバブ専用画像分岐 ===
if (isKebabTarget) {
  if (hitPercent >= 85) {
    resultImg.src = "image/kebab_snake.png";
    wordText.textContent = word.replace(" ", "_");
  } else {
    resultImg.src = getKebabResultImage(score);
  }
}

// === スコアテキスト設定 ===
scoreText.textContent = getScoreText(score, rank, isKebabTarget, hitPercent);
scoreText.className = `font-bold ${rank.color} mt-2 text-center text-xl animate-pulse`;

// === 高スコア時の光エフェクト ===
if (score >= 90) {
  resultImg.style.filter = "drop-shadow(0 0 20px rgba(255, 215, 0, 1))";
}

// === リサイズ処理 ===
const resizeContainer = () => {
  const padding = 32;
  const maxWidth = window.innerWidth * 0.8 - padding;
  const maxHeight = (window.innerHeight - 100) * 0.9 - padding;
  const size = Math.min(maxWidth, maxHeight);

  resultContainer.style.width = `${size}px`;
  resultContainer.style.height = `${size}px`;

  wordText.style.fontSize = `${Math.max(16, size * 0.06)}px`;
  scoreText.style.fontSize = `${Math.max(18, size * 0.045)}px`;
  hitPercentText.style.fontSize = `${Math.max(12, size * 0.03)}px`;
};
window.addEventListener('resize', resizeContainer);
window.addEventListener('load', resizeContainer);

// === X（旧Twitter）シェア機能 ===
document.getElementById("shareButton").addEventListener("click", () => {
  const text = getShareText({ word, score, rank, matched, isKebabTarget, hitPercent });
  const pageUrl = window.location.origin + "/-kebab-case-game-/";
  const tweetUrl = makeXUrl(text, pageUrl);
  window.open(tweetUrl, "_blank");
});
