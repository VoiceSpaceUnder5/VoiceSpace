import React from 'react';

export default function Joystick(): JSX.Element {
  return (
    <>
      <img
        className="joystickBase"
        src="./assets/joystick/Joystick.png"
        alt="조이스틱베이스"
      />
      <img
        className="joystick"
        src="./assets/joystick/Joystick.png"
        alt="조이스틱"
      />
    </>
  );
}
