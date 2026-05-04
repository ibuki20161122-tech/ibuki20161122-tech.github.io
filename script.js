// =====================
// 単語
// =====================
const words = [
  "りんご","かんじ","びょういん","がっこう","しゃしん","きょう","しゅくだい"
];

// =====================
// ローマ字
// =====================
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
 "わ":["wa"],"を":["wo"],"ん":["n"],
 "が":["ga"],"ぎ":["gi"],"ぐ":["gu"],"げ":["ge"],"ご":["go"],
 "ざ":["za"],"じ":["ji","zi"],"ず":["zu"],"ぜ":["ze"],"ぞ":["zo"],
 "ば":["ba"],"び":["bi"],"ぶ":["bu"],"べ":["be"],"ぼ":["bo"]
};

const digraph = {
 "しゃ":["sha","sya"],"しゅ":["shu","syu"],"しょ":["sho","syo"],
 "びゃ":["bya"],"びゅ":["byu"],"びょ":["byo"]
};

// =====================
// かな→ローマ字
// =====================
function kanaToRoma(kana){
 let res=[""];

 for(let i=0;i<kana.length;i++){
  let c=kana[i];

  // っ
  if(c==="っ"){
    let next=romaMap[kana[i+1]]||[""];
    let temp=[];
    res.forEach(r=>{
      next.forEach(n=>temp.push(r+n[0]));
      temp.push(r+"xtu");
    });
    res=temp;
    continue;
  }

  // 拗音
  let pair=kana[i]+kana[i+1];
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

// =====================
// ゲーム変数
// =====================
let current = {};
let score = 0;
let combo = 0;
let highScore = localStorage.getItem("highScore") || 0;

// DOM
const input = document.getElementById("input");
const jp = document.getElementById("jpWord");
const roma = document.getElementById("romaWord");
const effect = document.getElementById("effect");

// 初期表示
document.getElementById("highScore").textContent = highScore;

// =====================
// 開始
// =====================
document.addEventListener("keydown",e=>{
 if(e.code==="Space"){
  e.preventDefault();
  startGame();
 }
});

function startGame(){
 score=0;
 combo=0;

 input.disabled=false;
 input.value="";
 input.focus();

 nextWord();
 updateUI();
}

// =====================
// 次の問題
// =====================
function nextWord(){
 let k = words[Math.floor(Math.random()*words.length)];
 let patterns = kanaToRoma(k);

 current = {kana:k, patterns};

 jp.textContent = k;
 roma.innerHTML = `<span class="remaining">${patterns[0]}</span>`;
}

// =====================
// 入力
// =====================
input.addEventListener("input",()=>{
 let val = input.value.toLowerCase(); // ⭐大文字対応

 let p = current.patterns.find(x=>x.startsWith(val));

 if(p){
   showColored(val,p);

   if(p === val){
     combo++;
     score += 10 + combo * 2;

     popEffect();

     input.value="";
     nextWord();
   }
 }else{
   combo = 0;
   // ⭐リセットしない（重要）
 }

 updateUI();
});

// =====================
// 色表示
// =====================
function showColored(inputStr,correct){
 let html="";

 for(let i=0;i<correct.length;i++){
  if(i<inputStr.length){
    if(inputStr[i]===correct[i]){
      html+=`<span class="correct">${correct[i]}</span>`;
    }else{
      html+=`<span class="wrong">${correct[i]}</span>`;
    }
  }else{
    html+=`<span class="remaining">${correct[i]}</span>`;
  }
 }

 roma.innerHTML=html;
}

// =====================
// エフェクト
// =====================
function popEffect(){
 effect.textContent="✨";
 effect.style.opacity=1;
 setTimeout(()=>effect.style.opacity=0,300);
}

// =====================
// UI更新（バグ修正ポイント）
// =====================
function updateUI(){
 document.getElementById("score").textContent = score;
 document.getElementById("combo").textContent = combo;
}

// =====================
// ランキング（ローカル）
// =====================
function saveScore(s){
 let r = JSON.parse(localStorage.getItem("rank")) || [];
 r.push(s);
 r.sort((a,b)=>b-a);
 r = r.slice(0,5);
 localStorage.setItem("rank",JSON.stringify(r));
}

function showRanking(){
 let r = JSON.parse(localStorage.getItem("rank")) || [];
 alert("🏆ランキング\n" + r.map((s,i)=>`${i+1}位: ${s}`).join("\n"));
}
