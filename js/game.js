const gameArea = document.getElementById("gameArea");
const skewer = document.getElementById("skewer");
const moveButton = document.getElementById("moveButton");
const gameState = KebabGameCore.createInitialState();
const gameSettings = KebabGameCore.SETTINGS;
let lastFrameTime = 0;
let accumulatedTime = 0;
const gameLayout = {
  areaLeft: 0,
  areaTop: 0,
  areaWidth: 0,
  areaHeight: 0,
  skewerWidth: 0,
  skewerHeight: 0,
};

function getSkewerRightOffset() {
  const value = getComputedStyle(document.body)
    .getPropertyValue("--skewer-right-offset");

  return Number.parseFloat(value) || 0;
}

function refreshGameLayout() {
  const gameAreaRect = gameArea.getBoundingClientRect();

  gameLayout.areaLeft = gameAreaRect.left;
  gameLayout.areaTop = gameAreaRect.top;
  gameLayout.areaWidth = gameAreaRect.width;
  gameLayout.areaHeight = gameAreaRect.height;
  gameLayout.skewerWidth = skewer.offsetWidth;
  gameLayout.skewerHeight = skewer.offsetHeight;
}

function setSkewerInitialPosition() {
  refreshGameLayout();
  const skewerRightOffset = getSkewerRightOffset();

  gameState.skewerLeft = Math.max(
    0,
    KebabGameCore.getInitialSkewerLeft(gameLayout.areaWidth, gameLayout.skewerWidth) - skewerRightOffset,
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

function measureWord(word) {
  return {
    width: word.offsetWidth,
    height: word.offsetHeight,
  };
}

function updateWordMeasurement(wordState) {
  const measurement = measureWord(wordState.element);

  wordState.width = measurement.width;
  wordState.height = measurement.height;
}

function createWordState(element) {
  const wordState = {
    element,
    width: 0,
    height: 0,
    left: 0,
    top: 0,
    speed: 0,
  };

  updateWordMeasurement(wordState);

  return wordState;
}

function placeWordElement(wordState) {
  const placement = KebabGameCore.createWordPlacement(
    gameState.skewerLeft,
    wordState.width,
  );

  wordState.left = placement.left;
  wordState.top = placement.top;
  wordState.speed = placement.speed;
  wordState.element.style.left = `${placement.left}px`;
  wordState.element.style.top = `${placement.top}px`;
}

function createWord() {
  if (gameState.ended) return;

  const word = createWordElement();

  gameArea.appendChild(word);
  const wordState = createWordState(word);

  placeWordElement(wordState);
  gameState.wordStates.push(wordState);
}

function removeWord(index) {
  const word = gameState.wordStates[index];

  word.element.remove();
  gameState.wordStates.splice(index, 1);
}

function moveToResult(wordText, hitPercent) {
  setTimeout(() => {
    window.location.href = KebabGameCore.getResultUrl(wordText, hitPercent);
  }, gameSettings.resultTransitionDelayMs);
}

function moveWordDown(wordState) {
  const nextTop = wordState.top + wordState.speed;

  wordState.top = nextTop;
  wordState.element.style.top = `${nextTop}px`;

  return nextTop;
}

function getWordRect(wordState, gameAreaRect) {
  return {
    left: gameAreaRect.left + wordState.left,
    right: gameAreaRect.left + wordState.left + wordState.width,
    top: gameAreaRect.top + wordState.top,
    bottom: gameAreaRect.top + wordState.top + wordState.height,
    height: wordState.height,
  };
}

function finishGame(wordState, skewerRect, wordRect) {
  gameState.ended = true;
  moveButton.disabled = true;

  const wordText = wordState.element.textContent || "";
  const hitPercent = KebabGameCore.getHitPercent(skewerRect, wordRect);

  moveToResult(wordText, hitPercent);
}

function updateWords() {
  if (gameState.ended) return;

  const gameAreaRect = gameArea.getBoundingClientRect();
  const gameAreaHeight = gameLayout.areaHeight;
  const skewerRect = skewer.getBoundingClientRect();

  for (let index = gameState.wordStates.length - 1; index >= 0; index -= 1) {
    const wordState = gameState.wordStates[index];
    const nextTop = moveWordDown(wordState);
    const wordRect = wordState.element.getBoundingClientRect();

    if (KebabGameCore.hitCheckSkewer(skewerRect, wordRect)) {
      finishGame(wordState, skewerRect, wordRect);
      removeWord(index);
      return;
    }

    if (KebabGameCore.isWordOutOfBounds(nextTop, gameAreaHeight)) {
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

  skewer.style.right = "auto";
  skewer.style.left = `${gameState.skewerLeft}px`;
  gameState.flying = true;
  requestAnimationFrame(flySkewer);
}

function handleResize() {
  refreshGameLayout();

  if (!gameState.flying && !gameState.ended) {
    setSkewerInitialPosition();
  }

  for (const wordState of gameState.wordStates) {
    updateWordMeasurement(wordState);
  }
}

function updateGame() {
  if (gameState.ended) return;

  if (KebabGameCore.shouldSpawnWord()) createWord();
  updateWords();
}

function runGameLoop(timestamp) {
  if (gameState.ended) return;

  if (!lastFrameTime) {
    lastFrameTime = timestamp;
  }

  const deltaTime = timestamp - lastFrameTime;

  lastFrameTime = timestamp;
  accumulatedTime += Math.min(deltaTime, gameSettings.gameLoopIntervalMs * 4);

  while (accumulatedTime >= gameSettings.gameLoopIntervalMs) {
    updateGame();
    accumulatedTime -= gameSettings.gameLoopIntervalMs;

    if (gameState.ended) {
      return;
    }
  }

  requestAnimationFrame(runGameLoop);
}

function startGame() {
  setSkewerInitialPosition();
  lastFrameTime = 0;
  accumulatedTime = 0;
  requestAnimationFrame(runGameLoop);
}

moveButton.addEventListener("click", shootSkewer);
window.addEventListener("resize", handleResize);

if (skewer.complete) {
  startGame();
} else {
  skewer.addEventListener("load", startGame, { once: true });
}
