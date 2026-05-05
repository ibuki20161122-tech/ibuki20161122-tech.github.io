// ===== 要素 =====
const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("result");
const input = document.getElementById("input");

const jp = document.getElementById("jpWord");
const roma = document.getElementById("romaWord");

// ===== 初期状態 =====
window.onload = () => {
  input.blur(); // ←超重要（フォーカス外す）
  resultScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");
};

// ===== 単語 =====
const words = ["ねこ","いぬ","すし","りんご","えんぴつ","しゅくだい","ぷろぐらみんぐ"];

// ===== ローマ字 =====
const map = {
 "あ":"a","い":"i","う":"u","え":"e","お":"o",
 "か":"ka","き":"ki","く":"ku","け":"ke","こ":"ko",
 "さ":"sa","し":"shi","す":"su","せ":"se","そ":"so",
 "た":"ta","ち":"chi","つ":"tsu","て":"te","と":"to",
 "な":"na","に":"ni","ぬ":"nu","ね":"ne","の":"no",
 "は":"ha","ひ":"hi","ふ":"fu","へ":"he","ほ":"ho",
 "ま":"ma","み":"mi","む":"mu","め":"me","も":"mo",
 "や":"ya","ゆ":"yu","よ":"yo",
 "ら":"ra","り":"ri","る":"ru","れ":"re","ろ":"ro",
 "わ":"wa","ん":"n"
};

function kanaToRoma(str){
  return str.split("").map(c=>map[c]||"").join("");
}

// ===== ゲーム =====
let score=0,combo=0,time=30;
let current="",display="",timer,lastWord="";

// ===== スペースで開始（最重要修正版）=====
document.addEventListener("keydown",(e)=>{

  // 入力中は無視
  if(document.activeElement === input) return;

  if(e.code==="Space"){
    e.preventDefault();

    if(!titleScreen.classList.contains("hidden")){
      titleScreen.classList.add("hidden");
      gameScreen.classList.remove("hidden");

      startGame();

      setTimeout(()=>input.focus(),100);
    }
  }
});

// ===== 開始 =====
function startGame(){
  score=0;
  combo=0;
  time=30;

  input.disabled=false;
  input.value="";

  nextWord();

  clearInterval(timer);
  timer=setInterval(()=>{
    time--;
    if(time<=0) endGame();
    updateUI();
  },1000);
}

// ===== 次の単語 =====
function nextWord(){
  let w;

  do{
    w = words[Math.floor(Math.random()*words.length)];
  }while(w === lastWord);

  lastWord = w;

  current = kanaToRoma(w);
  display = current;

  jp.textContent = w;
  show("");
}

// ===== 入力 =====
input.addEventListener("input",()=>{
  let val = input.value;

  if(current.startsWith(val)){
    show(val);

    if(val === current){
      score += 10;
      combo++;

      showCombo();

      input.value="";
      nextWord();
    }
  }else{
    combo=0;
    input.value = val.slice(0,-1);
  }

  updateUI();
});

// ===== 表示 =====
function show(val){
  let html="";

  for(let i=0;i<display.length;i++){
    if(i < val.length){
      html += `<span class="correct">${display[i]}</span>`;
    }else{
      html += `<span class="remaining">${display[i]}</span>`;
    }
  }

  roma.innerHTML = html;
}

// ===== コンボ =====
function showCombo(){
  if(combo<2) return;

  let el = document.createElement("div");
  el.className="comboText";
  el.textContent=combo+" COMBO!";

  document.getElementById("comboEffect").appendChild(el);
  setTimeout(()=>el.remove(),500);
}

// ===== 終了 =====
function endGame(){
  clearInterval(timer);
  input.disabled=true;

  document.getElementById("finalScore").textContent="Score: "+score;
  resultScreen.classList.remove("hidden");
}

// ===== 閉じる =====
function closeResult(){
  resultScreen.classList.add("hidden");
  titleScreen.classList.remove("hidden");
  gameScreen.classList.add("hidden");
}

// ===== UI =====
function updateUI(){
  document.getElementById("score").textContent=score;
  document.getElementById("combo").textContent=combo;
  document.getElementById("time").textContent=time;
}
