import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export function AboutModal(props) {
  return (
    <Modal
      show={props.showAbout}
      onHide={props.hideModal}
      dialogClassName="about-modal">
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-lg">About</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Sudoku Solver QA version 0.1</h4><br/>
        <p>Created by Jacob Mai Peng</p>
        <p>Thank you for checking out my sudoku solver! It uses a slightly
          modified version of the algorithm found
          <a
            href="https://github.com/aniketawati/Sudoku-Solver"
            target="_blank"
            rel="noopener noreferrer">
            {' here '}
          </a>
          and you can view the source code for the front end of this app on
          <a
            href="https://github.com/pengmai/sudokufrontend"
            target="_blank"
            rel="noopener noreferrer">
            {' Github (currently private).'}
          </a>
        </p>
        <br/>
        <h4>Accessibility Mode</h4>
        <p>
          Accessibility mode is designed for people who would rather use
          their keyboards to interact with the app. It can be enabled by
          pressing any key and its usage is as follows:
        </p>
        <p><strong>esc</strong>: exit accessibility mode</p>
        <p><strong>s</strong>: solve the current board</p>
        <p><strong>c</strong>: clear/reset the current board</p>
        <p><strong>r</strong>: randomly set the board to one of 30 preset
          puzzles</p>
        <p><strong>a</strong>: display this 'About' panel</p>
        <p>Use <strong>i, j, k, & l</strong> to move around and the number
          keys to input numbers into the board. Press
          <strong>{' backspace' }</strong> or <strong>0</strong> to
          erase the current number.</p>
        <br/>
        <h4>Your solver says my puzzle has no solution, but it does!</h4>
        <p>This is certainly possible. The solver will time out after
          executing for 5 seconds, at which point it assumes that the puzzle
          has no solution. Note that this timeout occurs on the server side, so
          you will occasionally see 'time elapsed' values of greater than 5
          seconds because the timeout does not factor in the time to communicate
          with the server. The algorithm it uses is quite efficient at finding
          solutions for puzzles that have at least one solution, but not very
          efficient for determining that a puzzle has no solutions. The only
          times where I've personally seen it take more than about 2 seconds on
          a puzzle are for puzzles with no solution, so if you discover a puzzle
          with a unique solution that causes the solver to time out, let me know
          at <span style={{color: '#4686f4'}}>jacob.peng@hotmail.com</span>.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.hideModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
