const KebabResultData = {
  casePatterns: [
    { regex: /^[a-z][A-Z][a-z0-9]+([A-Z][a-z0-9]*)*$/, img: "image/hungarian.png", label: "ハンガリアン記法" },
    { regex: /^[a-z]+([A-Z][a-z0-9]*)+$/, img: "image/camel.png", label: "キャメルケース" },
    { regex: /^[A-Z][a-z0-9]+([A-Z][a-z0-9]*)+$/, img: "image/upper_camel.png", label: "アッパーキャメルケース" },
    { regex: /^[a-z0-9]+(_[a-z0-9]+)+$/, img: "image/snake.png", label: "スネークケース" },
    { regex: /^[A-Z0-9]+(_[A-Z0-9]+)+$/, img: "image/upper_snake.png", label: "アッパースネークケース" },
    { regex: /^[a-z0-9]+( [a-z0-9]+)+$/, img: "image/ok_kebab.png", label: "ケバブケース", isKebabTarget: true },
    { regex: /^[A-Z][a-z0-9]+( [A-Z][a-z0-9]+)+$/, img: "image/ok_kebab.png", label: "アッパーケバブケース", isKebabTarget: true },
    { regex: /^[a-z0-9]+(\.[a-z0-9]+)+$/, img: "image/dot.png", label: "ドット記法" },
  ],

  unknownCase: {
    img: "image/miss_kebab.png",
    label: "不明",
    isKebabTarget: false,
  },

  kebabResultImages: [
    { minScore: 100, img: "image/perfect_kebab.png" },
    { minScore: 90, img: "image/great_kebab.png" },
    { minScore: 75, img: "image/good_kebab.png" },
    { minScore: 50, img: "image/ok_kebab.png" },
    { minScore: 0, img: "image/miss_kebab.png" },
  ],
};
