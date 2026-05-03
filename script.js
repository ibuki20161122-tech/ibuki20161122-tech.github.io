const words = [
  "りんご","かんじ","てんき","ほん","ねこ",
  "すし","しゃしん","がっこう","きょう","しゅくだい"
];

// ローマ字
const romaMap = {
  "あ":["a"],"い":["i"],"う":["u"],"え":["e"],"お":["o"],
  "か":["ka"],"き":["ki"],"く":["ku"],"け":["ke"],"こ":["ko"],
  "さ":["sa"],"し":["shi","si"],"す":["su"],"せ":["se"],"そ":["so"],
  "た":["ta"],"ち":["chi","ti"],"つ":["tsu","tu"],"て":["te"],"と":["to"],
  "な":["na"],"に":["ni"],"ぬ":["nu"],"ね":["ne"],"の":["no"],
  "は":["ha"],"ひ":["hi"],"ふ":["fu","hu"],"へ":["he"],"ほ":["ho"],
  "ま":["ma"],"み":["mi"],"む":["mu"],"め":["me"],"も":["mo"],
  "や":["ya"],"ゆ":["yu"],"よ":["yo"],
  "ら":["ra"],"り":["ri"],"る":["ru"],"れ":["re"],"ろ":["ro"],
  "わ":["wa"],"を":["wo"],"ん":["n"]
};

const digraph = {
  "しゃ":["sha","sya"],"しゅ":["shu","syu"],"しょ":["sho","syo"],
  "ちゃ":["cha","tya"],"ちゅ":["chu","tyu"],"ちょ":["cho","tyo"]
};

// 変換
function kanaToRomaPatterns(kana) {
  let results = [""];

  for (let i = 0; i < kana.length; i++) {
    let char = kana[i];

    if (char === "っ") {
      let next = kana[i+1];
      let nextRoma = romaMap[next] || ["x"];
      let temp = [];
      results.forEach(r => {
        nextRoma.forEach(nr => temp.push(r + nr[0]));
        temp.push(r + "xtu");
      });
      results = temp;
      continue;
    }

    let pair = kana[i] + kana[i+1];
    if (digraph[pair]) {
      results = combine(results, digraph[pair]);
      i++;
      continue;
    }

    results = combine(results, romaMap[char] || [char]);
  }

  results = expandN(results);
  return [...new Set(results)];
}

function combine(a, b) {
  let res = [];
  a.forEach(x => b.forEach(y => res.push(x + y)));
  return res;
}

function expandN(list) {
  let res = [];
  list.forEach(str => {
    res.push(str);
    res.push(str.replace(/n/g, "nn"));
    res.push(str.replace(/n(?=[aiueoy])/g, "n'"));
  });
  return res;
}

// ゲーム
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

// ⭐ スペースキーで開始
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
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
  input.focus();

  nextWord();

  clearInterval(timer);
  timer = setInterval(updateTime, 1000);

  updateUI();
}

function nextWord() {
  const kana = words[Math.floor(Math.random() * words.length)];
  const patterns = kanaToRomaPatterns(kana);

  current = { kana, patterns };

  jpWord.textContent = kana;
  romaWord.textContent = patterns.slice(0,5).join(" / ");
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
