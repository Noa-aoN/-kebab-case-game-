// -------------------------------------
// 定数・変数の初期設定
// -------------------------------------
const words = [
  // ケバブ素材
  "chicken meat", "cow meat", "sheep meat", "Turkey Meat", "Pita Bread",

  // スネーク系（snake_case）
  "anaconda_serpent",

  // アッパースネーク系（UPPER_SNAKE_CASE）
  "ANACONDA_SERPENT",

  // キャメル系（lowerCamelCase）
  "dromedaryCamel",

  // アッパーキャメル系（PascalCase）
  "BactrianCamel",

  // ハンガリアン記法
  "pListData", "iCount",

  // ドット記法
  "polka.dot", "pin.dot",
];

const wordElements = [];

const DEFAULT_SKEWER_WIDTH = 150;
const WORD_MIN_FONT_SIZE_REM = 1.5;
const WORD_RANDOM_FONT_SIZE_REM = 1;
const WORD_SIDE_MARGIN = 10;
const WORD_MIN_LEFT = 10;
const WORD_MIN_SPEED = 0.5;
const WORD_RANDOM_SPEED = 1.5;
const HIT_TOLERANCE = 5;
const SKEWER_FLY_SPEED = 40;
const SKEWER_RESET_DELAY_MS = 300;
const RESULT_TRANSITION_DELAY_MS = 100;
const WORD_SPAWN_PROBABILITY = 0.03;
const GAME_LOOP_INTERVAL_MS = 16;

const gameArea = document.getElementById("gameArea");
const skewer = document.getElementById("skewer");
const moveButton = document.getElementById("moveButton");

let skewerLeft = 0;
let flying = false;
let gameEnded = false;

function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getRandomRange(min, range) {
  return min + Math.random() * range;
}

function getResultUrl(wordText, hitPercent) {
  return `result.html?word=${encodeURIComponent(wordText)}&hitPercent=${hitPercent}`;
}

// -------------------------------------
// 串の初期位置設定（右端に配置）
// -------------------------------------
function setSkewerInitialPosition() {
  const skewerWidth = skewer.offsetWidth || DEFAULT_SKEWER_WIDTH;
  skewerLeft = window.innerWidth - skewerWidth;
  skewer.style.left = skewerLeft + "px";
  skewer.style.display = "block";
}

setSkewerInitialPosition();

// -------------------------------------
// 単語生成（ランダムサイズ・速度・位置）
// -------------------------------------
function createWord() {
  if (gameEnded) return;

  const word = document.createElement("div");
  word.classList.add("word");
  word.textContent = getRandomItem(words);

  // フォントサイズ（1.5〜2.5rem）
  const fontSize = getRandomRange(WORD_MIN_FONT_SIZE_REM, WORD_RANDOM_FONT_SIZE_REM);
  word.style.fontSize = fontSize + "rem";

  gameArea.appendChild(word);

  // ランダムな左右位置と落下速度
  const wordWidth = word.offsetWidth;
  const maxLeft = Math.max(WORD_MIN_LEFT, skewerLeft - wordWidth - WORD_SIDE_MARGIN);
  const randomLeft = getRandomRange(WORD_MIN_LEFT, maxLeft - WORD_MIN_LEFT);
  word.style.left = randomLeft + "px";
  word.style.top = "0px";
  word.dataset.speed = getRandomRange(WORD_MIN_SPEED, WORD_RANDOM_SPEED);

  wordElements.push(word);
}

// -------------------------------------
// 衝突判定
// -------------------------------------
function hitCheckSkewer(skewerRect, wordRect) {
  const skewerLeftX = skewerRect.left;
  const skewerRightX = skewerRect.right;
  const skewerCenterY = skewerRect.top + skewerRect.height / 2;

  const horizontalHit =
    skewerLeftX <= wordRect.right + HIT_TOLERANCE &&
    skewerRightX >= wordRect.right - HIT_TOLERANCE;

  const verticalHit =
    skewerCenterY >= wordRect.top &&
    skewerCenterY <= wordRect.bottom;

  return horizontalHit && verticalHit;
}

// -------------------------------------
// 単語の落下・衝突検出
// -------------------------------------
function updateWords() {
  if (gameEnded) return;

  wordElements.forEach((word, index) => {
    if (gameEnded) return;

    const speed = parseFloat(word.dataset.speed);
    word.style.top = parseFloat(word.style.top) + speed + "px";

    const wordRect = word.getBoundingClientRect();
    const skewerRect = skewer.getBoundingClientRect();

    // 衝突時の処理
    if (hitCheckSkewer(skewerRect, wordRect)) {
      gameEnded = true;
      moveButton.disabled = true;

      const wordText = word.textContent || "";
      const skewerCenterY = skewerRect.top + skewerRect.height / 2;
      const hitPercent = ((skewerCenterY - wordRect.top) / wordRect.height) * 100;
      const clampedHitPercent = Math.min(Math.max(hitPercent, 0), 100).toFixed(1);

      word.remove();
      wordElements.splice(index, 1);

      setTimeout(() => {
        window.location.href = getResultUrl(wordText, clampedHitPercent);
      }, RESULT_TRANSITION_DELAY_MS);
    }

    // 画面外に落下したら削除
    if (parseFloat(word.style.top) > window.innerHeight) {
      word.remove();
      wordElements.splice(index, 1);
    }
  });
}

// -------------------------------------
// 串の移動処理
// -------------------------------------
moveButton.addEventListener("click", () => {
  if (flying || gameEnded) return;
  flying = true;

  function fly() {
    skewerLeft -= SKEWER_FLY_SPEED;
    if (skewerLeft < 0) skewerLeft = 0;
    skewer.style.left = skewerLeft + "px";

    if (skewerLeft > 0) {
      requestAnimationFrame(fly);
    } else {
      skewer.style.display = "none";
      setTimeout(() => {
        setSkewerInitialPosition();
        flying = false;
      }, SKEWER_RESET_DELAY_MS);
    }
  }

  requestAnimationFrame(fly);
});

// -------------------------------------
// ウィンドウサイズ変更時に串を再配置
// -------------------------------------
window.addEventListener('resize', () => {
  if (!flying && !gameEnded) {
    setSkewerInitialPosition();
  }
});

// -------------------------------------
// ゲームループ
// -------------------------------------
setInterval(() => {
  if (gameEnded) return;

  if (Math.random() < WORD_SPAWN_PROBABILITY) createWord();
  updateWords();
}, GAME_LOOP_INTERVAL_MS);
