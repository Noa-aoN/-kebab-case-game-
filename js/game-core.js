const KebabGameCore = (() => {
  const SETTINGS = {
    defaultSkewerWidth: 150,
    wordMinFontSizeRem: 1.5,
    wordRandomFontSizeRem: 1,
    wordSideMargin: 10,
    wordMinLeft: 10,
    wordMinSpeed: 0.5,
    wordRandomSpeed: 1.5,
    hitTolerance: 5,
    skewerFlySpeed: 40,
    skewerResetDelayMs: 300,
    resultTransitionDelayMs: 100,
    wordSpawnProbability: 0.03,
    gameLoopIntervalMs: 16,
  };

  function createInitialState() {
    return {
      skewerLeft: 0,
      flying: false,
      ended: false,
      wordStates: [],
    };
  }

  function getRandomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function getRandomRange(min, range) {
    return min + Math.random() * range;
  }

  function getResultUrl(wordText, hitPercent) {
    return `result.html?word=${encodeURIComponent(wordText)}&hitPercent=${hitPercent}`;
  }

  function getInitialSkewerLeft(viewportWidth, skewerWidth) {
    return Math.max(0, viewportWidth - (skewerWidth || SETTINGS.defaultSkewerWidth));
  }

  function createWordDraft() {
    const wordEntry = getRandomItem(KebabGameData.words);

    return {
      text: wordEntry.text,
      fontSizeRem: getRandomRange(SETTINGS.wordMinFontSizeRem, SETTINGS.wordRandomFontSizeRem),
    };
  }

  function createWordPlacement(skewerLeft, wordWidth) {
    const maxLeft = Math.max(
      SETTINGS.wordMinLeft,
      skewerLeft - wordWidth - SETTINGS.wordSideMargin,
    );

    return {
      left: getRandomRange(SETTINGS.wordMinLeft, maxLeft - SETTINGS.wordMinLeft),
      top: 0,
      speed: getRandomRange(SETTINGS.wordMinSpeed, SETTINGS.wordRandomSpeed),
    };
  }

  function createWordState(element, width, height) {
    return {
      element,
      width,
      height,
      left: 0,
      top: 0,
      speed: 0,
    };
  }

  function applyWordPlacement(wordState, placement) {
    return {
      ...wordState,
      left: placement.left,
      top: placement.top,
      speed: placement.speed,
    };
  }

  function getNextWordTop(wordState) {
    return wordState.top + wordState.speed;
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

  function getHitPercent(skewerRect, wordRect) {
    const skewerCenterY = skewerRect.top + skewerRect.height / 2;
    const hitPercent = ((skewerCenterY - wordRect.top) / wordRect.height) * 100;

    return Math.min(Math.max(hitPercent, 0), 100).toFixed(1);
  }

  function hitCheckSkewer(skewerRect, wordRect) {
    const skewerLeftX = skewerRect.left;
    const skewerRightX = skewerRect.right;
    const skewerCenterY = skewerRect.top + skewerRect.height / 2;

    const horizontalHit =
      skewerLeftX <= wordRect.right + SETTINGS.hitTolerance &&
      skewerRightX >= wordRect.right - SETTINGS.hitTolerance;

    const verticalHit =
      skewerCenterY >= wordRect.top &&
      skewerCenterY <= wordRect.bottom;

    return horizontalHit && verticalHit;
  }

  function getNextSkewerLeft(skewerLeft) {
    return Math.max(0, skewerLeft - SETTINGS.skewerFlySpeed);
  }

  function shouldSpawnWord() {
    return Math.random() < SETTINGS.wordSpawnProbability;
  }

  function isWordOutOfBounds(wordTop, viewportHeight) {
    return wordTop > viewportHeight;
  }

  return {
    SETTINGS,
    applyWordPlacement,
    createInitialState,
    createWordDraft,
    createWordPlacement,
    createWordState,
    getHitPercent,
    getInitialSkewerLeft,
    getNextSkewerLeft,
    getNextWordTop,
    getResultUrl,
    getWordRect,
    hitCheckSkewer,
    isWordOutOfBounds,
    shouldSpawnWord,
  };
})();
