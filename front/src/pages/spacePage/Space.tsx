import React, {useEffect, useRef, useState} from 'react';
import {RouteComponentProps} from 'react-router-dom';
import io from 'socket.io-client';
import PeerManager, {AudioAnalyser, Me, Vec2} from '../../utils/RTCGameUtils';
import Navigation from '../../components/Navigation';
import SpaceCanvas from '../../components/SpaceCanvas';
import './space.css';
import {message} from 'antd';
import RTCSignalingHelper from '../../utils/RTCSignalingHelper';
import {iceConfig} from '../../utils/IceServerList';
import SpaceLoading from '../../components/SpaceLoading';
import AudioStreamHelper from '../../utils/AudioStreamHelper';

const qs = require('query-string');

interface SpaceQuery {
  roomId: string;
  nickname: string;
  avatarIdx: number;
}

export interface LoadingInfo {
  needToLoad: number;
  finishLoad: number;
}

function setNewPeerManager(
  spaceMainContainer: HTMLDivElement,
  audioContainer: HTMLDivElement,
  query: SpaceQuery,
  initialCenterPos: Vec2,
): void {
  const socket = io(`${process.env.REACT_APP_SOCKET_URL}`, {
    reconnection: false,
  });
  if (!socket) {
    return;
  }
  socket.on('connect', () => {
    const signalingHelper = new RTCSignalingHelper(socket);
    const nicknameDiv = document.createElement('div') as HTMLDivElement;
    nicknameDiv.className = 'canvasOverlay';
    spaceMainContainer.appendChild(nicknameDiv);

    const textMessageDiv = document.createElement('div') as HTMLDivElement;
    textMessageDiv.className = 'canvasOverlay';
    spaceMainContainer.appendChild(textMessageDiv);

    const me = new Me(
      nicknameDiv,
      textMessageDiv,
      initialCenterPos,
      query.nickname,
      '',
      Number(query.avatarIdx),
    );

    const peerManager = new PeerManager(
      signalingHelper,
      audioContainer,
      spaceMainContainer,
      iceConfig,
      query.roomId,
      me,
    );
  });
  return;
}

function isQueryValid(query: SpaceQuery) {
  if (!query.nickname || query.nickname === '') {
    return false;
  }
  if (!query.avatarIdx) {
    return false;
  }
  return true;
}

function Space(props: RouteComponentProps): JSX.Element {
  console.log(AudioStreamHelper.micDeviceId, AudioStreamHelper.speakerDeviceId);
  //state
  const [peerManager, setPeerManager] = useState<PeerManager | null>(null);
  //query validate part
  const query = qs.parse(props.location.search) as SpaceQuery; // URL에서 쿼리 부분 파싱하여 roomId, nickname, avatarIdx 를 가진 SpaceMainQuery 객체에 저장
  if (!query.roomId || query.roomId === '') {
    message.info('올바르지 않은 접근입니다. roomId를 확인해 주세요.');
    props.history.push('/');
  }
  if (!isQueryValid(query)) {
    props.history.push(`/setting?roomId=${query.roomId}`);
  }
  //ref
  const spaceMainContainerRef = useRef<HTMLDivElement>(null);
  const audioContainerRef = useRef<HTMLDivElement>(null);

  //useEffect onMounted
  useEffect(() => {
    if (!isQueryValid(query)) return;
    if (!spaceMainContainerRef.current || !audioContainerRef.current) {
      console.error('can not find div,audio Container error');
      return;
    }
    setNewPeerManager(
      spaceMainContainerRef.current,
      audioContainerRef.current,
      query,
      {x: 150, y: 150},
    );
    return () => {
      if (peerManager) peerManager.close();
    };
  }, []);

  const goToHome = () => {
    props.history.push('/');
  };

  return (
    <div id="spaceMainContainer" ref={spaceMainContainerRef}>
      {peerManager ? (
        <>
          <SpaceCanvas peerManager={peerManager} />
          <Navigation peerManager={peerManager} goToHome={goToHome} />
        </>
      ) : (
        <SpaceLoading
          loadingPercentage={0}
          message="오디오를 가져오고 서버와 연결 중"
        ></SpaceLoading>
      )}
      <div
        id="audioContainer"
        ref={audioContainerRef}
        style={{width: '0', height: '0'}}
      ></div>
    </div>
  );
}

export default Space;
