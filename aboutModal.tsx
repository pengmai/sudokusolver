import React from 'react';
import { Button, Modal } from 'react-bootstrap';

interface AboutModalProps {
  showAbout: boolean;
  hideModal: () => void;
}

export function AboutModal(props: AboutModalProps) {
  return (
    <Modal
      show={props.showAbout}
      onHide={props.hideModal}
      dialogClassName="about-modal"
    >
      <Modal.Header closeButton={true}>
        <Modal.Title id="contained-modal-title-lg">About</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Sudoku Solver version 1.1</h4><br/>
        <p>Created by Jacob Mai Peng</p>
        <p>Thank you for checking out my sudoku solver! It uses a modified
          version of Pankaj Kumar&apos;s
          <a
            href="http://pankaj-k.net/weblog/2007/03/sudoku_solving_program_transla.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            {' translation '}
          </a>
          of Peter Norvig's excellent sudoku solver from his
          <a
            href="http://norvig.com/sudoku.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            {' article '}
          </a>
          on the subject. You can view the source code for this app on my
          <a
            href="https://github.com/pengmai/sudokusolver"
            target="_blank"
            rel="noopener noreferrer"
          >
            {' Github.'}
          </a>
        </p>
        <br/>
        <h4>Keyboard Mode</h4>
        <p>
          Keyboard mode is designed for people who would rather use
          their keyboards to interact with the app. It can be enabled by
          pressing any key and its usage is as follows:
        </p>
        <p><strong>esc</strong>: exit keyboard mode</p>
        <p><strong>s</strong>: solve the current board</p>
        <p><strong>c</strong>: clear/reset the current board</p>
        <p><strong>r</strong>: randomly set the board to one of 30 preset
          puzzles</p>
        <p><strong>a</strong>: display this &apos;About&apos; panel</p>
        <p>Use <strong>i, j, k, &amp; l</strong> to move around and the number
          keys to input numbers into the board. Press
          <strong>{' backspace'}</strong> or <strong>0</strong> to
          erase the current number.</p>
        <br/>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.hideModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
