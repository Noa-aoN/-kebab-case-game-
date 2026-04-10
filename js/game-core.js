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
      wordElements: [],
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
    return {
      text: getRandomItem(KebabGameData.words),
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
    createInitialState,
    createWordDraft,
    createWordPlacement,
    getHitPercent,
    getInitialSkewerLeft,
    getNextSkewerLeft,
    getResultUrl,
    hitCheckSkewer,
    isWordOutOfBounds,
    shouldSpawnWord,
  };
})();
