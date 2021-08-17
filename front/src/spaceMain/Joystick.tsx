import React from 'react';
import PeerManager from './RTCGameUtils';

interface JoystickProps {
  peerManager: PeerManager | undefined;
}

export default function Joystick(props: JoystickProps): JSX.Element {
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
