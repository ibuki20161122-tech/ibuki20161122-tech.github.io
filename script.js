// =====================
// 単語（自由に増やしてOK）
// =====================
const words = [
  "りんご","かんじ","てんき","ほん","ねこ",
  "すし","しゃしん","がっこう","きょう","しゅくだい",
  "じてんしゃ","びょういん","きゃべつ","ちず","つき"
];

// =====================
// ローマ字テーブル（完全強化版）
// =====================
const romaMap = {
  "あ":["a"],"い":["i"],"う":["u"],"え":["e"],"お":["o"],
  "か":["ka","ca"],"き":["ki"],"く":["ku","cu","qu"],"け":["ke"],"こ":["ko","co"],
  "さ":["sa"],"し":["shi","si"],"す":["su"],"せ":["se","ce"],"そ":["so"],
  "た":["ta"],"ち":["chi","ti"],"つ":["tsu","tu"],"て":["te"],"と":["to"],
  "な":["na"],"に":["ni"],"ぬ":["nu"],"ね":["ne"],"の":["no"],
  "は":["ha"],"ひ":["hi"],"ふ":["fu","hu"],"へ":["he"],"ほ":["ho"],
  "ま":["ma"],"み":["mi"],"む":["mu"],"め":["me"],"も":["mo"],
  "や":["ya"],"ゆ":["yu"],"よ":["yo"],
  "ら":["ra"],"り":["ri"],"る":["ru"],"れ":["re"],"ろ":["ro"],
  "わ":["wa"],"を":["wo","o"],"ん":["n"],
  "が":["ga"],"ぎ":["gi"],"ぐ":["gu"],"げ":["ge"],"ご":["go"],
  "ざ":["za"],"じ":["ji","zi"],"ず":["zu"],"ぜ":["ze"],"ぞ":["zo"],
  "だ":["da"],"ぢ":["di","ji"],"づ":["du","zu"],"で":["de"],"ど":["do"],
  "ば":["ba"],"び":["bi"],"ぶ":["bu"],"べ":["be"],"ぼ":["bo"],
  "ぱ":["pa"],"ぴ":["pi"],"ぷ":["pu"],"ぺ":["pe"],"ぽ":["po"]
};

// 拗音
const digraph = {
  "きゃ":["kya"],"きゅ":["kyu"],"きょ":["kyo"],
  "しゃ":["sha","sya"],"しゅ":["shu","syu"],"しょ":["sho","syo"],
  "ちゃ":["cha","tya"],"ちゅ":["chu","tyu"],"ちょ":["cho","tyo"],
  "にゃ":["nya"],"にゅ":["nyu"],"にょ":["nyo"],
  "ひゃ":["hya"],"ひゅ":["hyu"],"ひょ":["hyo"],
  "みゃ":["mya"],"みゅ":["myu"],"みょ":["myo"],
  "りゃ":["rya"],"りゅ":["ryu"],"りょ":["ryo"],
  "ぎゃ":["gya"],"ぎゅ":["gyu"],"ぎょ":["gyo"],
  "じゃ":["ja","jya","zya"],"じゅ":["ju","jyu","zyu"],"じょ":["jo","jyo","zyo"],
  "びゃ":["bya"],"びゅ":["byu"],"びょ":["byo"],
  "ぴゃ":["pya"],"ぴゅ":["pyu"],"ぴょ":["pyo"]
};

// =====================
// かな → ローマ字
// =====================
function kanaToRomaPatterns(kana) {
  let results = [""];

  for (let i = 0; i < kana.length; i++) {
    let char = kana[i];

    // 小さい「っ」
    if (char === "っ") {
      let next = kana[i+1];
      let nextRoma = getRoma(next);
      let temp = [];

      results.forEach(r => {
        nextRoma.forEach(nr => {
          if (nr) temp.push(r + nr[0]);
        });
        temp.push(r + "xtu");
        temp.push(r + "ltu");
      });

      results = temp;
      continue;
    }

    // 拗音
    let pair = kana[i] + kana[i+1];
    if (digraph[pair]) {
      results = combine(results, digraph[pair]);
      i++;
      continue;
    }

    results = combine(results, getRoma(char));
  }

  return expandN(results);
}

function getRoma(char) {
  return romaMap[char] || [""];
}

function combine(a, b) {
  let res = [];
  a.forEach(x => b.forEach(y => res.push(x + y)));
  return res;
}

// 「ん」強化
function expandN(list) {
  let res = [];

  list.forEach(str => {
    res.push(str);

    if (str.includes("n")) {
      res.push(str.replace(/n/g, "nn"));
      res.push(str.replace(/n(?=[aiueoy])/g, "n'"));
    }
  });

  return [...new Set(res)];
}

// =====================
// ゲーム
// =====================
let current = {};
let score = 0;
let time = 30;
let level = 1;
let combo = 0;
let highScore = localStorage.getItem("highScore") || 0;
let timer;

const jpWord = document.getElementById("jpWord");
const romaWord = document.getElementById("romaWord");
const input = document.getElementById("input");

const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");
const timeDisplay = document.getElementById("time");
const levelDisplay = document.getElementById("level");
const comboDisplay = document.getElementById("combo");

highScoreDisplay.textContent = highScore;

// ⭐ スペースで開始（スクロール防止）
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    startGame();
  }
});

function startGame() {
  score = 0;
  time = 30;
  level = 1;
  combo = 0;

  input.disabled = false;
  input.value = "";

  setTimeout(() => input.focus(), 50);

  nextWord();

  clearInterval(timer);
  timer = setInterval(updateTime, 1000);

  updateUI();
}

function nextWord() {
  const kana = words[Math.floor(Math.random() * words.length)];
  let patterns = kanaToRomaPatterns(kana);

  // ⚡ 重くならないよう制限
  patterns = patterns.slice(0, 50);

  current = { kana, patterns };

  jpWord.textContent = kana;
  romaWord.textContent = patterns[0]; // 軽量表示
}

input.addEventListener("input", () => {
  const val = input.value;

  const match = current.patterns.some(p => p.startsWith(val));

  if (match) {
    const complete = current.patterns.some(p => p === val);

    if (complete) {
      combo++;
      score += 10 + combo * 2;

      if (score > level * 100) {
        level++;
        time += 5;
      }

      updateUI();
      input.value = "";
      nextWord();
    }
  } else {
    combo = 0;
    input.value = "";
    updateUI();
  }
});

function updateTime() {
  time--;
  timeDisplay.textContent = time;

  if (time <= 0) {
    clearInterval(timer);
    endGame();
  }
}

function updateUI() {
  scoreDisplay.textContent = score;
  comboDisplay.textContent = combo;
  levelDisplay.textContent = level;
}

function endGame() {
  jpWord.textContent = "ゲーム終了！";
  romaWord.textContent = "";
  input.disabled = true;

  if (score > highScore) {
    localStorage.setItem("highScore", score);
    highScoreDisplay.textContent = score;
  }
}
