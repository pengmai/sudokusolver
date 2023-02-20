import React from 'react';
import ReactDOM from 'react-dom';
import { Alert, Button, ButtonGroup } from 'react-bootstrap';
import { Motion, spring } from 'react-motion';
import { AboutModal } from './aboutModal';
import { DropupMenu } from './dropupMenu';
import { puzzles } from './puzzles';

import Board from './board';
import solver from './solver.worker';
import Sudoku from './sudoku';
import WebWorker from './webWorker';

import './numberselector.css';

const range = (n: number) => {
  const arr = new Array(n);
  for (let i = 0; i < n; i++) arr[i] = i;
  return arr;
};

// Constants
const SPRING_PARAMS = { stiffness: 170, damping: 19 };
const DEG_TO_RAD = 0.0174533; // Value of 1 degree in radians.
const NUM_CHILDREN = 10; // 9 options + 1 blank.
const SEPARATION_ANGLE = 36; // in degrees.
const FAN_ANGLE = (NUM_CHILDREN - 1) * SEPARATION_ANGLE; // in degrees.
const BASE_ANGLE = (180 - FAN_ANGLE) / 2; // in degrees.

// Utilities for the input animation
function toRadians(degrees: number) {
  return degrees * DEG_TO_RAD;
}

function finalDeltaPositions(index: number, buttonDiam: number, flyOutRadius: number) {
  const angle = BASE_ANGLE + index * SEPARATION_ANGLE;
  return {
    deltaX: flyOutRadius * Math.cos(toRadians(angle)) - buttonDiam / 2,
    deltaY: flyOutRadius * Math.sin(toRadians(angle)) + buttonDiam / 2,
  };
}

interface SudokuSolverState {
  alert: string;
  board: number[][];
  buttonMessage: string;
  cannotSolve: boolean;
  col: number;
  keyboardOn: boolean;
  loading: boolean;
  row: number;
  selecting: boolean;
  showAbout: boolean;
  solved: boolean;
  started: number;
  valid: number[][];
  windowHeight: number;
  windowWidth: number;
  worker: Worker;
}

export default class SudokuSolver extends React.Component<{}, SudokuSolverState> {
  constructor(props: object) {
    super(props);
    const rows = this.getBoardSetTo(0);
    const valid = this.getBoardSetTo(1);

    this.state = {
      alert: 'Welcome! Click anywhere on the board to begin.',
      board: rows,
      buttonMessage: 'Solve',
      cannotSolve: false,
      col: 4,
      keyboardOn: false,
      loading: false,
      row: 4,
      selecting: false,
      showAbout: false,
      solved: false,
      started: 0,
      valid,
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth,
      worker: WebWorker(solver),
    };
  }

  public componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
    window.addEventListener('keydown', this.handleKeyDown);
    this.state.worker.onmessage = this.onWorkerReturn;
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
    window.removeEventListener('keydown', this.handleKeyDown);
    this.state.worker.terminate();
  }

  public render() {
    return (
      <div>
        {range(NUM_CHILDREN).map(index => {
          const style = this.state.selecting
            ? this.finalButtonStyles(index)
            : this.initialButtonStyles();
          return (
            <Motion style={style} key={index}>
              {({ width, height, top, left, zIndex }) => (
                <div
                  className="child-button"
                  style={{
                    height,
                    left,
                    top,
                    width,
                    zIndex,
                  }}
                  onClick={() => this.updateBoard(index)}
                >
                  {index > 0 ? index : ''}
                </div>
              )}
            </Motion>
          );
        })}

        <div className="text-center">
          {this.state.alert === '' ? (
            ''
          ) : (
            <Alert bsStyle="info">
              <p>{this.state.alert}</p>
            </Alert>
          )}
        </div>

        <Board
          board={this.state.board}
          valid={this.state.valid}
          onClick={(i: number) => this.handleClick(i)}
          current={this.state.row * 9 + this.state.col}
          selecting={this.state.selecting || this.state.keyboardOn}
        />

        <ButtonGroup id="solve-group">
          <Button
            bsStyle="info"
            id="solve-button"
            bsSize="large"
            disabled={this.state.cannotSolve || this.state.loading}
            onClick={() =>
              this.state.cannotSolve || this.state.loading ? null : this.handleButton()
            }
          >
            {this.state.buttonMessage}
          </Button>
          <DropupMenu
            solved={this.state.solved}
            onClick={() => this.setState({ selecting: false })}
            reset={this.resetBoard}
            random={this.randomPuzzle}
            about={this.showModal}
            loading={this.state.loading}
            keyboardOn={this.state.keyboardOn}
            keyboardOff={this.keyboardOff}
          />
        </ButtonGroup>

        <AboutModal showAbout={this.state.showAbout} hideModal={this.hideModal} />
      </div>
    );
  }

  public updateWindowDimensions = () => {
    const documentElement = document.documentElement
      ? document.documentElement
      : {
          clientHeight: 0,
          clientWidth: 0,
          offsetHeight: 0,
          offsetWidth: 0,
          scrollHeight: 0,
          scrollWidth: 0,
        };
    const jQueryWidth = Math.max(
      documentElement.clientWidth,
      document.body.scrollWidth,
      documentElement.scrollWidth,
      document.body.offsetWidth,
      documentElement.offsetWidth
    );
    const jQueryHeight = Math.max(
      documentElement.clientHeight,
      document.body.scrollHeight,
      documentElement.scrollHeight,
      document.body.offsetHeight,
      documentElement.offsetHeight
    );
    this.setState({
      windowHeight: window.innerHeight > jQueryHeight ? jQueryHeight : window.innerHeight,
      windowWidth: window.innerWidth > jQueryWidth ? jQueryWidth : window.innerWidth,
    });
  };

  public handleKeyDown = (event: KeyboardEvent) => {
    if (!this.state.keyboardOn) {
      // Pressing any key will turn on keyboard mode.
      this.setState({
        alert: "You just turned on keyboard mode! Press 'a' for more info.",
        keyboardOn: true,
      });
      return;
    } else if (!this.state.showAbout && event.key === 'Escape') {
      // Escape will turn off keyboard mode.
      this.keyboardOff();
    }

    if (!isNaN(parseInt(event.key, 10)) && event.key !== ' ') {
      this.updateBoard(parseInt(event.key, 10));
      return;
    }

    switch (event.key.toLowerCase()) {
      case 'a':
        this.showModal();
        break;
      case 'c':
        this.resetBoard();
        break;
      case 'r':
        this.randomPuzzle();
        break;
      case 's':
        this.solveBoard();
        break;
      case 'i':
        if (this.state.row > 0) {
          this.setState({ row: this.state.row - 1 });
        }
        break;
      case 'k':
        if (this.state.row < 8) {
          this.setState({ row: this.state.row + 1 });
        }
        break;
      case 'j':
        if (this.state.col > 0) {
          this.setState({ col: this.state.col - 1 });
        }
        break;
      case 'l':
        if (this.state.col < 8) {
          this.setState({ col: this.state.col + 1 });
        }
        break;
      case 'backspace':
        this.updateBoard(0);
        break;
      default:
        // Do nothing.
        break;
    }
  };

  public getBoardSetTo(i: number) {
    const row = [];
    for (let j = 0; j < 9; ++j) {
      row[j] = i;
    }
    const rows = [];
    for (let k = 0; k < 9; k++) {
      rows.push(row.slice());
    }
    return rows;
  }

  public handleClick(i: number) {
    if (this.state.loading || this.state.solved) {
      return;
    }

    const row = Math.floor(i / 9);
    const col = i % 9;

    // Clicking the same square twice will dismiss the selection buttons.
    if (row === this.state.row && col === this.state.col) {
      this.setState({
        selecting: !this.state.selecting,
      });
    } else {
      this.setState({
        col,
        row,
        selecting: true,
      });
    }
  }

  public updateBoard(selected: number) {
    if (this.state.solved) {
      return;
    }

    const board = this.state.board.slice();
    board[this.state.row][this.state.col] = selected;

    // Check for invalid numbers.
    const valid = Sudoku.checkConflicts(board);
    const cannotSolve = Sudoku.hasConflicts(valid);
    this.setState({
      board,
      cannotSolve,
      selecting: false,
      valid,
    });
  }

  public randomPuzzle = () => {
    if (this.state.loading) {
      return;
    }
    const index = Math.floor(Math.random() * puzzles.length);
    const valid = this.getBoardSetTo(1);
    this.setState({
      alert: 'Board set to puzzle #' + (index + 1),
      board: puzzles[index],
      buttonMessage: 'Solve',
      cannotSolve: false,
      solved: false,
      valid,
    });
  };

  public resetBoard = () => {
    if (this.state.loading) {
      return;
    }
    const board = this.getBoardSetTo(0);
    const valid = this.getBoardSetTo(1);
    this.setState({
      alert: 'Board reset.',
      board,
      buttonMessage: 'Solve',
      cannotSolve: false,
      solved: false,
      valid,
    });
  };

  public solveBoard() {
    if (this.state.solved || this.state.loading || this.state.cannotSolve) {
      return;
    }

    this.setState(
      {
        buttonMessage: 'Solving...',
        loading: true,
        selecting: false,
        started: Date.now(),
      },
      () => {
        const puzzle = this.state.board.map(row => row.join('')).join('');
        this.state.worker.postMessage(puzzle);
      }
    );
  }

  public onWorkerReturn = (event: MessageEvent) => {
    if (event.data.hasOwnProperty('error')) {
      this.setState({
        alert: event.data.error,
        buttonMessage: 'Solve',
        loading: false,
        solved: false,
      });
    } else {
      const elapsed = Date.now() - this.state.started;
      this.setState({
        alert: `Solved! Time elapsed: ${elapsed} milliseconds`,
        board: event.data,
        buttonMessage: 'Reset',
        loading: false,
        solved: true,
      });
    }
  };

  public handleButton() {
    if (this.state.solved) {
      this.resetBoard();
    } else {
      this.solveBoard();
    }
  }

  public initialButtonStyles() {
    let squareWidth;
    let buttonDiam;
    if (this.state.windowWidth > 600 && this.state.windowHeight > 660) {
      squareWidth = 58;
      buttonDiam = 40;
    } else if (this.state.windowWidth <= 320) {
      // iPhone 5 and older.
      squareWidth = 35;
      buttonDiam = 28;
    } else {
      // Narrow desktop and iPhone 6.
      squareWidth = 38;
      buttonDiam = 30;
    }
    // The middle coordinates that the selection buttons should surround.
    const mX = this.state.windowWidth / 2 + (this.state.col - 4) * squareWidth;
    const mY = this.state.windowHeight / 2 + (this.state.row - 4) * squareWidth;

    return {
      height: buttonDiam,
      left: spring(mX - buttonDiam / 2, SPRING_PARAMS),
      top: spring(mY - buttonDiam / 2, SPRING_PARAMS),
      width: buttonDiam,
      zIndex: spring(-1, { stiffness: 2500, damping: 50 }),
    };
  }

  public finalButtonStyles(index: number) {
    let squareWidth;
    let buttonDiam;
    let flyOutRadius;
    if (this.state.windowWidth > 600 && this.state.windowHeight > 660) {
      squareWidth = 58;
      buttonDiam = 40;
      flyOutRadius = 65;
    } else if (this.state.windowWidth <= 320) {
      // iPhone 5 and older.
      squareWidth = 35;
      buttonDiam = 28;
      flyOutRadius = 48;
    } else {
      // Narrow desktop and iPhone 6.
      squareWidth = 38;
      buttonDiam = 30;
      flyOutRadius = 50;
    }
    const { deltaX, deltaY } = finalDeltaPositions(index, buttonDiam, flyOutRadius);
    // The middle coordinates that the selection buttons should surround.
    let mX = this.state.windowWidth / 2 + (this.state.col - 4) * squareWidth;
    const mY = this.state.windowHeight / 2 + (this.state.row - 4) * squareWidth;

    // Ensure all buttons are visible, even on smallest viewports.
    if (320 < this.state.windowWidth && this.state.windowWidth < 440) {
      if (this.state.col === 0) {
        mX -= this.state.windowWidth / 2 - 220;
      } else if (this.state.col === 8) {
        mX += this.state.windowWidth / 2 - 220;
      }
    } else if (this.state.windowWidth <= 320) {
      // iPhone 5 and older.
      if (this.state.col < 2) {
        mX -= this.state.windowWidth / 2 - 203 + this.state.col * 33;
      } else if (this.state.col > 6) {
        mX += this.state.windowWidth / 2 - 203 + (this.state.col === 8 ? 0 : 33);
      }
    }

    return {
      height: buttonDiam,
      left: spring(mX + deltaX, SPRING_PARAMS),
      top: spring(mY - deltaY, SPRING_PARAMS),
      width: buttonDiam,
      zIndex: 1,
    };
  }

  public showModal = () => {
    this.setState({ showAbout: true });
  };

  public hideModal = () => {
    this.setState({ showAbout: false });
  };

  public keyboardOff = () => {
    this.setState({
      alert: `Keyboard mode is turned off. Press any key to turn it on again.`,
      keyboardOn: false,
    });
  };
}

ReactDOM.render(<SudokuSolver />, document.getElementById('sudoku-root'));
