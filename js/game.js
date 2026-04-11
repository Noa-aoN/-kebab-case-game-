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
  const nextLayout = {
    areaLeft: gameAreaRect.left,
    areaTop: gameAreaRect.top,
    areaWidth: gameAreaRect.width,
    areaHeight: gameAreaRect.height,
    skewerWidth: skewer.offsetWidth,
    skewerHeight: skewer.offsetHeight,
  };

  Object.assign(gameLayout, nextLayout);
}

function renderSkewerPosition({ left, right, display }) {
  skewer.style.left = left;
  skewer.style.right = right;
  skewer.style.display = display;
}

function setSkewerInitialPosition() {
  refreshGameLayout();
  const skewerRightOffset = getSkewerRightOffset();

  gameState.skewerLeft = Math.max(
    0,
    KebabGameCore.getInitialSkewerLeft(gameLayout.areaWidth, gameLayout.skewerWidth) - skewerRightOffset,
  );
  renderSkewerPosition({
    left: "auto",
    right: `${skewerRightOffset}px`,
    display: "block",
  });
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

function renderWordPosition(wordState) {
  wordState.element.style.left = `${wordState.left}px`;
  wordState.element.style.top = `${wordState.top}px`;
}

function createWordState(element) {
  const wordState = KebabGameCore.createWordState(element, 0, 0);

  updateWordMeasurement(wordState);

  return wordState;
}

function placeWordElement(wordState) {
  const placement = KebabGameCore.createWordPlacement(
    gameState.skewerLeft,
    wordState.width,
  );

  const placedWordState = KebabGameCore.applyWordPlacement(wordState, placement);

  wordState.left = placedWordState.left;
  wordState.top = placedWordState.top;
  wordState.speed = placedWordState.speed;
  renderWordPosition(wordState);
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
  const nextTop = KebabGameCore.getNextWordTop(wordState);

  wordState.top = nextTop;
  renderWordPosition(wordState);

  return nextTop;
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
  renderSkewerPosition({
    left: `${gameState.skewerLeft}px`,
    right: "auto",
    display: "block",
  });

  if (gameState.skewerLeft > 0) {
    requestAnimationFrame(flySkewer);
    return;
  }

  renderSkewerPosition({
    left: `${gameState.skewerLeft}px`,
    right: "auto",
    display: "none",
  });
  setTimeout(() => {
    setSkewerInitialPosition();
    gameState.flying = false;
  }, gameSettings.skewerResetDelayMs);
}

function shootSkewer() {
  if (gameState.flying || gameState.ended) return;

  renderSkewerPosition({
    left: `${gameState.skewerLeft}px`,
    right: "auto",
    display: "block",
  });
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
