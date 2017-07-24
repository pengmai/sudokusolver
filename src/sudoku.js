function newSquare(i, j) {
  return {
    value: 0,
    hasConflict: false,
    i,
    j
  }
}

function newGame() {
  var board = [];
  for (var i = 0; i < 9; i++) {
    var line = [];
    for (var j = 0; j < 9; j++) {
      line.push(newSquare(i, j));
    }
    board.push(line);
  }
  return {
    board
  };
}

var Sudoku = {
  newGame,
  newSquare
}

module.exports = Sudoku;
