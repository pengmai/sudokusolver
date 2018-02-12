function transposeArray(arr: number[][]) {
  const newArray: number[][] = [];
  let i: number;
  let j: number;

  for (i = 0; i < arr.length; i++) {
    newArray.push([]);
  }

  for (i = 0; i < arr.length; i++) {
    for (j = 0; j < arr.length; j++) {
      newArray[j].push(arr[i][j]);
    }
  }

  return newArray;
}

interface DuplicateOccurrences {
  [key: string]: number[];
}

/**
 * Return an array of all instances of duplicate elements in arr.
 */
function findDuplicates(arr: number[]) {
  const occurrences: DuplicateOccurrences = {};
  // Collect indices of occurrences, ignoring zero values.
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > 0) {
      const k = String(arr[i]);
      if (occurrences.hasOwnProperty(k)) {
        occurrences[k].push(i);
      } else {
        occurrences[k] = [i];
      }
    }
  }

  // Process occurrences.
  let dup: number[] = [];
  for (const key in occurrences) {
    if (occurrences.hasOwnProperty(key) && occurrences[key].length > 1) {
      dup = dup.concat(occurrences[key]);
    }
  }
  return dup;
}

interface CoordinateMap {
  [key: string]: number[];
}

function checkConflicts(board: number[][]) {
  // Initialize valid to a 9x9 row of 1's
  const line: number[] = [];
  let i: number = 0;
  for (i = 0; i < 9; i++) { line[i] = 1; }
  const valid: number[][] = [];

  let j: number = 0;
  let duplicates: number[];

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
      const coordinates: CoordinateMap = {};
      const subSquare = [];
      for (let di = 0; di < 3; di++) {
        for (let dj = 0; dj < 3; dj++) {
          subSquare.push(board[i + di][j + dj]);
          coordinates[subSquare.length - 1] = [i + di, j + dj];
        }
      }
      duplicates = findDuplicates(subSquare);
      for (const val of duplicates) {
        valid[coordinates[val][0]][coordinates[val][1]] = 0;
      }
    }
  }
  return valid;
}

function hasConflicts(valid: number[][]) {
  let i = valid.length;

  while (i--) {
    let j = valid[i].length;
    while (j--) {
      if (valid[i][j] === 0) {
        return true;
      }
    }
  }

  return false;
}

const Sudoku = {
  checkConflicts,
  hasConflicts
};

export default Sudoku;
