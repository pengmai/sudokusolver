function transposeArray(arr) {
    var newArray = [];
    var i, j;
    for (i = 0; i < arr.length; i++) {
        newArray.push([]);
    };

    for (i = 0; i < arr.length; i++) {
        for (j = 0; j < arr.length; j++) {
            newArray[j].push(arr[i][j]);
        };
    };

    return newArray;
}

/**
 * Return an array of all instances of duplicate elements in arr.
 */
function findDuplicates(arr) {
  var occurrences = {};
  // Collect indices of occurrences, ignoring zero values.
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] > 0) {
      if (occurrences.hasOwnProperty(arr[i])) {
        occurrences[arr[i]].push(i);
      } else {
        occurrences[arr[i]] = [i];
      }
    }
  }

  // Process occurrences.
  var dup = [];
  for (var key in occurrences) {
    if (occurrences.hasOwnProperty(key) && occurrences[key].length > 1) {
      dup = dup.concat(occurrences[key]);
    }
  }
  return dup;
}

function checkConflicts(board) {
  // Initialize valid to a 9x9 row of 1's
  var line = Array(9).fill(1);
  var valid = [];
  var i, j, duplicates;
  for (i = 0; i < 9; i++) {
    valid.push(line.slice());
  }

  // Check rows.
  for (i = 0; i < 9; i++) {
    duplicates = findDuplicates(board[i]);
    // Mark duplicates.
    for (j = 0; j < duplicates.length; j++) {
      valid[i][duplicates[j]] = 0;
    }
  }
  // Check columns.
  for (i = 0; i < 9; i++) {
    duplicates = findDuplicates(transposeArray(board)[i]);
    for (j = 0; j < duplicates.length; j++) {
      valid[duplicates[j]][i] = 0;
    }
  }
  // Check sub-squares.
  for (i = 0; i < 9; i += 3) {
    for (j = 0; j < 9; j += 3) {
      var coordinates = {};
      var subSquare = [];
      for (var di = 0; di < 3; di++) {
        for (var dj = 0; dj < 3; dj++) {
          subSquare.push(board[i + di][j + dj]);
          coordinates[subSquare.length - 1] = [i + di, j + dj];
        }
      }
      duplicates = findDuplicates(subSquare);
      for (var k = 0; k < duplicates.length; k++) {
        valid[coordinates[duplicates[k]][0]][coordinates[duplicates[k]][1]] = 0;
      }
    }
  }
  return valid;
}

var Sudoku = {
  checkConflicts
}

module.exports = Sudoku;
