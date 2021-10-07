import React from 'react';
import './spaceLoading.css';

export interface SpaceLoadingProps {
  loadingPercentage: number;
}

function SpaceLoading(props: SpaceLoadingProps): JSX.Element {
  return <div className="loadingInnerDiv">{props.loadingPercentage}</div>;
}

export default SpaceLoading;
