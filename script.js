// ===== 単語 =====
const words = ["りんご","かんじ","びょういん","がっこう","しゃしん"];

// ===== ローマ字 =====
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
      temp.push(r+"xtu");
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
let current={},score=0,time=30,combo=0;
const input=document.getElementById("input");
const jp=document.getElementById("jpWord");
const roma=document.getElementById("romaWord");
const effect=document.getElementById("effect");

document.addEventListener("keydown",e=>{
 if(e.code==="Space"){e.preventDefault();startGame();}
});

function startGame(){
 score=0;time=30;combo=0;
 input.disabled=false;
 input.value="";
 input.focus();
 nextWord();
}

function nextWord(){
 let k=words[Math.floor(Math.random()*words.length)];
 let p=kanaToRoma(k);
 current={kana:k,patterns:p};
 jp.textContent=k;
 roma.innerHTML=`<span class="remaining">${p[0]}</span>`;
}

input.addEventListener("input",()=>{
 let val=input.value.toLowerCase();

 let p=current.patterns.find(x=>x.startsWith(val));

 if(p){
   showColored(val,p);

   if(p===val){
     combo++;
     score+=10;
     popEffect();
     input.value="";
     nextWord();
   }
 }else{
   combo=0;
   input.value="";
 }
});

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

function popEffect(){
 effect.textContent="✨";
 effect.style.opacity=1;
 setTimeout(()=>effect.style.opacity=0,300);
}
