import React from 'react';

interface WelcomeProps {
  logoImageSrc: string;
  logoImageOnload?: () => void;
}

function Welcome(props: WelcomeProps): JSX.Element {
  return (
    <>
      <img
        className="logoImage"
        src={props.logoImageSrc}
        onLoad={props.logoImageOnload}
      />
      <div className="welcome">
        WELCOME
        <br />
        VOICE SPACE
      </div>
    </>
  );
}

export default Welcome;
