// ===== 単語 =====
const words=["ねこ","いぬ","りんご","しゃしん","しゅくだい","えんぴつ","ぷろぐらみんぐ","こんぴゅーたー"];

// ===== ローマ字辞書（省略せずフル） =====
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
 "ん":["n","nn","xn"],
 "が":["ga"],"ぎ":["gi"],"ぐ":["gu"],"げ":["ge"],"ご":["go"],
 "ざ":["za"],"じ":["ji","zi"],"ず":["zu"],"ぜ":["ze"],"ぞ":["zo"],
 "だ":["da"],"で":["de"],"ど":["do"],
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

  if(c==="っ"){
    let next=romaMap[kana[i+1]]||[""];
    let temp=[];
    res.forEach(r=>{
      next.forEach(n=>temp.push(r+n[0]));
    });
    res=temp;
    continue;
  }

  if(c==="ー"){
    let temp=[];
    res.forEach(r=>{
      let last=r.slice(-1);
      if("aeiou".includes(last)) temp.push(r+last);
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

// ===== ゲーム =====
let current={},display="";
let score=0,combo=0,time=30,level=1,timer;

const input=document.getElementById("input");
const jp=document.getElementById("jpWord");
const roma=document.getElementById("romaWord");

document.addEventListener("keydown",e=>{
 if(e.code==="Space"){startGame();}
});

function startGame(){
 score=0;combo=0;time=30;level=1;
 input.disabled=false;
 input.value="";
 input.focus();
 nextWord();
 updateUI();
 clearInterval(timer);
 timer=setInterval(updateTime,1000);
}

function nextWord(){
 let k=words[Math.floor(Math.random()*words.length)];
 let p=kanaToRoma(k);
 current={kana:k,patterns:p};
 display=p[0];
 jp.textContent=k;
 roma.innerHTML=display;
}

input.addEventListener("input",()=>{
 let val=input.value.toLowerCase();

 let valid=current.patterns.filter(p=>p.startsWith(val));

 if(valid.length>0){
   display=valid[0];
   roma.innerHTML=display;

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

// ===== タイマー =====
function updateTime(){
 time--;
 if(time<=0){
   endGame();
 }
 updateUI();
}

function endGame(){
 clearInterval(timer);
 input.disabled=true;
 saveScore(score);
 loadRanking();
 jp.textContent="ゲーム終了！";
}

// ===== ランキング =====
function saveScore(s){
 let data=JSON.parse(localStorage.getItem("rank")||"[]");
 data.push(s);
 data.sort((a,b)=>b-a);
 data=data.slice(0,5);
 localStorage.setItem("rank",JSON.stringify(data));
}

function loadRanking(){
 let data=JSON.parse(localStorage.getItem("rank")||"[]");
 let list=document.getElementById("ranking");
 list.innerHTML="";
 data.forEach(d=>{
   let li=document.createElement("li");
   li.textContent=d;
   list.appendChild(li);
 });
}

loadRanking();

// ===== UI =====
function updateUI(){
 document.getElementById("score").textContent=score;
 document.getElementById("combo").textContent=combo;
 document.getElementById("level").textContent=level;
 document.getElementById("time").textContent=time;
}
