const VERSION="v2.0.0";
document.getElementById("version").textContent=VERSION;

// ===== 単語 =====
const words=["ねこ","いぬ","りんご","しゅくだい","えんぴつ","ぷろぐらみんぐ","こんぴゅーたー"];

// ===== ローマ字辞書 =====
const romaMap={
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
 "ん":["n","nn"],
 "が":["ga"],"ぎ":["gi"],"ぐ":["gu"],"げ":["ge"],"ご":["go"],
 "ざ":["za"],"じ":["ji","zi"],"ず":["zu"],"ぜ":["ze"],"ぞ":["zo"],
 "ば":["ba"],"び":["bi"],"ぶ":["bu"],"べ":["be"],"ぼ":["bo"],
 "ぱ":["pa"],"ぴ":["pi"],"ぷ":["pu"],"ぺ":["pe"],"ぽ":["po"],
 "ー":["-"]
};

const digraph={
 "しゃ":["sha","sya"],"しゅ":["shu","syu"],"しょ":["sho","syo"],
 "ちゃ":["cha"],"ちゅ":["chu"],"ちょ":["cho"],
 "きゃ":["kya"],"きゅ":["kyu"],"きょ":["kyo"],
 "ぴゃ":["pya"],"ぴゅ":["pyu"],"ぴょ":["pyo"]
};

// ===== 変換 =====
function kanaToRoma(kana){
 let res=[""];
 for(let i=0;i<kana.length;i++){
  let c=kana[i];

  // っ
  if(c==="っ"){
    let next=romaMap[kana[i+1]]||[""];
    let tmp=[];
    res.forEach(r=>{
      next.forEach(n=>tmp.push(r+n[0]));
    });
    res=tmp;
    continue;
  }

  // ん
  if(c==="ん"){
    let next=romaMap[kana[i+1]]||[""];
    let tmp=[];
    res.forEach(r=>{
      next.forEach(n=>{
        tmp.push(r+"n"+n);
        tmp.push(r+"nn"+n);
      });
    });
    res=tmp;
    i++;
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

// ===== ゲーム =====
let current={},display="";
let score=0,combo=0,time=30,level=1,timer;

const input=document.getElementById("input");
const jp=document.getElementById("jpWord");
const roma=document.getElementById("romaWord");

document.addEventListener("keydown",e=>{
 if(e.code==="Space") startGame();
});

function startGame(){
 score=0;combo=0;time=30;level=1;
 input.disabled=false;
 input.value="";
 input.focus();
 nextWord();
 clearInterval(timer);
 timer=setInterval(updateTime,1000);
}

function nextWord(){
 let k=words[Math.floor(Math.random()*words.length)];
 let p=kanaToRoma(k);
 current={kana:k,patterns:p};
 display=p[0];
 jp.textContent=k;
 show("",display);
}

input.addEventListener("input",()=>{
 let val=input.value.toLowerCase();

 let valid=current.patterns.filter(p=>p.startsWith(val));

 if(valid.length>0){
   display=valid[0];
   show(val,display);

   if(valid.includes(val)){
     combo++;
     score+=10+combo*2;
     input.value="";
     nextWord();
   }
 }else{
   combo=0;
   input.value=val.slice(0,-1);
 }

 updateUI();
});

function show(inputStr,correct){
 let html="";
 let gold=combo>=10;

 for(let i=0;i<correct.length;i++){
  let cls="remaining";
  if(i<inputStr.length){
    cls=gold?"gold":"correct";
  }
  html+=`<span class="${cls}">${correct[i]}</span>`;
 }
 roma.innerHTML=html;
}

// タイマー
function updateTime(){
 time--;
 if(time<=0){
   clearInterval(timer);
   input.disabled=true;
   saveScore(score);
   alert("スコア："+score+" / "+VERSION);
 }
 updateUI();
}

// ランキング
function saveScore(s){
 let d=JSON.parse(localStorage.getItem("rank")||"[]");
 d.push(s);
 d.sort((a,b)=>b-a);
 d=d.slice(0,5);
 localStorage.setItem("rank",JSON.stringify(d));
 loadRanking();
}

function loadRanking(){
 let d=JSON.parse(localStorage.getItem("rank")||"[]");
 let list=document.getElementById("ranking");
 list.innerHTML="";
 d.forEach(v=>{
  let li=document.createElement("li");
  li.textContent=v;
  list.appendChild(li);
 });
}
loadRanking();

function updateUI(){
 document.getElementById("score").textContent=score;
 document.getElementById("combo").textContent=combo;
 document.getElementById("time").textContent=time;
 document.getElementById("level").textContent=level;
}
