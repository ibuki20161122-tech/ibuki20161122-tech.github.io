const VERSION = "v3.0.2";

// ===== 要素取得（最重要：これがないと動かない）=====
const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("result");

const input = document.getElementById("input");
const jp = document.getElementById("jpWord");
const roma = document.getElementById("romaWord");

// ===== 初期状態（バグ防止）=====
window.addEventListener("load", () => {
  resultScreen.classList.add("hidden");
  titleScreen.classList.remove("hidden");
  gameScreen.classList.add("hidden");
});

// ===== 単語レベル =====
const wordLevels = [
  ["ねこ","いぬ","すし"],
  ["りんご","えんぴつ"],
  ["しゅくだい","せんせい"],
  ["ぷろぐらみんぐ","こんぴゅーたー"]
];

// ===== ローマ字辞書 =====
const romaMap = {
  "あ":["a"],"い":["i"],"う":["u"],"え":["e"],"お":["o"],
  "か":["ka"],"き":["ki"],"く":["ku"],"け":["ke"],"こ":["ko"],
  "さ":["sa"],"し":["shi","si"],"す":["su"],"せ":["se"],"そ":["so"],
  "た":["ta"],"ち":["chi","ti"],"つ":["tsu","tu"],"て":["te"],"と":["to"],
  "な":["na"],"に":["ni"],"ぬ":["nu"],"ね":["ne"],"の":["no"],
  "は":["ha"],"ひ":["hi"],"ふ":["fu"],"へ":["he"],"ほ":["ho"],
  "ま":["ma"],"み":["mi"],"む":["mu"],"め":["me"],"も":["mo"],
  "や":["ya"],"ゆ":["yu"],"よ":["yo"],
  "ら":["ra"],"り":["ri"],"る":["ru"],"れ":["re"],"ろ":["ro"],
  "わ":["wa"],"を":["wo"],
  "ん":["n","nn"],
  "ぱ":["pa"],"ぴ":["pi"],"ぷ":["pu"],"ぺ":["pe"],"ぽ":["po"]
};

const digraph = {
  "しゃ":["sha","sya"],"しゅ":["shu","syu"],"しょ":["sho","syo"],
  "きゃ":["kya"],"きゅ":["kyu"],"きょ":["kyo"],
  "ぴゃ":["pya"],"ぴゅ":["pyu"],"ぴょ":["pyo"]
};

// ===== ローマ字変換 =====
function kanaToRoma(k){
  let res=[""];

  for(let i=0;i<k.length;i++){
    let c=k[i];

    // 長音
    if(c==="ー"){
      let tmp=[];
      res.forEach(r=>{
        let last=r.slice(-1);
        if("aeiou".includes(last)) tmp.push(r+last);
      });
      res=tmp;
      continue;
    }

    // 拗音
    let pair=k[i]+k[i+1];
    if(digraph[pair]){
      res=combine(res,digraph[pair]);
      i++;
      continue;
    }

    res=combine(res,romaMap[c]||[""]);
  }

  return res;
}

function combine(a,b){
  let r=[];
  a.forEach(x=>b.forEach(y=>r.push(x+y)));
  return r;
}

// ===== ゲーム変数 =====
let score=0, combo=0, time=30, level=1;
let timer, lastWord="";
let current={}, display="";

// ===== スペースキー開始 =====
document.addEventListener("keydown", (e)=>{
  if(e.code==="Space"){
    e.preventDefault();

    if(!titleScreen.classList.contains("hidden")){
      titleScreen.classList.add("hidden");
      gameScreen.classList.remove("hidden");
      startGame();
    }
  }
});

// ===== ゲーム開始 =====
function startGame(){
  score=0;
  combo=0;
  time=30;
  level=1;

  input.disabled=false;
  input.value="";
  input.focus();

  nextWord();

  clearInterval(timer);
  timer=setInterval(updateTime,1000);
}

// ===== レベル更新 =====
function updateLevel(){
  level = Math.floor(score/50)+1;
  if(level > wordLevels.length) level = wordLevels.length;
}

// ===== 次の単語 =====
function nextWord(){
  updateLevel();

  let pool = wordLevels[level-1];
  let k;

  do{
    k = pool[Math.floor(Math.random()*pool.length)];
  }while(k === lastWord);

  lastWord = k;

  let patterns = kanaToRoma(k);

  current = {kana:k, patterns:patterns};
  display = patterns[0];

  jp.textContent = k;
  show("", display);
}

// ===== 入力 =====
input.addEventListener("input", ()=>{
  let val = input.value.toLowerCase();

  let valid = current.patterns.filter(p=>p.startsWith(val));

  if(valid.length > 0){
    display = valid[0];
    show(val, display);

    if(valid.includes(val)){
      combo++;
      score += 10 + combo*2;
      input.value="";
      nextWord();
    }
  }else{
    combo = 0;
    input.value = val.slice(0,-1);
  }

  updateUI();
});

// ===== 表示 =====
function show(inputStr, correct){
  let html="";
  let gold = combo >= 10;

  for(let i=0;i<correct.length;i++){
    let cls="remaining";

    if(i < inputStr.length){
      cls = gold ? "gold" : "correct";
    }

    html += `<span class="${cls}">${correct[i]}</span>`;
  }

  roma.innerHTML = html;
}

// ===== タイマー =====
function updateTime(){
  time--;
  if(time <= 0) endGame();
  updateUI();
}

// ===== 終了 =====
function endGame(){
  clearInterval(timer);
  input.disabled = true;

  saveScore(score);

  document.getElementById("finalScore").textContent =
    "Score: " + score + " / " + VERSION;

  resultScreen.classList.remove("hidden");
}

// ===== 閉じる =====
function closeResult(){
  resultScreen.classList.add("hidden");
  titleScreen.classList.remove("hidden");
  gameScreen.classList.add("hidden");
}

// ===== ランキング =====
function saveScore(s){
  let d = JSON.parse(localStorage.getItem("rank") || "[]");

  d.push(s);
  d.sort((a,b)=>b-a);
  d = d.slice(0,5);

  localStorage.setItem("rank", JSON.stringify(d));
  loadRanking();
}

function loadRanking(){
  let d = JSON.parse(localStorage.getItem("rank") || "[]");
  let list = document.getElementById("ranking");

  list.innerHTML="";
  d.forEach(v=>{
    let li=document.createElement("li");
    li.textContent=v;
    list.appendChild(li);
  });
}
loadRanking();

// ===== UI更新 =====
function updateUI(){
  document.getElementById("score").textContent=score;
  document.getElementById("combo").textContent=combo;
  document.getElementById("time").textContent=time;
  document.getElementById("level").textContent=level;
}
