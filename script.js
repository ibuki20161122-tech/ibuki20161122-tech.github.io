// =====================
// 単語（ひらがな）
// =====================
const words = [
  "りんご","かんじ","てんき","ほん","ねこ",
  "すし","しゃしん","がっこう","きょう","しゅくだい",
  "ちず","つき","じてんしゃ","びょういん","きゃべつ"
];

// =====================
// 基本ローマ字テーブル
// =====================
const romaMap = {
  "あ":["a"],"い":["i","yi"],"う":["u","wu"],"え":["e"],"お":["o"],
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
// かな→ローマ字（全パターン生成）
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
          temp.push(r + nr[0]); // 子音重ね
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

    // 通常
    let romaList = getRoma(char);
    results = combine(results, romaList);
  }

  // 「ん」強化
  results = expandN(results);

  return [...new Set(results)];
}

function getRoma(char) {
  return romaMap[char] || [char];
}

function combine(arr, list) {
  let res = [];
  arr.forEach(a => {
    list.forEach(b => {
      res.push(a + b);
    });
  });
  return res;
}

// =====================
// 「ん」拡張
// =====================
function expandN(list) {
  let res = [];
  list.forEach(str => {
    res.push(str);

    if (str.includes("n")) {
      res.push(str.replace(/n/g, "nn"));
      res.push(str.replace(/n(?=[aiueoy])/g, "n'"));
    }
  });
  return res;
}

// =====================
// ゲーム変数
// =====================
let current = {};
let score = 0;
let time = 30;
let level = 1;
let combo = 0;
let highScore = localStorage.getItem("highScore") || 0;
let timer;

// =====================
// DOM
// =====================
const jpWord = document.getElementById("jpWord");
const romaWord = document.getElementById("romaWord");
const input = document.getElementById("input");

const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");
const timeDisplay = document.getElementById("time");
const levelDisplay = document.getElementById("level");
const comboDisplay = document.getElementById("combo");

highScoreDisplay.textContent = highScore;

// =====================
// ゲーム開始
// =====================
function startGame() {
  score = 0;
  time = 30;
  level = 1;
  combo = 0;

  input.disabled = false;
  input.value = "";
  input.focus();

  nextWord();

  clearInterval(timer);
  timer = setInterval(updateTime, 1000);

  updateUI();
}

// =====================
// 次の単語
// =====================
function nextWord() {
  const kana = words[Math.floor(Math.random() * words.length)];
  const patterns = kanaToRomaPatterns(kana);

  current = { kana, patterns };

  jpWord.textContent = kana;
  romaWord.textContent = patterns.slice(0,5).join(" / ") + " ...";
}

// =====================
// 入力判定
// =====================
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

// =====================
// タイマー
// =====================
function updateTime() {
  time--;
  timeDisplay.textContent = time;

  if (time <= 0) {
    clearInterval(timer);
    endGame();
  }
}

// =====================
// UI更新
// =====================
function updateUI() {
  scoreDisplay.textContent = score;
  comboDisplay.textContent = combo;
  levelDisplay.textContent = level;
}

// =====================
// 終了
// =====================
function endGame() {
  jpWord.textContent = "ゲーム終了！";
  romaWord.textContent = "";
  input.disabled = true;

  if (score > highScore) {
    localStorage.setItem("highScore", score);
    highScoreDisplay.textContent = score;
  }
}
