const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

function loadGlobal(scripts, globalName) {
  const code = scripts.map(script => fs.readFileSync(script, "utf8")).join("\n");

  return vm.runInNewContext(`${code}\n;${globalName}`, {});
}

test("game core calculates skewer movement and hit position", () => {
  const core = loadGlobal(["js/game-data.js", "js/game-core.js"], "KebabGameCore");
  const skewerRect = { left: 90, right: 160, top: 40, height: 20 };
  const wordRect = { right: 95, top: 30, bottom: 70, height: 40 };

  assert.equal(core.getInitialSkewerLeft(500, 150), 350);
  assert.equal(core.getNextSkewerLeft(35), 0);
  assert.equal(core.hitCheckSkewer(skewerRect, wordRect), true);
  assert.equal(core.getHitPercent(skewerRect, wordRect), "50.0");
});

test("game core creates word drafts from configured word data", () => {
  const core = loadGlobal(["js/game-data.js", "js/game-core.js"], "KebabGameCore");
  const draft = core.createWordDraft();

  assert.equal(typeof draft.text, "string");
  assert.equal(draft.text.length > 0, true);
  assert.equal(draft.fontSizeRem >= core.SETTINGS.wordMinFontSizeRem, true);
  assert.equal(
    draft.fontSizeRem <= core.SETTINGS.wordMinFontSizeRem + core.SETTINGS.wordRandomFontSizeRem,
    true,
  );
});

test("result core builds kebab results by hit position", () => {
  const core = loadGlobal(["js/result-data.js", "js/result-core.js"], "KebabResultCore");
  const centerHit = core.buildResult("chicken meat", 50);
  const lowHit = core.buildResult("chicken meat", 90);

  assert.equal(centerHit.image, "image/perfect_kebab.png");
  assert.equal(centerHit.wordText, "chicken-meat");
  assert.equal(centerHit.score, 100);
  assert.equal(centerHit.rank.label, "Perfect!");

  assert.equal(lowHit.image, "image/kebab_snake.png");
  assert.equal(lowHit.wordText, "chicken_meat");
  assert.equal(lowHit.scoreText, "下から 10% 地点に刺さった！");
});

test("result core detects non-kebab naming styles", () => {
  const core = loadGlobal(["js/result-data.js", "js/result-core.js"], "KebabResultCore");

  assert.equal(core.buildResult("anaconda_serpent", 50).matchedCase.label, "スネークケース");
  assert.equal(core.buildResult("ANACONDA_SERPENT", 50).matchedCase.label, "アッパースネークケース");
  assert.equal(core.buildResult("dromedaryCamel", 50).matchedCase.label, "キャメルケース");
  assert.equal(core.buildResult("BactrianCamel", 50).matchedCase.label, "アッパーキャメルケース");
  assert.equal(core.buildResult("polka.dot", 50).matchedCase.label, "ドット記法");
});
