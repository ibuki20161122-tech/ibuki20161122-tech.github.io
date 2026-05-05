// =====================
// 単語
// =====================
const words = [
  "ねこ","いぬ","ほん","やま","かわ",
  "りんご","すし","てんき","かぞく","ともだち",
  "しゃしん","じてんしゃ","がっこう","きょう","しゅくだい",
  "びょういん","えんぴつ","けしごむ","でんしゃ","せんせい",
  "ゆうえんち","どうぶつえん","しんかんせん","としょかん",
  "ぷろぐらみんぐ","こんぴゅーたー","いんたーねっと"
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
 "わ":["wa"],"を":["wo"],
 "ん":["n","nn","xn","n'"],
 "が":["ga"],"ぎ":["gi"],"ぐ":["gu"],"げ":["ge"],"ご":["go"],
 "ざ":["za"],"じ":["ji","zi"],"ず":["zu"],"ぜ":["ze"],"ぞ":["zo"],
 "ば":["ba"],"び":["bi"],"ぶ":["bu"],"べ":["be"],"ぼ":["bo"]
};

// 拗音
const digraph = {
 "しゃ":["sha","sya"],"しゅ":["shu","syu"],"しょ":["sho","syo"],
 "きゃ":["kya"],"きゅ":["kyu"],"きょ":["kyo"],
 "ちゃ":["cha","tya","cya"],"ちゅ":["chu","tyu","cyu"],"ちょ":["cho","tyo","cyo"],
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
      temp.push(r+"ltu");
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
// 自然なローマ字選択
// =====================
function getBestPattern(list){
 return list.sort((a,b)=>scorePattern(a)-scorePattern(b))[0];
}

function scorePattern(str){
 let score = 0;
 score += str.length;
 if(str.includes("xn")) score += 5;
 if(str.includes("xtu")) score += 3;
 if(str.includes("ltu")) score += 3;
 if(str.includes("si")) score += 1;
 if(str.includes("ti")) score += 1;
 if(str.includes("tu")) score += 1;
 return score;
}

// =====================
// 変数
// =====================
let current = {};
let currentDisplay = "";
let score = 0;
let combo = 0;
let time = 30;
let level = 1;
let timer;

// DOM
const input = document.getElementById("input");
const jp = document.getElementById("jpWord");
const roma = document.getElementById("romaWord");

// =====================
// スタート
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
 time=30;
 level=1;

 input.disabled=false;
 input.value="";
 input.focus();

 nextWord();
 updateUI();

 clearInterval(timer);
 timer = setInterval(updateTime,1000);
}

// =====================
// 次の単語
// =====================
function nextWord(){
 let k = words[Math.floor(Math.random()*words.length)];
 let patterns = kanaToRoma(k);

 current = {kana:k, patterns};

 currentDisplay = getBestPattern(patterns);

 jp.textContent = k;
 roma.innerHTML = `<span class="remaining">${currentDisplay}</span>`;
}

// =====================
// 入力処理（神機能）
// =====================
input.addEventListener("input",()=>{
 let val = input.value.toLowerCase();

 let validPatterns = current.patterns.filter(p => p.startsWith(val));

 // 「ん」途中許可
 if(validPatterns.length === 0 && val.endsWith("n")){
   return;
 }

 if(validPatterns.length > 0){

   // ⭐プレイヤーに合わせる
   let match = validPatterns.find(p => p.startsWith(val));
   if(match){
     currentDisplay = match;
   }

   showColored(val, currentDisplay);

   if(validPatterns.includes(val)){
     combo++;

     let add = 10 + combo * 2;

     if(current.kana.length >= 6){
       add += 10;
       showEffect("💥 BONUS!");
     }

     score += add;

     updateLevel();
     popEffect();

     input.value="";
     nextWord();
   }

 }else{
   combo = 0;
   input.value = val.slice(0,-1);
 }

 updateUI();
});

// =====================
// 色表示（コンボで金）
// =====================
function showColored(inputStr,correct){
 let html="";
 const isGold = combo >= 10;

 for(let i=0;i<correct.length;i++){
  if(i<inputStr.length){
    if(inputStr[i]===correct[i]){
      html+=`<span class="${isGold ? 'gold' : 'correct'}">${correct[i]}</span>`;
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
// ランダムエフェクト
// =====================
function popEffect(){
  const el = document.createElement("div");

  el.textContent = "✨ " + combo;
  el.style.position = "fixed";
  el.style.left = (40 + Math.random()*20) + "%";
  el.style.top = (30 + Math.random()*20) + "%";
  el.style.fontSize = "30px";
  el.style.color = "#00e676";
  el.style.pointerEvents = "none";

  document.body.appendChild(el);

  setTimeout(()=>{
    el.style.transition="0.5s";
    el.style.opacity="0";
    el.style.top = "20%";
  },10);

  setTimeout(()=>el.remove(),500);
}

// =====================
// テキストエフェクト
// =====================
function showEffect(text){
  const el = document.createElement("div");

  el.textContent = text;
  el.style.position = "fixed";
  el.style.left = "50%";
  el.style.top = "25%";
  el.style.transform = "translate(-50%,-50%)";
  el.style.fontSize = "35px";
  el.style.color = "#ffd700";

  document.body.appendChild(el);

  setTimeout(()=>el.style.opacity="0",500);
  setTimeout(()=>el.remove(),800);
}

// =====================
// レベル
// =====================
function updateLevel(){
 let newLevel = Math.floor(score / 100) + 1;

 if(newLevel > level){
   level = newLevel;
   time += 3;
   showEffect("LEVEL UP!");
 }
}

// =====================
// タイマー
// =====================
function updateTime(){
 time--;
 if(time<=0) endGame();
 updateUI();
}

function endGame(){
 clearInterval(timer);
 input.disabled=true;
 jp.textContent="ゲーム終了！";
}

// =====================
// UI更新
// =====================
function updateUI(){
 document.getElementById("score").textContent = score;
 document.getElementById("combo").textContent = combo;
 document.getElementById("level").textContent = level;
 document.getElementById("time").textContent = time;
}
