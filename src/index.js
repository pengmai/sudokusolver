import React from 'react';
import ReactDOM from 'react-dom';
import Client from './client.js';
import './index.css';
import './sudokuboard.css';
//import registerServiceWorker from './registerServiceWorker';

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value === 0 ? "" : props.value}
    </button>
  );
}

class Board extends React.Component {
  constructor() {
    super();
    var rows = this.getEmptyBoard();

    this.state = {
      board: rows,
      solved: false,
      error: ""
    }
  }

  getEmptyBoard() {
    var row = Array(9).fill(0);
    var rows = [];
    for (var i = 0; i < 9; i++) {
      rows.push(row.slice());
    }
    return rows;
  }

  handleClick(i) {
    //console.log("Clicked square " + i);
    const row = Math.floor(i / 9);
    const col = i % 9;
    const board = this.state.board.slice();
    board[row][col] < 9 ? board[row][col]++ : board[row][col] = 0;
    this.setState({
      board: board,
    });
  }

  renderSquare(i) {
    return (
      <Square
        value={this.state.board[Math.floor(i / 9)][i % 9]}
        onClick={() => this.handleClick(i)}
      />
    );
  }

  handleButton() {
    if (this.state.solved) {
      // Reset the board
      var board = this.getEmptyBoard();
      this.setState({
        board: board,
        solved: false
      });
    } else {
      Client.solve(this.state.board)
        .then(response => {
          if (response.hasOwnProperty("error")) {
            this.setState({
              error: "There was a problem connecting to the server."
            });
          } else {
            this.setState({
              board: response.solution,
              solved: true,
              error: ""
            });
          }
        });
    }
  }

  render() {
    return (
      <div>
        <table className="board">
          <tbody>
            <tr className="board-row">
              <td>{this.renderSquare(0)}</td>
              <td>{this.renderSquare(1)}</td>
              <td>{this.renderSquare(2)}</td>
              <td>{this.renderSquare(3)}</td>
              <td>{this.renderSquare(4)}</td>
              <td>{this.renderSquare(5)}</td>
              <td>{this.renderSquare(6)}</td>
              <td>{this.renderSquare(7)}</td>
              <td>{this.renderSquare(8)}</td>
            </tr>
            <tr className="board-row">
              <td>{this.renderSquare(9)}</td>
              <td>{this.renderSquare(10)}</td>
              <td>{this.renderSquare(11)}</td>
              <td>{this.renderSquare(12)}</td>
              <td>{this.renderSquare(13)}</td>
              <td>{this.renderSquare(14)}</td>
              <td>{this.renderSquare(15)}</td>
              <td>{this.renderSquare(16)}</td>
              <td>{this.renderSquare(17)}</td>
            </tr>
            <tr className="board-row">
              <td>{this.renderSquare(18)}</td>
              <td>{this.renderSquare(19)}</td>
              <td>{this.renderSquare(20)}</td>
              <td>{this.renderSquare(21)}</td>
              <td>{this.renderSquare(22)}</td>
              <td>{this.renderSquare(23)}</td>
              <td>{this.renderSquare(24)}</td>
              <td>{this.renderSquare(25)}</td>
              <td>{this.renderSquare(26)}</td>
            </tr>
            <tr className="board-row">
              <td>{this.renderSquare(27)}</td>
              <td>{this.renderSquare(28)}</td>
              <td>{this.renderSquare(29)}</td>
              <td>{this.renderSquare(30)}</td>
              <td>{this.renderSquare(31)}</td>
              <td>{this.renderSquare(32)}</td>
              <td>{this.renderSquare(33)}</td>
              <td>{this.renderSquare(34)}</td>
              <td>{this.renderSquare(35)}</td>
            </tr>
            <tr className="board-row">
              <td>{this.renderSquare(36)}</td>
              <td>{this.renderSquare(37)}</td>
              <td>{this.renderSquare(38)}</td>
              <td>{this.renderSquare(39)}</td>
              <td>{this.renderSquare(40)}</td>
              <td>{this.renderSquare(41)}</td>
              <td>{this.renderSquare(42)}</td>
              <td>{this.renderSquare(43)}</td>
              <td>{this.renderSquare(44)}</td>
            </tr>
            <tr className="board-row">
              <td>{this.renderSquare(45)}</td>
              <td>{this.renderSquare(46)}</td>
              <td>{this.renderSquare(47)}</td>
              <td>{this.renderSquare(48)}</td>
              <td>{this.renderSquare(49)}</td>
              <td>{this.renderSquare(50)}</td>
              <td>{this.renderSquare(51)}</td>
              <td>{this.renderSquare(52)}</td>
              <td>{this.renderSquare(53)}</td>
            </tr>
            <tr className="board-row">
              <td>{this.renderSquare(54)}</td>
              <td>{this.renderSquare(55)}</td>
              <td>{this.renderSquare(56)}</td>
              <td>{this.renderSquare(57)}</td>
              <td>{this.renderSquare(58)}</td>
              <td>{this.renderSquare(59)}</td>
              <td>{this.renderSquare(60)}</td>
              <td>{this.renderSquare(61)}</td>
              <td>{this.renderSquare(62)}</td>
            </tr>
            <tr className="board-row">
              <td>{this.renderSquare(63)}</td>
              <td>{this.renderSquare(64)}</td>
              <td>{this.renderSquare(65)}</td>
              <td>{this.renderSquare(66)}</td>
              <td>{this.renderSquare(67)}</td>
              <td>{this.renderSquare(68)}</td>
              <td>{this.renderSquare(69)}</td>
              <td>{this.renderSquare(70)}</td>
              <td>{this.renderSquare(71)}</td>
            </tr>
            <tr className="board-row">
              <td>{this.renderSquare(72)}</td>
              <td>{this.renderSquare(73)}</td>
              <td>{this.renderSquare(74)}</td>
              <td>{this.renderSquare(75)}</td>
              <td>{this.renderSquare(76)}</td>
              <td>{this.renderSquare(77)}</td>
              <td>{this.renderSquare(78)}</td>
              <td>{this.renderSquare(79)}</td>
              <td>{this.renderSquare(80)}</td>
            </tr>
          </tbody>
        </table>

        <button className="solveButton" onClick={() => this.handleButton()}>
          {this.state.solved ? "reset" : "solve"}
        </button>
        <p id="errorMessage">{this.state.error}</p>
      </div>
    )
  }
}

ReactDOM.render(<Board />, document.getElementById('root'));
//registerServiceWorker();
