const KebabResultCore = (() => {
  function detectCase(word) {
    return KebabResultData.casePatterns.find(pattern => pattern.regex.test(word)) ||
      KebabResultData.unknownCase;
  }

  function formatResultWord(word, isKebabTarget, hitPercent) {
    if (isKebabTarget && hitPercent >= 85) {
      return word.replace(" ", "_");
    }

    return word.replace(" ", "-");
  }

  function calcScore(hitPercent) {
    const diff = Math.abs(hitPercent - 50);
    return Math.max(0, Math.round(100 - diff * 2));
  }

  function getRank(score, matchedCase) {
    if (!matchedCase.isKebabTarget) {
      return { label: `${matchedCase.label}を刺した！`, color: "text-red-400" };
    }

    if (score >= 100) return { label: "Perfect!", color: "text-orange-300" };
    if (score >= 90) return { label: "Great!", color: "text-yellow-300" };
    if (score >= 75) return { label: "Good!", color: "text-green-300" };
    if (score >= 50) return { label: "OK!", color: "text-blue-300" };

    return { label: "Miss...", color: "text-red-400" };
  }

  function getKebabResultImage(score, hitPercent) {
    if (hitPercent >= 85) return "image/kebab_snake.png";

    return KebabResultData.kebabResultImages.find(result => score >= result.minScore).img;
  }

  function getResultImage(matchedCase, score, hitPercent) {
    if (matchedCase.isKebabTarget) {
      return getKebabResultImage(score, hitPercent);
    }

    return matchedCase.img;
  }

  function getScoreText(score, rank, matchedCase, hitPercent) {
    if (!matchedCase.isKebabTarget) return rank.label;

    return hitPercent >= 85
      ? `下から ${Math.round(100 - hitPercent)}% 地点に刺さった！`
      : `${rank.label}　${score}点`;
  }

  function getShareText({ word, score, rank, matchedCase, hitPercent }) {
    const borderLine = "-------------------------------\n";
    const wordDisplay = matchedCase.isKebabTarget
      ? word.replace("-", " ").replace("_", " ")
      : word.replace("-", " ");
    const resultCase = (matchedCase.isKebabTarget && hitPercent >= 85)
      ? "新スネークケース"
      : matchedCase.label;
    const rankText = matchedCase.isKebabTarget ? rank.label : "判定不能！";
    const resultSkewer = matchedCase.isKebabTarget ? "" : "串";

    return `🥙 #ケバブケースゲーム 🥙\n${borderLine}🍖素材：「${wordDisplay}」を串刺し！\n🥙仕上がり：${resultCase}${resultSkewer}\n💯スコア：${score}点\n🎯評価：${rankText}\n${borderLine}`;
  }

  function makeXUrl(text, url) {
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  }

  function buildResult(word, hitPercent) {
    const matchedCase = detectCase(word);
    const score = calcScore(hitPercent);
    const rank = getRank(score, matchedCase);

    return {
      word,
      hitPercent,
      matchedCase,
      score,
      rank,
      image: getResultImage(matchedCase, score, hitPercent),
      wordText: formatResultWord(word, matchedCase.isKebabTarget, hitPercent),
      scoreText: getScoreText(score, rank, matchedCase, hitPercent),
    };
  }

  return {
    buildResult,
    getShareText,
    makeXUrl,
  };
})();
