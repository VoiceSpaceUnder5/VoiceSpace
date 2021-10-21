import React, {useEffect} from 'react';
import {Progress} from 'antd';
import './spaceLoading.css';

export interface SpaceLoadingProps {
  loadingPercentage: number;
  message?: string;
}

class LoadingMessageProvider {
  private static messages = [
    '바닥 쓰는 중',
    '나무 심는 중',
    '옆 숲에서 친구들 초대하는 중',
    '바위 옮기는 중',
    '점심 메뉴 생각 하는 중',
    '코딩 하는 중',
    '생각하는 사람을 생각하는 중',
  ];
  static message = '로딩 중';
  static shuffleMessage(): void {
    const idx = (Math.random() * 100) % this.messages.length;
    this.message = this.messages[Math.floor(idx)];
  }
}

function SpaceLoading(props: SpaceLoadingProps): JSX.Element {
  const progressBarWidth = 230;
  const birdImgWidth = 50;

  useEffect(() => {
    LoadingMessageProvider.shuffleMessage();
  }, [Math.round(props.loadingPercentage / 15)]);

  return (
    <div className="loadingContainerDiv">
      <img
        className="loadingInnerImg"
        src="./assets/spaceMain/loading/loadingBackGround.png"
      ></img>
      <div className="loadingMessageContainerDiv">
        {props.message ? props.message : LoadingMessageProvider.message}
      </div>
      <img
        style={{
          left: `calc(50% + ${
            (progressBarWidth / 100) * props.loadingPercentage -
            (progressBarWidth / 2 + birdImgWidth / 2)
          }px`,
          width: birdImgWidth,
        }}
        className="loadingImg"
        src="./assets/spaceMain/loading/forestBird.png"
      ></img>
      <Progress
        showInfo={false}
        strokeColor={{from: '#C67100', to: '#53150D'}}
        className="loadingProgressBar"
        percent={props.loadingPercentage}
      ></Progress>
    </div>
  );
}

export default SpaceLoading;
