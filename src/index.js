import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Alert } from 'react-bootstrap';
import Client from './client.js';
import Sudoku from './sudoku.js';
import Board from './board.js';
import registerServiceWorker from './registerServiceWorker';
import range from 'lodash/range';
import './numberselector.css';

// Constants
const SQUARE_WIDTH = 38; // in pixels.
const DEG_TO_RAD = 0.0174533; // Value of 1 degree in radians.
const BUTTON_DIAM = 40; // Diameter of the child buttons in pixels.
const NUM_CHILDREN = 10; // 9 options + 1 blank.
const FLY_OUT_RADIUS = 65, // distance between source and each child button.
        SEPARATION_ANGLE = 36, // in degrees.
        FAN_ANGLE = (NUM_CHILDREN - 1) * SEPARATION_ANGLE, // in degrees.
        BASE_ANGLE = ((180 - FAN_ANGLE) / 2); // in degrees.

function toRadians(degrees) {
  return degrees * DEG_TO_RAD;
}

function finalDeltaPositions(index) {
  let angle = BASE_ANGLE + (index * SEPARATION_ANGLE);
  return {
    deltaX: FLY_OUT_RADIUS * Math.cos(toRadians(angle)) - (BUTTON_DIAM / 2),
    deltaY: FLY_OUT_RADIUS * Math.sin(toRadians(angle)) + (BUTTON_DIAM / 2)
  };
}

class SudokuSolver extends React.Component {
  constructor() {
    super();
    var rows = this.getBoardSetTo(0);
    var valid = this.getBoardSetTo(1);

    this.state = {
      board: rows,
      buttonMessage: "Solve",
      cannotSolve: false,
      col: 0,
      error: "",
      loading: false,
      row: 0,
      selecting: false,
      solved: false,
      valid: valid,
      windowWidth: '0',
      windowHeight: '0'
    };

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({
      mX: window.innerWidth / 2,
      mY: window.innerHeight / 2,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    });
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
    const row = Math.floor(i / 9);
    const col = i % 9;

    this.setState({
      col: col,
      row: row,
      selecting: true
    });
  }

  updateBoard(selected) {
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

  handleButton() {
    if (this.state.solved) {
      // Reset the board
      var board = this.getBoardSetTo(0);
      this.setState({
        board: board,
        buttonMessage: "Solve",
        solved: false
      });
    } else {
      this.setState({buttonMessage: "Solving...", loading: true});
      Client.solve(this.state.board)
        .then(response => {
          if (response.hasOwnProperty("error")) {
            var error;
            switch (response.error) {
              case "Contradiction detected at root.":
                error = `There appears to be no possible solutions to the
                  puzzle you have entered. Please update it and try again.`;
                break;
              default:
                error = "An unknown error has occurred. Please try again.";
            }
            this.setState({
              buttonMessage: "Solve",
              error: error,
              loading: false,
              solved: false
            });
          } else {
            this.setState({
              board: response.solution,
              buttonMessage: "Reset",
              error: "",
              loading: false,
              solved: true
            });
          }
        });
    }
  }

  initialButtonStyles() {
    // The middle coordinates that the selection buttons should surround.
    let mX = (this.state.windowWidth / 2)
      + ((this.state.col - 4) * SQUARE_WIDTH);
    let mY = (this.state.windowHeight / 2)
      + ((this.state.row - 4) * SQUARE_WIDTH);
    return {
      width: BUTTON_DIAM,
      height: BUTTON_DIAM,
      top: mY - (BUTTON_DIAM / 2),
      left: mX - (BUTTON_DIAM / 2),
      zIndex: -1,
      boxShadow: null
    };
  }

  finalButtonStyles(index) {
    let {deltaX, deltaY} = finalDeltaPositions(index);
    // The middle coordinates that the selection buttons should surround.
    let mX = (this.state.windowWidth / 2)
      + ((this.state.col - 4) * SQUARE_WIDTH);
    let mY = (this.state.windowHeight / 2)
      + ((this.state.row - 4) * SQUARE_WIDTH);
    return {
      width: BUTTON_DIAM,
      height: BUTTON_DIAM,
      top: mY - deltaY,
      left: mX + deltaX,
      zIndex: 1,
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)'
    };
  }

  /*select(index) {
    this.setState({
      selecting: false,
      selected: index
    });
  }*/

  render() {
    return (
      <div>
        {range(NUM_CHILDREN).map(index => {
          let style = this.state.selecting ? this.finalButtonStyles(index) : this.initialButtonStyles(index);
          return (
            <div
              key={index}
              className="child-button"
              style={style}
              onClick={() => this.updateBoard(index)}>
              {index > 0 ? index : ''}
            </div>
          );
        })}
        <div className="text-center">
          {this.state.error === "" ? "" :
            <Alert bsStyle="danger">
              <p>{this.state.error}</p>
            </Alert>
          }
        </div>

        <Board
          board={this.state.board}
          valid={this.state.valid}
          onClick={(i) => this.handleClick(i)}
          disabled={this.state.loading || this.state.solved}
        />

        <Button
          bsStyle="info"
          bsSize="large"
          disabled={this.state.cannotSolve || this.state.loading}
          onClick={() => (this.state.cannotSolve || this.state.loading ?
            null : this.handleButton())}>
          {this.state.buttonMessage}
        </Button>
      </div>
    )
  }
}

ReactDOM.render(<SudokuSolver />, document.getElementById('root'));
registerServiceWorker();
