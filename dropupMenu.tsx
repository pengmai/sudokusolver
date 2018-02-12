import React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

export interface Props {
  onClick: () => void;
  about: () => void;
  random: () => void;
  keyboardOff: () => void;
  reset: () => void;
  loading: boolean;
  keyboardOn: boolean;
  solved: boolean;
}

export function DropupMenu(props: Props) {
  // Only render the Reset button if the board is not currently solved.
  return (
    <DropdownButton
      bsStyle="info"
      id="dropdown-button"
      bsSize="large"
      pullRight={true}
      dropup={true}
      title=""
      onClick={props.onClick}
    >
      <MenuItem
        className="dropup-item"
        eventKey="1"
        onClick={props.about}
      >
        About
      </MenuItem>
      <MenuItem
        className="dropup-item"
        eventKey="2"
        disabled={props.loading}
        onClick={props.random}
      >
        Random Puzzle
      </MenuItem>
      <LinkContainer className="dropup-item" exact={true} to="/code">
        <MenuItem eventKey="3">
          Back to Site
        </MenuItem>
      </LinkContainer>
      {props.keyboardOn ? <MenuItem
        className="dropup-item"
        eventKey="4"
        onClick={props.keyboardOff}
      >
        Turn Keyboard Mode Off
      </MenuItem> : ''}
      {props.solved ? '' : <MenuItem
        className="dropup-item"
        eventKey="5"
        disabled={props.loading}
        onClick={props.reset}
      >
        Reset Board
      </MenuItem>}
    </DropdownButton>
  );
}
