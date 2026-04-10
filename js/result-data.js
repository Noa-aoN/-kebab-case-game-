const KebabResultData = {
  casePatterns: [
    { regex: /^[a-z][A-Z][a-z0-9]+([A-Z][a-z0-9]*)*$/, img: "image/hungarian.webp", label: "ハンガリアン記法" },
    { regex: /^[a-z]+([A-Z][a-z0-9]*)+$/, img: "image/camel.webp", label: "キャメルケース" },
    { regex: /^[A-Z][a-z0-9]+([A-Z][a-z0-9]*)+$/, img: "image/upper_camel.webp", label: "アッパーキャメルケース" },
    { regex: /^[a-z0-9]+(_[a-z0-9]+)+$/, img: "image/snake.webp", label: "スネークケース" },
    { regex: /^[A-Z0-9]+(_[A-Z0-9]+)+$/, img: "image/upper_snake.webp", label: "アッパースネークケース" },
    { regex: /^[a-z0-9]+( [a-z0-9]+)+$/, img: "image/ok_kebab.webp", label: "ケバブケース", isKebabTarget: true },
    { regex: /^[A-Z][a-z0-9]+( [A-Z][a-z0-9]+)+$/, img: "image/ok_kebab.webp", label: "アッパーケバブケース", isKebabTarget: true },
    { regex: /^[a-z0-9]+(\.[a-z0-9]+)+$/, img: "image/dot.webp", label: "ドット記法" },
  ],

  unknownCase: {
    img: "image/miss_kebab.webp",
    label: "不明",
    isKebabTarget: false,
  },

  kebabResultImages: [
    { minScore: 100, img: "image/perfect_kebab.webp" },
    { minScore: 90, img: "image/great_kebab.webp" },
    { minScore: 75, img: "image/good_kebab.webp" },
    { minScore: 50, img: "image/ok_kebab.webp" },
    { minScore: 0, img: "image/miss_kebab.webp" },
  ],
};
