import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';
import Client from './client.js';
import Sudoku from './sudoku.js';
import Board from './board.js';
import './index.css';
//import registerServiceWorker from './registerServiceWorker';

class SudokuSolver extends React.Component {
  constructor() {
    super();
    var rows = this.getBoardSetTo(0);
    var valid = this.getBoardSetTo(1);

    this.state = {
      board: rows,
      buttonMessage: "Solve",
      cannotSolve: false,
      error: "",
      loading: false,
      solved: false,
      valid: valid
    };
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
    const board = this.state.board.slice();

    // Update board.
    board[row][col] < 9 ? board[row][col]++ : board[row][col] = 0;

    // Check for invalid numbers.
    const valid = Sudoku.checkConflicts(board);
    const cannotSolve = Sudoku.hasConflicts(valid);

    this.setState({
      board: board,
      cannotSolve: cannotSolve,
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
            this.setState({
              buttonMessage: "Solve",
              error: response.error,
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

  render() {
    return (
      <div>
        <Board
          board={this.state.board}
          valid={this.state.valid}
          onClick={(i) => this.handleClick(i)}
          disabled={this.state.loading || this.state.solved}
        />

        <div className="text-center">
          <Button
            bsStyle="info"
            bsSize="large"
            disabled={this.state.cannotSolve || this.state.loading}
            onClick={() => (this.state.cannotSolve || this.state.loading ?
              null : this.handleButton())}>
            {this.state.buttonMessage}
          </Button>
        </div>
        <p id="errorMessage">{this.state.error}</p>
      </div>
    )
  }
}

ReactDOM.render(<SudokuSolver />, document.getElementById('root'));
//registerServiceWorker();
