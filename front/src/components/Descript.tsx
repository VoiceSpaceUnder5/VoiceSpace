import React from 'react';

interface DescriptProps {
  divInnerText: string;
  brInnerText: string;
}

function Descript(props: DescriptProps): JSX.Element {
  return (
    <>
      {props.divInnerText}
      <br />
      {props.brInnerText}
      <br />
    </>
  );
}

export default Descript;
