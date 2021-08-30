import React from 'react';

interface MoreInfoProps {
  aOnClick: () => void;
  aInnerText: string;
  brInnerText: string;
}

function MoreInfo(props: MoreInfoProps): JSX.Element {
  return (
    <>
      <br />
      {props.brInnerText}
      <a onClick={props.aOnClick}>{props.aInnerText}</a>
    </>
  );
}

export default MoreInfo;
