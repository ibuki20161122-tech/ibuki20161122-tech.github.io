// =====================
// 単語
// =====================
const words = [
  "りんご","かんじ","てんき","ほん","ねこ",
  "すし","しゃしん","がっこう","きょう","しゅくだい",
  "じてんしゃ","びょういん","きゃべつ","ちず","つき"
];

// =====================
// ローマ字テーブル
// =====================
const romaMap = {
  "あ":["a"],"い":["i","yi"],"う":["u","wu"],"え":["e"],"お":["o"],
  "か":["ka","ca"],"き":["ki"],"く":["ku","cu","qu"],"け":["ke"],"こ":["ko","co"],
  "さ":["sa"],"し":["shi","si","ci"],"す":["su"],"せ":["se","ce"],"そ":["so"],
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
  "じゃ":["ja","jya","zya"],"じゅ":["ju","jyu","zyu"],"じょ":["jo","jyo","zyo"]
};

// =====================
// かな→ローマ字
// =====================
function kanaToRoma(kana) {
  let results = [""];

  for (let i = 0; i < kana.length; i++) {
    let c = kana[i];

    // 小さい「っ」
    if (c === "っ") {
      let next = kana[i + 1];
      let nextRoma = getRoma(next);
      let temp = [];

      results.forEach(r => {
        nextRoma.forEach(n => {
          if (n) temp.push(r + n[0]);
        });
        temp.push(r + "xtu");
        temp.push(r + "ltu");
      });

      results = temp;
      continue;
    }

    // 拗音
    let pair = kana[i] + kana[i + 1];
    if (digraph[pair]) {
      results = combine(results, digraph[pair]);
      i++;
      continue;
    }

    results = combine(results, getRoma(c));
  }

  results = expandN(results);

  return [...new Set(results)].slice(0, 200); // 重さ対策
}

function getRoma(char) {
  return romaMap[char] || [""];
}

function combine(a, b) {
  let res = [];
  a.forEach(x => b.forEach(y => res.push(x + y)));
  return res;
}

// ん拡張
function expandN(list) {
  let res = [];

  list.forEach(str => {
    res.push(str);

    if (str.includes("n")) {
      res.push(str.replace(/n/g, "nn"));
      res.push(str.replace(/n(?=[aiueoy])/g, "n'"));
      res.push(str.replace(/n/g, "xn"));
    }
  });

  return res;
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

// DOM
const jpWord = document.getElementById("jpWord");
const romaWord = document.getElementById("romaWord");
const input = document.getElementById("input");
const effect = document.getElementById("effect");

document.getElementById("highScore").textContent = highScore;

// 🎵 音
const ctx = new AudioContext();
function typeSound() {
  let o = ctx.createOscillator();
  let g = ctx.createGain();
  o.frequency.value = 600;
  g.gain.value = 0.05;
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.05);
}

function missSound() {
  let o = ctx.createOscillator();
  let g = ctx.createGain();
  o.frequency.value = 150;
  g.gain.value = 0.05;
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.1);
}

// 💥 エフェクト
function showEffect(text) {
  effect.textContent = text;
  effect.style.opacity = 1;
  setTimeout(() => {
    effect.style.opacity = 0;
  }, 300);
}

// ⌨️ スペース開始
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    startGame();
  }
});

// =====================
// ゲーム処理
// =====================
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
  let kana = words[Math.floor(Math.random() * words.length)];
  let patterns = kanaToRoma(kana);

  current = { kana, patterns };

  jpWord.textContent = kana;
  romaWord.textContent = patterns[0];
}

input.addEventListener("input", () => {
  let val = input.value;

  let match = current.patterns.some(p => p.startsWith(val));

  if (match) {
    let complete = current.patterns.includes(val);

    if (complete) {
      combo++;
      score += 10 + combo * 2;

      typeSound();

      if (combo >= 3) {
        showEffect("🔥 " + combo + " COMBO!");
      }

      if (score > level * 100) {
        level++;
        time += 5;
      }

      input.value = "";
      nextWord();
    }
  } else {
    combo = 0;
    input.value = "";
    missSound();
  }

  updateUI();
});

function updateTime() {
  time--;
  document.getElementById("time").textContent = time;

  if (time <= 0) {
    endGame();
  }
}

function updateUI() {
  document.getElementById("score").textContent = score;
  document.getElementById("combo").textContent = combo;
  document.getElementById("level").textContent = level;
}

// =====================
// 終了＆ランキング
// =====================
function endGame() {
  clearInterval(timer);
  input.disabled = true;
  jpWord.textContent = "ゲーム終了！";

  if (score > highScore) {
    localStorage.setItem("highScore", score);
    document.getElementById("highScore").textContent = score;
  }

  saveScore(score);
}

function saveScore(s) {
  let r = JSON.parse(localStorage.getItem("rank")) || [];
  r.push(s);
  r.sort((a, b) => b - a);
  r = r.slice(0, 5);
  localStorage.setItem("rank", JSON.stringify(r));
}

function showRanking() {
  let r = JSON.parse(localStorage.getItem("rank")) || [];
  alert("🏆ランキング\n" + r.map((s, i) => `${i + 1}位: ${s}`).join("\n"));
}
