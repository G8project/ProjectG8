"use strict";

const BLACK = 1,
      WHITE = -1;
let data = [];
let turn = true;
const board = document.getElementById("board");
const h2 = document.querySelector("h2");
const counter = document.getElementById("counter");
let cells = 6; // マスの数

// 現在のターン数-1を保存する変数
let turnNum = 0;
// 盤面を保存する配列
let bann = [];
// 罰ゲームの内容を格納する配列
let batu = [];
// 罰ゲームの場所を保存する配列
let batuxy = [];
// そのターンに置いた罰ゲームの場所を記録
let batuturn = [];
// パスしたターンを記録
let pussturn = [];
// 今置いた石の場所を保存するためのx,y
let nowx = 0,
    nowy = 0;

// 画面が読み込めた時に盤を形成
window.onload = () => {
    init();
    modal.classList.add("hide");
}

// 初期化
function init() {
    for (let i = 0; i < cells; i++) {
        const tr = document.createElement("tr");
        data[i] = Array(cells).fill(0);
        batu[i] = Array(cells).fill(0);
        for (let j = 0; j < cells; j++) {
            const td = document.createElement("td");
            const disk = document.createElement("div");
            const pp = document.createElement("p");
            tr.appendChild(td);
            td.appendChild(disk);
            disk.appendChild(pp);
            td.className = "cell";
            td.onclick = clicked;
        }
        board.appendChild(tr);
    }
    for (let i = 0; i < 33; i++){
      bann[i] = Array(cells).fill(0);
      batuxy[i] = Array(cells).fill(0);
      for (let j = 0; j < cells; j++){
          bann[i][j] = Array(cells).fill(0);
          batuxy[i][j] = Array(cells).fill(0);
      }
    }
    // マスの数によって石の初期配置を変える
    switch (cells) {
        case 6:
            board.classList.add("cell-6");
            putDisc(2, 2, WHITE);
            putDisc(3, 3, WHITE);
            putDisc(2, 3, BLACK);
            putDisc(3, 2, BLACK);
            board.rows[2].cells[1].firstChild.firstChild.className = "canPut";
            board.rows[2].cells[1].firstChild.firstChild.textContent = "・";
            board.rows[1].cells[2].firstChild.firstChild.className = "canPut";
            board.rows[1].cells[2].firstChild.firstChild.textContent = "・";
            board.rows[4].cells[3].firstChild.firstChild.className = "canPut";
            board.rows[4].cells[3].firstChild.firstChild.textContent = "・";
            board.rows[3].cells[4].firstChild.firstChild.className = "canPut";
            board.rows[3].cells[4].firstChild.firstChild.textContent = "・";
            break;
        case 8:
            putDisc(3, 3, WHITE);
            putDisc(4, 4, WHITE);
            putDisc(3, 4, BLACK);
            putDisc(4, 3, BLACK);
    }
    showTurn();
    hozonn();
}


// 石を描画
function putDisc(x, y, color) {
    board.rows[y].cells[x].firstChild.className =
        color === BLACK ? "black" : "white";
    board.rows[y].cells[x].animate(
        { opacity: [0.4, 1] },
        { duration: 700, fill: "forwards" }
    );
    data[y][x] = color;
    //置いた石に罰ゲームのマークを印字
    if(x == nowx && y == nowy){
        board.rows[y].cells[x].firstChild.firstChild.textContent = "罰";
        if(turn != true){
            board.rows[y].cells[x].firstChild.firstChild.className = "black2";
        }
    };
}

// 手番などの表示
function showTurn() {
  h2.textContent = turn ? "黒の番です" : "白の番です";
  let numWhite = 0,
      numBlack = 0,
      numEmpty = 0;
  for (let x = 0; x < cells; x++) {
    for (let y = 0; y < cells; y++) {
      if (data[x][y] === WHITE) {
        numWhite++;
      }
      if (data[x][y] === BLACK) {
        numBlack++;
      }
      if (data[x][y] === 0) {
        numEmpty++;
      }
    }
  }
  document.getElementById("numBlack").textContent = numBlack;
  document.getElementById("numWhite").textContent = numWhite;

  let blacDisk = checkReverse(BLACK);
  let whiteDisk = checkReverse(WHITE);

  if (numWhite + numBlack === cells * cells || (!blacDisk && !whiteDisk)) {
    const h5 = document.querySelector("h5");
  if (numBlack > numWhite) {
    document.getElementById("numBlack").textContent = numBlack;
    h2.textContent = "黒の勝ち!!";
    document.getElementById("end").textContent="ゲーム終了：黒の勝ち";
    h5.textContent = "白は角の罰ゲーム☠";
  } else if (numBlack < numWhite) {
    document.getElementById("numWhite").textContent = numWhite;
    h2.textContent = "白の勝ち!!";
    document.getElementById("end").textContent="ゲーム終了：白の勝ち";
    h5.textContent = "黒は角の罰ゲーム☠";
  } else {
    h2.textContent = "引き分け";
    document.getElementById("end").textContent="ゲーム終了：引き分け";
    document.getElementById('endB1').textContent = "";
    document.getElementById('endB2').textContent = "";
    document.getElementById('endB3').textContent = "";
    document.getElementById('endB4').textContent = "";
  }
    hideForm();
    document.getElementById('overlay').style.display = 'block';
    restartBtn();
    showAnime();
  return;
  }
  if (!blacDisk && turn) {
    document.getElementById("puss").textContent = "黒はパスです";
    hideForm();
    showAlertP();
    h2.textContent = "黒はパスです";
    showAnime();
    turn = !turn;
    pussturn[turnNum] = 1;
    setTimeout(showTurn, 2000);
    return;
  }
  if (!whiteDisk && !turn) {
    document.getElementById("puss").textContent = "白はパスです";
    hideForm();
    showAlertP();
    h2.textContent = "白はパスです";
    showAnime();
    turn = !turn;
    pussturn[turnNum] = 1;
    setTimeout(showTurn, 2000);
    return;
  }
}

// マスがクリックされた時の処理
function clicked() {
  const color = turn ? BLACK : WHITE;
  const y = this.parentNode.rowIndex;
  const x = this.cellIndex;
  // 今置いた場所を次に置くまで保存
  nowx = x;
  nowy = y;
  // マスに置けるかチェック
  if (data[y][x] !== 0) {
    return;
  }
  const result = checkPut(x, y, color);

  if (result.length > 0) {
   // 罰ゲーム入力フォーム表示関数を実行
   showForm();
   // 置けるマークをクリア
   for (let i = 0; i < cells; i++) {
     for (let j = 0; j < cells; j++) {
       if(board.rows[j].cells[i].firstChild.firstChild.className == "canPut"){
         board.rows[j].cells[i].firstChild.firstChild.className = "";
         board.rows[j].cells[i].firstChild.firstChild.textContent = "";
       }
     }
   }
   result.forEach((value) => {
     putDisc(value[0], value[1], color);
     // ひっくり返したとき罰ゲームがあったら罰ゲームアラート表示
     if(batu[value[0]][value[1]] !== 0){
       //入力フォームをいったん削除・アラート表示
       hideForm();
       showAlertB(value[0], value[1])
       //罰ゲームの内容を消す
       batu[value[0]][value[1]] = 0;
       //罰ゲームマークを消す
       board.rows[value[1]].cells[value[0]].firstChild.firstChild.textContent = "";
       //罰ゲーム一覧から消す
       document.getElementById(value[0]*10+value[1]).style.display = "none";
     }
     else{
       let blacDisk = checkReverse(BLACK);
       let whiteDisk = checkReverse(WHITE);
       if (numWhite + numBlack === cells * cells || (!blacDisk && !whiteDisk)) {
         showAlertE();
         if (document.getElementById("batu-gameAlert").style.display == "block"){
             hideAlertE();
             document.getElementById('overlay').style.display = 'block';
         }
       }
     }
   });
   // 相手のターンに変える
   turn = !turn;
   turnNum++;
 }
  showTurn();
   // 盤面を保存
   hozonn();
   // 次のターンにおける場所をチェック
   const color2 = turn ? BLACK : WHITE;
   for (let i = 0; i < cells; i++) {
     for (let j = 0; j < cells; j++) {
       const result2 = checkPut(i, j, color2);
       if (result2.length > 0) {
        board.rows[j].cells[i].firstChild.firstChild.className = "canPut";
        board.rows[j].cells[i].firstChild.firstChild.textContent = "・";
        }
      }
    }
}

// 置いたマスの周囲8方向をチェック
function checkPut(x, y, color) {
  let dx, dy;
  const opponentColor = color == BLACK ? WHITE : BLACK;
  let tmpReverseDisk = [];
  let reverseDisk = [];
  // 周囲8方向を調べる配列
  const direction = [
    [-1, 0], // 左
    [-1, 1], // 左下
    [0, 1], // 下
    [1, 1], // 右下
    [1, 0], // 右
    [1, -1], // 右上
    [0, -1], // 上
    [-1, -1], // 左上
  ];

  // すでに置いてある
  if (data[y][x] === BLACK || data[y][x] === WHITE) {
    return [];
  }
  // 置いた石の周りに違う色の石があるかチェック
  for (let i = 0; i < direction.length; i++) {
    dx = direction[i][0] + x;
    dy = direction[i][1] + y;
    if (
      dx >= 0 &&
      dy >= 0 &&
      dx <= cells - 1 &&
      dy <= cells - 1 &&
      opponentColor === data[dy][dx]
    ) {
      tmpReverseDisk.push([x, y]);
      tmpReverseDisk.push([dx, dy]);
      // 裏返せるかチェック
      while (true) {
        dx += direction[i][0];
        dy += direction[i][1];
        if (
          dx < 0 ||
          dy < 0 ||
          dx > cells - 1 ||
          dy > cells - 1 ||
          data[dy][dx] === 0
        ) {
          tmpReverseDisk = [];
          break;
        }
        if (opponentColor === data[dy][dx]) {
          tmpReverseDisk.push([dx, dy]);
        }
        if (color === data[dy][dx]) {
          reverseDisk = reverseDisk.concat(tmpReverseDisk);
          tmpReverseDisk = [];
          break;
        }
      }
    }
  }
  return reverseDisk;
}

// 裏返せる場所があるか確認
function checkReverse(color) {
  for (let x = 0; x < cells; x++) {
    for (let y = 0; y < cells; y++) {
      const result = checkPut(x, y, color);
      console.log(result);
      if (result.length > 0) {
        return true;
      }
    }
  }
  return false;
}

// ゲーム終了画面
function restartBtn() {
  const restartBtn = document.getElementById("restartBtn");
  restartBtn.classList.remove("hide");
  restartBtn.animate(
    { opacity: [1, 0.5, 1] },
    { delay: 2000, duration: 3000, iterations: "Infinity" }
  );

  restartBtn.addEventListener("click", () => {
    document.location.reload();
  });
}

function showAnime() {
  h2.animate({ opacity: [0, 1] }, { duration: 500, iterations: 4 });
}


// ここから自分達で書いたコード

// パスカスタムアラート表示
  function showAlertP() {
    document.getElementById('pussAlert').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
  }
  // パスカスタムアラート非表示
  function hideAlertP() {
    document.getElementById('pussAlert').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    showForm();
  }
  
  // 終了カスタムアラート表示
  function showAlertE() {
     // ゲーム終了アラートの内容を変更
    if(batu[0][0]!=0){
      document.getElementById('endB1').textContent = batu[0][0];
    }
    if(batu[0][5]!=0){
      document.getElementById('endB2').textContent = batu[0][5];
    }
    if(batu[5][0]!=0){
      document.getElementById('endB3').textContent = batu[5][0];
    }
    if(batu[5][5]!=0){
      document.getElementById('endB4').textContent = batu[5][5];
    }
    document.getElementById('endAlert').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';  
  }
  // 終了カスタムアラート非表示
  function hideAlertE() {
    document.getElementById('endAlert').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
  }
  
  // 罰ゲームカスタムアラート表示
  function showAlertB(x, y) {
    document.getElementById('batu').textContent = batu[x][y];
    document.getElementById('batu-gameAlert').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
  }
  // 罰ゲームカスタムアラート非表示
  function hideAlertB(){
    document.getElementById('batu-gameAlert').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    let blacDisk = checkReverse(BLACK);
    let whiteDisk = checkReverse(WHITE);
    let hide = document.getElementById("pussAlert");
    if (numWhite + numBlack === cells * cells || (!blacDisk && !whiteDisk)) {
        // ゲーム終了アラートを表示
        showAlertE();
    }
    else{
        if (hide.style.display != 'block') {
            showForm();
        }
        else{
            document.getElementById('overlay').style.display = 'block';
        }
    }
  }
  

  // 罰ゲーム入力フォーム表示
  function showForm() {
    document.getElementById('form').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';

    }
    // 罰ゲーム入力フォーム非表示
  function hideForm() {
    document.getElementById('form').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
  }

document.querySelector('form').addEventListener('submit', function(event) {
  // デフォルトのフォーム送信をキャンセル
  event.preventDefault();
  // フォームデータを取得
  let formB = document.getElementById("name");
  batu[nowx][nowy] = formB.value;

  var alphabet = ['A', 'B', 'C', 'D', 'E', 'F'];
  var X = alphabet[nowx];
  var Y = nowy+1;
  var itirann = document.getElementById("itirann");
  var newElement = document.createElement("h3");
  itirann.appendChild(newElement);
  newElement.textContent = X+Y+" "+formB.value;
  newElement.className = "black3";
  newElement.id = nowx*10 + nowy;
  batuturn[turnNum] =  nowx*10 + nowy;

  // 入力した罰ゲームを消去
  formB.value = "";
  // 入力フォームを非表示
  hideForm();

      // 罰マークに触れたときに対応する罰ゲームをアニメーション付きで強調表示
      let targetxy = nowx*10+nowy;
      let escapedId = CSS.escape(targetxy);// idが数字オンリーだとうまく動かないのでそれを回避
      const target = document.querySelector("#" + escapedId);
      target.style.backgroundColor = 'lightblue';
  
      board.rows[nowy].cells[nowx].addEventListener('mouseenter', () => {
          target.style.backgroundColor = 'orange';
          target.animate({ opacity: [0, 1] }, { duration: 500, iterations: 3 });
      }); // カーソルがあった時のイベントリスナ
  
      board.rows[nowy].cells[nowx].addEventListener('mouseleave', () => {
          target.style.backgroundColor = 'lightblue';
      }); // カーソルが離れたときのイベントリスナー
});

// 一手戻す処理
function turnReverse(){
  if(turnNum == 0){
      return;
  }
  turn = !turn;
  // 盤面をクリア
  const restartBtn = document.getElementById("restartBtn");
  restartBtn.classList.add("hide");
  for (let i = 0; i < cells; i++) {
      for (let j = 0; j < cells; j++) {
          if(board.rows[j].cells[i].firstChild.firstChild.className == "canPut"){
          board.rows[j].cells[i].firstChild.firstChild.className = "";
          board.rows[j].cells[i].firstChild.firstChild.textContent = "";
          }
          board.rows[j].cells[i].firstChild.className = "";
          board.rows[j].cells[i].firstChild.firstChild.textContent = "";
          data[j][i] = 0;
      }
  }
  if(pussturn[turnNum] == 1){
    turn = !turn;
  }

  let a = Math.floor(batuturn[turnNum] / 10);
  let b = batuturn[turnNum] % 10;
  batu[a][b] = 0;
  let escapedId = CSS.escape(batuturn[turnNum]);// idが数字オンリーだとうまく動かないのでそれを回避
  const target = document.querySelector("#" + escapedId);
  target.remove();

  // ひとつ前のターンの盤面を生成
  turnNum = turnNum-1;
  for (let i = 0; i < cells; i++) {
      for (let j = 0; j < cells; j++) {
          if(bann[turnNum][j][i] == BLACK){
              board.rows[j].cells[i].firstChild.className = "black";
              data[j][i] = BLACK;
          }
          if(bann[turnNum][j][i] == WHITE){
              board.rows[j].cells[i].firstChild.className = "white";
              data[j][i] = WHITE;
          }
          if(batuxy[turnNum][j][i] == 1){
              board.rows[j].cells[i].firstChild.firstChild.textContent = "罰";
              document.getElementById(i*10+j).style.display = "";
              let b = document.getElementById(i*10+j).textContent;
              batu[i][j] = b.substring(3);
          }
      }
  }
  showTurn();

  // 次のターンにおける場所をチェック
  const color3 = turn ? BLACK : WHITE;
  for (let i = 0; i < cells; i++) {
      for (let j = 0; j < cells; j++) {
          const result3 = checkPut(i, j, color3);
          if (result3.length > 0) {
          board.rows[j].cells[i].firstChild.firstChild.className = "canPut";
          board.rows[j].cells[i].firstChild.firstChild.textContent = "・";
          }
      }
  }
}

function hozonn(){
  for (let i = 0; i < cells; i++) {
      for (let j = 0; j < cells; j++) {
          if(board.rows[j].cells[i].firstChild.className == "black"){
            bann[turnNum][j][i] = BLACK;
          }
          else{
            if(board.rows[j].cells[i].firstChild.className == "white"){
              bann[turnNum][j][i] = WHITE;
            }
            else{
              bann[turnNum][j][i] = 0;
            }
          }
          if(board.rows[j].cells[i].firstChild.firstChild.textContent == "罰"){
            batuxy[turnNum][j][i] = 1;
          }
          else{
            batuxy[turnNum][j][i] = 0;
          }
      }
  }
}

