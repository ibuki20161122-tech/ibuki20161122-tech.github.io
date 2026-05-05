const title = document.getElementById("titleScreen");
const game = document.getElementById("gameScreen");
const result = document.getElementById("result");

const jp = document.getElementById("jpWord");
const roma = document.getElementById("romaWord");
const input = document.getElementById("input");

let score = 0;
let combo = 0;
let time = 30;
let timer;

const words = [
"ねこ","いぬ","すし","やま","かわ",
"りんご","でんしゃ","がっこう",
"しゅくだい","せんせい",
"ぷろぐらみんぐ"
];

let current = "";

/* スペースで開始（絶対動く版） */
document.addEventListener("keydown",(e)=>{
  if(e.code === "Space"){
    e.preventDefault();
    startGame();
  }
});

/* ゲーム開始 */
function startGame(){

  if(!game.classList.contains("hidden")) return;

  title.classList.add("hidden");
  game.classList.remove("hidden");

  score = 0;
  combo = 0;
  time = 30;

  input.disabled = false;
  input.value = "";
  input.focus();

  nextWord();

  clearInterval(timer);
  timer = setInterval(updateTime,1000);
}

/* 単語 */
function nextWord(){
  current = words[Math.floor(Math.random()*words.length)];
  jp.textContent = current;
  roma.textContent = "typing...";
}

/* 入力 */
input.addEventListener("input",()=>{

  let val = input.value;

  if(val.length > 0){
    combo++;
    score += 10 + combo;

    input.value = "";
    nextWord();
  }else{
    combo = 0;
  }

  updateUI();
});

/* UI */
function updateUI(){
 document.getElementById("score").textContent = score;
 document.getElementById("combo").textContent = combo;
 document.getElementById("time").textContent = time;
}

/* タイマー */
function updateTime(){
 time--;

 if(time <= 0){
  endGame();
 }

 updateUI();
}

/* 終了 */
function endGame(){
 clearInterval(timer);

 game.classList.add("hidden");
 result.classList.remove("hidden");

 document.getElementById("finalScore").textContent = "Score: " + score;
}
