"use strict";

const BLACK = 1,
      WHITE = -1;
let data = [];
let turn = true;
const board = document.getElementById("board");
const h2 = document.querySelector("h2");
const counter = document.getElementById("counter");
let cells = 8; // マスの数

// 罰ゲームの内容を格納する配列
let batu = [];
// 今置いた石の場所を保存するためのx,y
let nowx = 0,
    nowy = 0;

// 画面が読み込めた時に盤を形成
window.onload = () => {
    init();
    modal.classList.add("hide");
}

function start6() {
    cells = 6;
    turn = true;
    board.innerHTML = "";
    init();
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
            tr.appendChild(td);
            td.appendChild(disk);
            td.className = "cell";
            td.onclick = clicked;
        }
        board.appendChild(tr);
    }
    // マスの数によって石の初期配置を変える
    switch (cells) {
        case 6:
            board.classList.add("cell-6");
            putDisc(2, 2, WHITE);
            putDisc(3, 3, WHITE);
            putDisc(2, 3, BLACK);
            putDisc(3, 2, BLACK);
            break;
        case 8:
            putDisc(3, 3, WHITE);
            putDisc(4, 4, WHITE);
            putDisc(3, 4, BLACK);
            putDisc(4, 3, BLACK);
    }
    showTurn();
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
    if (numBlack > numWhite) {
      document.getElementById("numBlack").textContent = numBlack;
      h2.textContent = "黒の勝ち!!";
      showAlertE();
      restartBtn();
      showAnime();
    } else if (numBlack < numWhite) {
      document.getElementById("numWhite").textContent = numWhite;
      h2.textContent = "白の勝ち!!";
      showAlertE();
      restartBtn();
      showAnime();
    } else {
      h2.textContent = "引き分け";
      showAlertE();
      restartBtn();
      showAnime();
    }
    return;
  }
  if (!blacDisk && turn) {
    showAlertP()
    h2.textContent = "黒はパスです";
    showAnime();
    turn = !turn;
    setTimeout(showTurn, 2000);
    return;
  }
  if (!whiteDisk && !turn) {
    showAlertP()
    h2.textContent = "白はパスです";
    showAnime();
    turn = !turn;
    setTimeout(showTurn, 2000);
    return;
  }
}

// マスがクリックされた時の処理
function clicked() {
  const color = turn ? BLACK : WHITE;
  const y = this.parentNode.rowIndex;
  const x = this.cellIndex;
  // マスに置けるかチェック
  if (data[y][x] !== 0) {
    return;
  }
  const result = checkPut(x, y, color);
  if (result.length > 0) {
    result.forEach((value) => {
      putDisc(value[0], value[1], color);
      // ひっくり返したとき罰ゲームがあったら罰ゲームアラート表示
      if(batu[value[0]][value[1]] !== 0){
        showAlertB(value[0], value[1])
        //罰ゲームの内容を消す
        batu[value[0]][value[1]] = 0;
      }
    });
    // 今置いた場所を次に置くまで保存し、罰ゲーム入力フォーム表示関数を実行
    nowx = x;
    nowy = y;
    showForm();
    // 相手のターンに変える
    turn = !turn;
  }
  showTurn();
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
  }
  
  // 終了カスタムアラート表示
  function showAlertE() {
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
    document.getElementById('batu-game').textContent = batu[x][y];
    document.getElementById('batu-gameAlert').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
  }
  // 罰ゲームカスタムアラート非表示
  function hideAlertB() {
    document.getElementById('batu-gameAlert').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
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
  console.log(formB.value);
  // 入力した罰ゲームを消去
  formB.value = "";
  // 入力フォームを非表示
  hideForm();
  //罰ゲームマークを駒に印字
  
});