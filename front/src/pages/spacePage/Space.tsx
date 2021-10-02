import React, {useEffect, useRef, useState} from 'react';
import {RouteComponentProps} from 'react-router-dom';
import io from 'socket.io-client';
import PeerManager, {AudioAnalyser, Me, Vec2} from '../../utils/RTCGameUtils';
import Navigation from '../../components/Navigation';
import {
  AvatarImageEnum,
  seaAndMountainMap1MMI,
} from '../../utils/ImageMetaData';
import SpaceCanvas from '../../components/SpaceCanvas';
import './space.css';
import {message} from 'antd';
import RTCSignalingHelper from '../../utils/RTCSignalingHelper';
import {iceConfig} from '../../utils/IceServerList';

const qs = require('query-string');

interface SpaceQuery {
  roomId: string;
  nickname: string;
  avatarIdx: number;
  isNew: boolean;
  worldMapIdx: number;
}

export interface LoadingInfo {
  needToLoad: number;
  finishLoad: number;
}

function setNewPeerManager(
  nicknameContainer: HTMLDivElement,
  audioContainer: HTMLDivElement,
  query: SpaceQuery,
  initialCenterPos: Vec2,
  successCallBack: (arg0: PeerManager) => void,
  failCallBack: () => void,
): void {
  navigator.mediaDevices
    .getUserMedia({video: false, audio: true}) // 오디오 연결
    .then((stream: MediaStream) => {
      const socket = io(`${process.env.REACT_APP_SOCKET_URL}`);
      if (!socket) {
        failCallBack();
        return;
      }
      socket.on('connect', () => {
        const signalingHelper = new RTCSignalingHelper(socket);
        const audioAnalyser = new AudioAnalyser(stream);
        const nicknameDiv = document.createElement('div') as HTMLDivElement;
        nicknameDiv.className = 'canvasOverlay';
        nicknameContainer.appendChild(nicknameDiv);

        const textMessageDiv = document.createElement('div') as HTMLDivElement;
        textMessageDiv.className = 'canvasOverlay';
        nicknameContainer.appendChild(textMessageDiv);

        const me = new Me(
          nicknameDiv,
          textMessageDiv,
          audioAnalyser,
          initialCenterPos,
          query.nickname,
          '',
          query.avatarIdx,
        );

        const peerManager = new PeerManager(
          signalingHelper,
          stream,
          audioContainer,
          nicknameContainer,
          iceConfig,
          query.roomId,
          me,
        );
        successCallBack(peerManager);
        console.log('socket connected');
      });
    })
    .catch(() => {
      failCallBack();
    });

  return;
}

function Space(props: RouteComponentProps): JSX.Element {
  //query validate part
  const query = qs.parse(props.location.search) as SpaceQuery; // URL에서 쿼리 부분 파싱하여 roomId, nickname, avatarIdx 를 가진 SpaceMainQuery 객체에 저장
  const mapMakingInfo = seaAndMountainMap1MMI; // 추후 query.worldMapIdx 값에 따라 변경되는 코드로 작성.
  if (!query.roomId || query.roomId === '') {
    message.info('올바르지 않은 접근입니다. roomId를 확인해 주세요.');
    props.history.push('/');
  }
  if (!query.nickname || query.nickname === '') query.nickname = '익명의 곰';
  if (!query.avatarIdx) query.avatarIdx = AvatarImageEnum.BROWN_BEAR;

  //ref
  const divContainerRef = useRef<HTMLDivElement>(null);
  const audioContainerRef = useRef<HTMLDivElement>(null);

  //state
  const [peerManager, setPeerManager] = useState<PeerManager | null>(null);

  //useEffect onMounted
  useEffect(() => {
    if (!divContainerRef.current || !audioContainerRef.current) {
      console.error('can not find div,audio Container error');
      return;
    }
    setNewPeerManager(
      divContainerRef.current,
      audioContainerRef.current,
      query,
      {...mapMakingInfo.respawnPosition},
      (peerManager: PeerManager) => {
        if (query.isNew)
          message.info(
            '새로운 채팅방에 입장하셨습니다. 링크를 복사하여 친구들을 초대해보세요!',
          );
        setPeerManager(peerManager);
      },
      () => {
        console.error('setNewPeerManager error');
      },
    );
    return () => {
      if (peerManager) peerManager.close();
    };
  }, []);

  const goToHome = () => {
    props.history.push('/');
  };

  return (
    <>
      {peerManager ? (
        <>
          <SpaceCanvas
            peerManager={peerManager}
            mapMakingInfo={mapMakingInfo}
          />
          <Navigation peerManager={peerManager} goToHome={goToHome} />
        </>
      ) : (
        '오디오를 가져오고 서버와 소켓을 연결하는 중입니다. 조금만 기다려주세요. 이상태가 지속 될 경우 깃허브에 버그리폿 해주시면 감사하겠습니다.'
      )}
      <div id="divContainer" ref={divContainerRef}></div>
      <div
        id="audioContainer"
        ref={audioContainerRef}
        style={{width: '0', height: '0'}}
      ></div>
    </>
  );
}

export default Space;
