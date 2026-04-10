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
const results = [];

const gameArea = document.getElementById("gameArea");
const skewer = document.getElementById("skewer");
const moveButton = document.getElementById("moveButton");

let skewerLeft = 0;
let flying = false;
let gameEnded = false;

// -------------------------------------
// 串の初期位置設定（右端に配置）
// -------------------------------------
function setSkewerInitialPosition() {
  const skewerWidth = skewer.offsetWidth || 150;
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
  word.textContent = words[Math.floor(Math.random() * words.length)];

  // フォントサイズ（1.5〜2.5rem）
  const fontSize = 1.5 + Math.random();
  word.style.fontSize = fontSize + "rem";

  gameArea.appendChild(word);

  // ランダムな左右位置と落下速度
  const wordWidth = word.offsetWidth;
  const margin = 10;
  const minLeft = 10;
  const maxLeft = Math.max(minLeft, skewerLeft - wordWidth - margin);
  const randomLeft = minLeft + Math.random() * (maxLeft - minLeft);
  word.style.left = randomLeft + "px";
  word.style.top = "0px";
  word.dataset.speed = 0.5 + Math.random() * 1.5;

  wordElements.push(word);
}

// -------------------------------------
// 衝突判定
// -------------------------------------
function hitCheckSkewer(skewerRect, wordRect) {
  const tolerance = 5;
  const skewerLeftX = skewerRect.left;
  const skewerRightX = skewerRect.right;
  const skewerCenterY = skewerRect.top + skewerRect.height / 2;

  const horizontalHit =
    skewerLeftX <= wordRect.right + tolerance &&
    skewerRightX >= wordRect.right - tolerance;

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

      results.push({ word: wordText, hitPercent: clampedHitPercent });
      console.log("衝突しました:", wordText, clampedHitPercent);

      word.remove();
      wordElements.splice(index, 1);

      setTimeout(() => {
        window.location.href = `result.html?word=${encodeURIComponent(wordText)}&hitPercent=${clampedHitPercent}`;
      }, 100);
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
  const speed = 40;

  function fly() {
    skewerLeft -= speed;
    if (skewerLeft < 0) skewerLeft = 0;
    skewer.style.left = skewerLeft + "px";

    if (skewerLeft > 0) {
      requestAnimationFrame(fly);
    } else {
      skewer.style.display = "none";
      setTimeout(() => {
        setSkewerInitialPosition();
        flying = false;
      }, 300);
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

  if (Math.random() < 0.03) createWord();
  updateWords();
}, 16);
