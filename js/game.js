const gameArea = document.getElementById("gameArea");
const skewer = document.getElementById("skewer");
const moveButton = document.getElementById("moveButton");
const gameState = KebabGameCore.createInitialState();
const gameSettings = KebabGameCore.SETTINGS;

function getSkewerRightOffset() {
  const value = getComputedStyle(document.body)
    .getPropertyValue("--skewer-right-offset");

  return Number.parseFloat(value) || 0;
}

function setSkewerInitialPosition() {
  const gameAreaWidth = gameArea.getBoundingClientRect().width;
  const skewerWidth = skewer.getBoundingClientRect().width || skewer.offsetWidth;
  const skewerRightOffset = getSkewerRightOffset();

  gameState.skewerLeft = Math.max(
    0,
    KebabGameCore.getInitialSkewerLeft(gameAreaWidth, skewerWidth) - skewerRightOffset,
  );
  skewer.style.left = "auto";
  skewer.style.right = `${skewerRightOffset}px`;
  skewer.style.display = "block";
}

function createWordElement() {
  const wordDraft = KebabGameCore.createWordDraft();
  const word = document.createElement("div");

  word.classList.add("word");
  word.textContent = wordDraft.text;
  word.style.fontSize = `${wordDraft.fontSizeRem}rem`;

  return word;
}

function placeWordElement(word) {
  const placement = KebabGameCore.createWordPlacement(
    gameState.skewerLeft,
    word.offsetWidth,
  );

  word.style.left = `${placement.left}px`;
  word.style.top = `${placement.top}px`;
  word.dataset.speed = placement.speed;
}

function createWord() {
  if (gameState.ended) return;

  const word = createWordElement();
  gameArea.appendChild(word);
  placeWordElement(word);
  gameState.wordElements.push(word);
}

function removeWord(index) {
  const word = gameState.wordElements[index];

  word.remove();
  gameState.wordElements.splice(index, 1);
}

function moveToResult(wordText, hitPercent) {
  setTimeout(() => {
    window.location.href = KebabGameCore.getResultUrl(wordText, hitPercent);
  }, gameSettings.resultTransitionDelayMs);
}

function moveWordDown(word) {
  const speed = parseFloat(word.dataset.speed);
  const nextTop = parseFloat(word.style.top) + speed;

  word.style.top = `${nextTop}px`;

  return nextTop;
}

function finishGame(word) {
  gameState.ended = true;
  moveButton.disabled = true;

  const wordText = word.textContent || "";
  const hitPercent = KebabGameCore.getHitPercent(
    skewer.getBoundingClientRect(),
    word.getBoundingClientRect(),
  );

  moveToResult(wordText, hitPercent);
}

function updateWords() {
  if (gameState.ended) return;

  for (let index = gameState.wordElements.length - 1; index >= 0; index -= 1) {
    const word = gameState.wordElements[index];
    const nextTop = moveWordDown(word);
    const wordRect = word.getBoundingClientRect();
    const skewerRect = skewer.getBoundingClientRect();

    if (KebabGameCore.hitCheckSkewer(skewerRect, wordRect)) {
      finishGame(word);
      removeWord(index);
      return;
    }

    if (KebabGameCore.isWordOutOfBounds(nextTop, window.innerHeight)) {
      removeWord(index);
    }
  }
}

function flySkewer() {
  gameState.skewerLeft = KebabGameCore.getNextSkewerLeft(gameState.skewerLeft);
  skewer.style.left = `${gameState.skewerLeft}px`;

  if (gameState.skewerLeft > 0) {
    requestAnimationFrame(flySkewer);
    return;
  }

  skewer.style.display = "none";
  setTimeout(() => {
    setSkewerInitialPosition();
    gameState.flying = false;
  }, gameSettings.skewerResetDelayMs);
}

function shootSkewer() {
  if (gameState.flying || gameState.ended) return;

  const gameAreaRect = gameArea.getBoundingClientRect();
  const skewerRect = skewer.getBoundingClientRect();

  gameState.skewerLeft = skewerRect.left - gameAreaRect.left;
  skewer.style.right = "auto";
  skewer.style.left = `${gameState.skewerLeft}px`;
  gameState.flying = true;
  requestAnimationFrame(flySkewer);
}

function handleResize() {
  if (!gameState.flying && !gameState.ended) {
    setSkewerInitialPosition();
  }
}

function updateGame() {
  if (gameState.ended) return;

  if (KebabGameCore.shouldSpawnWord()) createWord();
  updateWords();
}

function startGame() {
  setSkewerInitialPosition();
  setInterval(updateGame, gameSettings.gameLoopIntervalMs);
}

moveButton.addEventListener("click", shootSkewer);
window.addEventListener("resize", handleResize);

if (skewer.complete) {
  startGame();
} else {
  skewer.addEventListener("load", startGame, { once: true });
}
