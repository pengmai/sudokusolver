import React from 'react';
import ReactDOM from 'react-dom';
import {
  Button, Alert, ButtonGroup
} from 'react-bootstrap';
import { Motion, spring } from 'react-motion';
import { puzzles } from './puzzles.js';
import { AboutModal } from './aboutModal.js';
import { DropupMenu } from './dropupMenu.js';
import Client from './client.js';
import Sudoku from './sudoku.js';
import Board from './board.js';
import registerServiceWorker from './registerServiceWorker';
import range from 'lodash/range';
import './numberselector.css';

// Constants
const SPRING_PARAMS = {stiffness: 170, damping: 19};
const DEG_TO_RAD = 0.0174533; // Value of 1 degree in radians.
const NUM_CHILDREN = 10; // 9 options + 1 blank.
const SEPARATION_ANGLE = 36, // in degrees.
        FAN_ANGLE = (NUM_CHILDREN - 1) * SEPARATION_ANGLE, // in degrees.
        BASE_ANGLE = ((180 - FAN_ANGLE) / 2); // in degrees.

// Utilities for the input animation
function toRadians(degrees) {
  return degrees * DEG_TO_RAD;
}

function finalDeltaPositions(index, buttonDiam, flyOutRadius) {
  let angle = BASE_ANGLE + (index * SEPARATION_ANGLE);
  return {
    deltaX: flyOutRadius * Math.cos(toRadians(angle)) - (buttonDiam / 2),
    deltaY: flyOutRadius * Math.sin(toRadians(angle)) + (buttonDiam / 2)
  };
}

class SudokuSolver extends React.Component {
  constructor() {
    super();
    var rows = this.getBoardSetTo(0);
    var valid = this.getBoardSetTo(1);

    this.state = {
      accessible: false,
      board: rows,
      buttonMessage: "Solve",
      cannotSolve: false,
      col: 4,
      alert: "Welcome! Click anywhere on the board to begin.",
      loading: false,
      row: 4,
      selecting: false,
      showAbout: false,
      solved: false,
      valid: valid,
      windowWidth: '0',
      windowHeight: '0'
    };

    this.resetBoard = this.resetBoard.bind(this);
    this.randomPuzzle = this.randomPuzzle.bind(this);
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.accessibilityOff = this.accessibilityOff.bind(this);
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  updateWindowDimensions() {
    this.setState({
      mX: window.innerWidth / 2,
      mY: window.innerHeight / 2,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    });
  }

  handleKeyDown(event) {
    if (!this.state.accessible) {
      // Pressing any key will turn on accessibility mode.
      this.setState({
        accessible: true,
        alert: "You just turned on accessibility mode! Press 'a' for more info."
      });
      return;
    }
    if (this.state.showAbout) {
      this.hideModal();
      return;
    }
    if (!isNaN(event.key) && event.key !== ' ') {
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
        if (this.state.row > 0) {this.setState({row: this.state.row - 1});}
        break;
      case 'k':
        if (this.state.row < 8) {this.setState({row: this.state.row + 1});}
        break;
      case 'j':
        if (this.state.col > 0) {this.setState({col: this.state.col - 1});}
        break;
      case 'l':
        if (this.state.col < 8) {this.setState({col: this.state.col + 1});}
        break;
      case 'backspace':
        this.updateBoard(0);
        break;
      default:
        // Do nothing.
        break;
    }
  }

  getBoardSetTo(i) {
    var row = Array(9).fill(i);
    var rows = [];
    for (var j = 0; j < 9; j++) {
      rows.push(row.slice());
    }
    return rows;
  }

  handleClick(i) {
    if (this.state.loading || this.state.solved) {
      return;
    }

    const row = Math.floor(i / 9);
    const col = i % 9;

    // Clicking the same square twice will dismiss the selection buttons.
    if (row === this.state.row && col === this.state.col) {
      this.setState({
        selecting: !this.state.selecting
      });
    } else {
      this.setState({
        col: col,
        row: row,
        selecting: true
      });
    }
  }

  updateBoard(selected) {
    if (this.state.solved) {
      return;
    }

    const board = this.state.board.slice();
    board[this.state.row][this.state.col] = selected;

    // Check for invalid numbers.
    const valid = Sudoku.checkConflicts(board);
    const cannotSolve = Sudoku.hasConflicts(valid);
    this.setState({
      board: board,
      cannotSolve: cannotSolve,
      selecting: false,
      valid: valid
    });
  }

  randomPuzzle() {
    if (this.state.loading) {
      return;
    }
    let index = Math.floor(Math.random() * puzzles.length);
    const valid = this.getBoardSetTo(1);
    this.setState({
      board: puzzles[index],
      buttonMessage: "Solve",
      cannotSolve: false,
      solved: false,
      valid: valid
    });
  }

  resetBoard() {
    if (this.state.loading) {
      return;
    }
    const board = this.getBoardSetTo(0);
    this.setState({
      alert: "",
      board: board,
      buttonMessage: "Solve",
      solved: false
    });
  }

  solveBoard() {
    if (this.state.solved || this.state.loading || this.state.cannotSolve) {
      return;
    }

    let start = new Date();
    this.setState({
      buttonMessage: "Solving...",
      loading: true,
      selecting: false
    });
    Client.solve(this.state.board)
      .then(response => {
        if (response.hasOwnProperty("error")) {
          var error;
          switch (response.error) {
            case "Puzzle cannot be solved.":
            case "Solver timed out.":
              error = `There appears to be no possible solutions to the
                puzzle you have entered.`;
              break;
            default:
              error = "An unknown error has occurred. Please try again.";
          }
          this.setState({
            buttonMessage: "Solve",
            alert: error,
            loading: false,
            solved: false
          });
        } else {
          let elapsed = new Date() - start;
          this.setState({
            board: response.solution,
            buttonMessage: "Reset",
            alert: "Solved! Time elapsed: " + elapsed + " milliseconds.",
            loading: false,
            solved: true
          });
        }
      });
  }

  handleButton() {
    if (this.state.solved) {
      this.resetBoard();
    } else {
      this.solveBoard();
    }
  }

  initialButtonStyles() {
    var squareWidth, buttonDiam;
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
    let mX = (this.state.windowWidth / 2)
      + ((this.state.col - 4) * squareWidth);
    let mY = (this.state.windowHeight / 2)
      + ((this.state.row - 4) * squareWidth);

    return {
      width: buttonDiam,
      height: buttonDiam,
      top: spring(mY - (buttonDiam / 2), SPRING_PARAMS),
      left: spring(mX - (buttonDiam / 2), SPRING_PARAMS),
      zIndex: spring(-1, {stiffness: 2500, damping: 50})
    };
  }

  finalButtonStyles(index) {
    var squareWidth, buttonDiam, flyOutRadius;
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
    let {deltaX, deltaY} = finalDeltaPositions(index, buttonDiam, flyOutRadius);
    // The middle coordinates that the selection buttons should surround.
    let mX = (this.state.windowWidth / 2)
      + ((this.state.col - 4) * squareWidth);
    let mY = (this.state.windowHeight / 2)
      + ((this.state.row - 4) * squareWidth);

    // Ensure all buttons are visible, even on smallest viewports.
    if (320 < this.state.windowWidth && this.state.windowWidth < 440) {
      if (this.state.col === 0) {
        mX -= ((this.state.windowWidth / 2) - 220);
      } else if (this.state.col === 8) {
        mX += ((this.state.windowWidth / 2) - 220);
      }
    } else if (this.state.windowWidth <= 320) {
      // iPhone 5 and older.
      if (this.state.col < 2) {
        mX -= ((this.state.windowWidth / 2) - 203 + (this.state.col * 33));
      } else if (this.state.col > 6) {
        mX += ((this.state.windowWidth / 2) - 203 + (this.state.col === 8 ? 0 :
          33));
      }
    }

    return {
      width: buttonDiam,
      height: buttonDiam,
      top: spring(mY - deltaY, SPRING_PARAMS),
      left: spring(mX + deltaX, SPRING_PARAMS),
      zIndex: 1
    };
  }

  showModal() {
    this.setState({showAbout: true});
  }

  hideModal() {
    this.setState({showAbout: false});
  }

  accessibilityOff() {
    this.setState({
      accessible: false,
      alert: `Accessibility mode is turned off.
      Press any key to turn it on again.`
    });
  }

  render() {
    return (
      <div>
        {range(NUM_CHILDREN).map(index => {
          let style = this.state.selecting ? this.finalButtonStyles(index) :
            this.initialButtonStyles();
          return (
            <Motion style={style} key={index}>
              {({width, height, top, left, zIndex}) =>
                <div
                  className="child-button"
                  style={{
                    width: width,
                    height: height,
                    top: top,
                    left: left,
                    zIndex: zIndex
                  }}
                  onClick={() => {this.updateBoard(index)}}>
                  {index > 0 ? index : ''}
                </div>
              }
            </Motion>
          );
        })}

        <div className="text-center">
          {this.state.alert === "" ? "" :
            <Alert bsStyle="info">
              <p>{this.state.alert}</p>
            </Alert>
          }
        </div>

        <Board
          board={this.state.board}
          valid={this.state.valid}
          onClick={(i) => this.handleClick(i)}
          disabled={this.state.loading || this.state.solved}
          current={this.state.row * 9 + this.state.col}
          selecting={this.state.selecting || this.state.accessible}
        />

        <ButtonGroup id="solve-group">
          <Button
            bsStyle="info"
            id="solve-button"
            bsSize="large"
            disabled={this.state.cannotSolve || this.state.loading}
            onClick={() => (this.state.cannotSolve || this.state.loading ?
              null : this.handleButton())}>
            {this.state.buttonMessage}
          </Button>
          <DropupMenu
            solved={this.state.solved}
            onClick={() => {this.setState({selecting: false})}}
            reset={this.resetBoard}
            random={this.randomPuzzle}
            about={this.showModal}
            loading={this.state.loading}
            accessible={this.state.accessible}
            accessibilityOff={this.accessibilityOff}
          />
        </ButtonGroup>

        <AboutModal
          showAbout={this.state.showAbout}
          hideModal={this.hideModal}
        />
      </div>
    );
  }
}

ReactDOM.render(<SudokuSolver />, document.getElementById('root'));
registerServiceWorker();
