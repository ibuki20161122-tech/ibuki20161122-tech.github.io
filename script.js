// =====================
// 単語
// =====================
const words = [
  "ねこ","いぬ","ほん","やま","かわ",
  "りんご","すし","てんき","かぞく","ともだち",
  "しゃしん","じてんしゃ","がっこう","きょう","しゅくだい",
  "びょういん","えんぴつ","けしごむ","でんしゃ","せんせい",
  "ゆうえんち","どうぶつえん","しんかんせん","としょかん",
  "ぷろぐらみんぐ","こんぴゅーたー","いんたーねっと","すーぱー"
];

// =====================
// ローマ字マップ
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
 "ー":["-"],
 "が":["ga"],"ぎ":["gi"],"ぐ":["gu"],"げ":["ge"],"ご":["go"],
 "ざ":["za"],"じ":["ji","zi"],"ず":["zu"],"ぜ":["ze"],"ぞ":["zo"],
 "ば":["ba"],"び":["bi"],"ぶ":["bu"],"べ":["be"],"ぼ":["bo"]
};

const digraph = {
 "しゃ":["sha","sya"],"しゅ":["shu","syu"],"しょ":["sho","syo"],
 "きゃ":["kya"],"きゅ":["kyu"],"きょ":["kyo"],
 "ちゃ":["cha","tya","cya"],"ちゅ":["chu","tyu","cyu"],"ちょ":["cho","tyo","cyo"],
 "びゃ":["bya"],"びゅ":["byu"],"びょ":["byo"]
};

// =====================
// 音
// =====================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTypeSound(){
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "square";
  osc.frequency.value = 500;

  gain.gain.value = 0.05;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.05);
}

// =====================
// 振動
// =====================
function vibrate(){
  if(navigator.vibrate){
    navigator.vibrate(20);
  }
}

// =====================
// かな→ローマ字
// =====================
function kanaToRoma(kana){
 let res=[""];

 for(let i=0;i<kana.length;i++){
  let c=kana[i];

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

  if(c==="ー"){
    let temp=[];
    res.forEach(r=>{
      let last=r.slice(-1);
      if("aeiou".includes(last)){
        temp.push(r+last);
      }
      temp.push(r+"-");
    });
    res=temp;
    continue;
  }

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
// マッチ選択（改良版）
// =====================
function getBestMatch(patterns, input){
 return patterns.sort((a,b)=>{
   return matchScore(a,input)-matchScore(b,input);
 })[0];
}

function matchScore(p,input){
 let score = Math.abs(p.length-input.length);

 let match=0;
 for(let i=0;i<input.length;i++){
   if(p[i]===input[i]) match++;
 }
 score -= match*2;

 if(p.includes("xn")) score+=5;
 return score;
}

// =====================
// 変数
// =====================
let current={}, currentDisplay="";
let score=0, combo=0, time=30, level=1, timer;

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
 score=0; combo=0; time=30; level=1;

 input.disabled=false;
 input.value="";
 input.focus();

 nextWord();
 updateUI();

 clearInterval(timer);
 timer=setInterval(updateTime,1000);
}

// =====================
// 次の単語
// =====================
function nextWord(){
 let k=words[Math.floor(Math.random()*words.length)];
 let patterns=kanaToRoma(k);

 current={kana:k,patterns};

 currentDisplay=getBestMatch(patterns,"");

 jp.textContent=k;
 roma.innerHTML=`<span class="remaining">${currentDisplay}</span>`;
}

// =====================
// 入力
// =====================
input.addEventListener("input",()=>{
 let val=input.value.toLowerCase();

 playTypeSound();
 vibrate();

 let valid=current.patterns.filter(p=>p.startsWith(val));

 if(valid.length===0 && val.endsWith("n")) return;

 if(valid.length>0){

   let match=getBestMatch(valid,val);
   currentDisplay=match;

   showColored(val,currentDisplay);

   if(valid.includes(val) || valid.some(p=>p===val+"-")){
     combo++;

     let add=10+combo*2;
     if(current.kana.length>=6){
       add+=10;
       showEffect("💥 BONUS!");
     }

     score+=add;

     updateLevel();
     popEffect();

     input.value="";
     nextWord();
   }

 }else{
   combo=0;
   input.value=val.slice(0,-1);
 }

 updateUI();
});

// =====================
// 表示
// =====================
function showColored(inputStr,correct){
 let html="";
 let gold=combo>=10;

 for(let i=0;i<correct.length;i++){
  if(i<inputStr.length){
    if(inputStr[i]===correct[i]){
      html+=`<span class="${gold?"gold":"correct"}">${correct[i]}</span>`;
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
 let el=document.createElement("div");
 el.textContent="✨ "+combo;
 el.style.position="fixed";
 el.style.left=(40+Math.random()*20)+"%";
 el.style.top=(30+Math.random()*20)+"%";
 el.style.color="#00e676";

 document.body.appendChild(el);

 setTimeout(()=>{el.style.opacity=0},300);
 setTimeout(()=>el.remove(),500);
}

function showEffect(t){
 let el=document.createElement("div");
 el.textContent=t;
 el.style.position="fixed";
 el.style.left="50%";
 el.style.top="25%";
 el.style.transform="translate(-50%,-50%)";
 el.style.color="gold";

 document.body.appendChild(el);

 setTimeout(()=>el.remove(),700);
}

// =====================
// レベル
// =====================
function updateLevel(){
 let newL=Math.floor(score/100)+1;
 if(newL>level){
   level=newL;
   time+=3;
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
// UI
// =====================
function updateUI(){
 document.getElementById("score").textContent=score;
 document.getElementById("combo").textContent=combo;
 document.getElementById("level").textContent=level;
 document.getElementById("time").textContent=time;
}
