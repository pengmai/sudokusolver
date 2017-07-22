import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  constructor() {
    super();
    this.state = {}
  }

  handleClick(i) {
    alert("You clicked me!");
  }

  renderSquare(i) {
    return (
      <Square
        value={i}
        onClick={(i) => this.handleClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
        </div>
      </div>
    )
  }
}

ReactDOM.render(<Board />, document.getElementById('root'));
//registerServiceWorker();
