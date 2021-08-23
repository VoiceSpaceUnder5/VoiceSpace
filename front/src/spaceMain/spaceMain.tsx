import React, {useEffect, useRef, useContext, useState} from 'react';
import {RouteComponentProps} from 'react-router-dom';
import ImageInfoProvider from './ImageInfoProvider';
import GLHelper, {Camera, isInRect} from './webGLUtils';
import io from 'socket.io-client';
import PeerManager from './RTCGameUtils';
import Navigation from './Navigation';
import {AvatarImageEnum, LayerLevelEnum} from './ImageMetaData';
import Joystick from './Joystick';
import './spaceMain.css';
import GlobalContext from './GlobalContext';
import {message} from 'antd';

const qs = require('query-string');

interface SpaceMainQuery {
  roomId: string;
  nickname: string;
  avatarIdx: number;
}

export interface LoadingInfo {
  needToLoad: number;
  finishLoad: number;
}

const SpaceMain = (props: RouteComponentProps) => {
  //query validate part
  const query = qs.parse(props.location.search) as SpaceMainQuery; // URL에서 쿼리 부분 파싱하여 roomId, nickname, avatarIdx 를 가진 SpaceMainQuery 객체에 저장
  if (!query.roomId || query.roomId === '') {
    message.info('올바르지 않은 접근입니다. roomId를 확인해 주세요.');
    props.history.push('/');
  }
  if (!query.nickname || query.nickname === '') query.nickname = '익명의 곰';
  if (!query.avatarIdx) query.avatarIdx = AvatarImageEnum.BROWN_BEAR;
  // useRef
  const canvasRef = useRef<HTMLCanvasElement>(null); //canvas DOM 선택하기
  const imageInfoProviderRef = useRef<ImageInfoProvider | null>(null);
  const peerManagerRef = useRef<PeerManager>();
  const divContainerRef = useRef<HTMLDivElement>(null);
  const audioContainerRef = useRef<HTMLDivElement>(null);
  // useContext
  const globalContext = useContext(GlobalContext);

  // useState
  const [loadStatus, setLoadStatus] = useState<LoadingInfo>({
    needToLoad: 0,
    finishLoad: 0,
  });
  const [canStart, setCanStart] = useState(false);

  globalContext.initialInfo = [query.avatarIdx, query.nickname];

  // 랜더링할 때 처음 한번만 실행.
  const onProfileChangeButtonClick = (
    newAvatarIdx: number,
    newNickname: string,
  ) => {
    if (peerManagerRef.current !== undefined) {
      peerManagerRef.current.me.avatar = newAvatarIdx;
      peerManagerRef.current.me.div.innerText = newNickname;
      peerManagerRef.current.me.nickname = newNickname;
    }
  };

  const isLoading = (): boolean => {
    if (
      loadStatus.finishLoad > 0 &&
      loadStatus.needToLoad === loadStatus.finishLoad
    )
      return false;
    return true;
  };

  // joystick 까지 모든 하위 컴포넌트들이 랜더링 된 후 동작
  useEffect(() => {
    if (
      !canStart ||
      !globalContext.camera ||
      !globalContext.peerManager ||
      !imageInfoProviderRef.current
    )
      return;
    console.log('useEffect, canStart called. canvas rendering started!');

    const camera = globalContext.camera;
    const imageInfoProvider = imageInfoProviderRef.current;
    const peerManager = globalContext.peerManager;
    const gl = imageInfoProvider.gl;
    //webGL관련 작업 처리(그리기 전 준비 끝리
    const glHelper = new GLHelper(gl, camera);
    const background = imageInfoProvider.background!;
    if (!glHelper) {
      console.error('make GLHelper fail');
      return;
    }

    const drawObjectsBeforeAvatar = () => {
      glHelper.drawImage({...background, scale: 1, rotateRadian: 0});
      const temp = [0, 1, 2, 3];
      temp.forEach(key => {
        imageInfoProvider.objects.get(key)?.forEach(imageInfo => {
          glHelper.drawImage({
            ...imageInfo,
            scale: 1,
            rotateRadian: 0,
          });
        });
      });
    };

    const drawObjectsAfterAvatar = () => {
      const temp = [8, 9];
      temp.forEach(key => {
        imageInfoProvider.objects.get(key)?.forEach(imageInfo => {
          if (
            isInRect(
              imageInfo.centerPos,
              imageInfo.size,
              peerManager.me.centerPos,
            )
          ) {
            glHelper.transparency = 0.3;
          }

          glHelper.drawImage({
            ...imageInfo,
            scale: 1,
            rotateRadian: 0,
          });
          glHelper.transparency = 1.0;
        });
      });
    };

    //계속해서 화면에 장면을 그려줌
    const requestAnimation = () => {
      camera.updateCenterPosFromPlayer(peerManager.me);
      drawObjectsBeforeAvatar();
      peerManager.me.update(
        Date.now() - peerManager.lastUpdateTimeStamp,
        imageInfoProvider,
        glHelper,
      );
      peerManager.peers.forEach(peer => {
        if (peer.dc.readyState === 'open')
          peer.dc.send(JSON.stringify(peerManager.me));
        glHelper.drawAvatar(imageInfoProvider, peer, peer.div);
        peer.updateSoundFromVec2(peerManager.me.centerPos);
      });
      peerManager.lastUpdateTimeStamp = Date.now();
      glHelper.drawAvatar(
        imageInfoProvider,
        peerManager.me,
        peerManager.me.div,
      );
      drawObjectsAfterAvatar();
      requestAnimationFrame(requestAnimation);
    };
    peerManager.lastUpdateTimeStamp = Date.now();
    requestAnimationFrame(requestAnimation);
  }, [canStart]);

  // Image 들이 모두 로딩 된 후 동작
  useEffect(() => {
    if (isLoading() || !imageInfoProviderRef.current || !canvasRef.current)
      return;
    console.log('useEffect, after imageInfoProvider called');
    const canvas = canvasRef.current;
    const imageInfoProvider = imageInfoProviderRef.current;
    const gl = imageInfoProvider.gl;

    const background = imageInfoProvider.background!;
    if (!background) {
      console.error('background not loaded error');
      return;
    }

    //카메라 객체 초기화
    const camera = new Camera(
      {width: canvas.clientWidth, height: canvas.clientHeight},
      background.centerPos,
      background.size,
    );
    globalContext.camera = camera;

    //내 오디오 연결 가져오고,
    navigator.mediaDevices
      .getUserMedia({video: false, audio: true}) // 오디오 연결
      .then((stream: MediaStream) => {
        if (!audioContainerRef.current) {
          console.error('audioContainer can not found');
          return;
        }
        // 이름표
        if (!divContainerRef.current) {
          console.error('divContainer can not found');
          return;
        }
        // 백엔드와 연결, socket을 통해 백엔드와 소통
        const socket = io('https://under5.site:8080');
        if (!socket) {
          console.error('socket connection fail');
          return;
        }

        globalContext.peerManager = new PeerManager(
          socket,
          stream,
          query.nickname,
          query.avatarIdx,
          audioContainerRef.current,
          divContainerRef.current,
          {
            x: background.size.width / 2,
            y: background.size.height / 2,
          },
          query.roomId,
        );
        setCanStart(true);

        window.addEventListener('resize', e => {
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
          camera.originSize = {
            width: canvas.clientWidth,
            height: canvas.clientHeight,
          };
          camera.size = {...camera.originSize};
          camera.scale = 1;
          gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
        });
      })
      .catch(error => {
        console.error(`mediaStream error :${error.toString()}`);
      });
  }, [loadStatus]);

  // 최초 spaceMain 랜더링 이후 동작
  useEffect(() => {
    console.log('useEffect, loading called');
    if (!canvasRef.current) {
      console.error('set canvas HTML Error');
      return;
    }
    const canvas = canvasRef.current;
    // webgl을 사용하기 위해 Context를 가져옴 아몰랑
    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('getContext Error');
      return;
    }
    const imageInfoProvider = new ImageInfoProvider(gl, setLoadStatus); // image와 관련된 정보들을 모두 저장
    if (!imageInfoProvider) {
      console.error('makeImageInfoProvider fail');
      return;
    }
    imageInfoProviderRef.current = imageInfoProvider;

    return () => {
      if (globalContext.peerManager) {
        globalContext.peerManager.close();
      }
    };
  }, []);

  const onClickMicOnOff = (isOn: boolean) => {
    if (peerManagerRef.current !== undefined) {
      peerManagerRef.current.localStream.getAudioTracks()[0].enabled = isOn;
    }
  };

  const goToHome = () => {
    props.history.push('/');
  };

  return (
    <>
      <canvas
        width={window.innerWidth.toString() + 'px'}
        height={window.innerHeight.toString() + 'px'}
        ref={canvasRef}
      ></canvas>
      <div id="divContainer" ref={divContainerRef}></div>
      <div
        id="audioContainer"
        ref={audioContainerRef}
        style={{width: '0', height: '0'}}
      ></div>
      <Navigation
        initialInfo={[query.avatarIdx, query.nickname]}
        peerManager={peerManagerRef.current}
        myMicToggle={onClickMicOnOff}
        onProfileChange={onProfileChangeButtonClick}
        goToHome={goToHome}
      />
      {isLoading() ? (
        <div id="divLoad">{`Loading... : ${Math.round(
          (loadStatus.finishLoad / loadStatus.needToLoad) * 100,
        )}`}</div>
      ) : (
        <Joystick />
      )}
    </>
  );
};

export default SpaceMain;
