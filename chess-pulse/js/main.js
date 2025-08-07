let board = null;
let game = new Chess();
let stockfish = new Worker("stockfish.wasm.js");
let theme = "purple";

function onDragStart(source, piece, position, orientation) {
  if (game.game_over() || piece.search(/^b/) !== -1) return false;
}

function makeBestMove() {
  stockfish.postMessage("position fen " + game.fen());
  stockfish.postMessage("go depth 15");
  stockfish.onmessage = function (e) {
    if (typeof e.data === "string" && e.data.startsWith("bestmove")) {
      const move = e.data.split(" ")[1];
      game.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: "q" });
      board.position(game.fen());
      updateStatus();
    }
  };
}

function onDrop(source, target) {
  let move = game.move({ from: source, to: target, promotion: "q" });
  if (move === null) return "snapback";
  board.position(game.fen());
  updateStatus();
  window.setTimeout(makeBestMove, 300);
}

function onSnapEnd() {
  board.position(game.fen());
}

function updateStatus() {
  let status = "";
  if (game.in_checkmate()) status = "Checkmate! Game over.";
  else if (game.in_draw()) status = "Draw!";
  else status = "Your move";
  document.getElementById("status").innerText = status;
}

function startGame() {
  game.reset();
  board.start();
  updateStatus();
}

function undoMove() {
  game.undo(); game.undo();
  board.position(game.fen());
  updateStatus();
}

function flipBoard() {
  board.flip();
}

function changeTheme(selected) {
  theme = selected;
  document.body.classList.remove("white", "dark", "purple");
  document.body.classList.add(selected);
}

const config = {
  draggable: true,
  position: "start",
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
};

document.addEventListener("DOMContentLoaded", () => {
  board = Chessboard("board", config);
  updateStatus();
  changeTheme("purple");
});
