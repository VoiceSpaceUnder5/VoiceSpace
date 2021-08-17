import {useEffect, useRef} from 'react';
import {RouteComponentProps} from 'react-router-dom';
import ImageInfoProvider from './ImageInfos';
import GLHelper, {DrawInfo, Camera} from './webGLUtils';
import io from 'socket.io-client';
import PeerManager, {IPlayer} from './RTCGameUtils';
import Navigation from './Navigation';

const qs = require('query-string');

interface SpaceMainQuery {
  roomId: string;
  nickname: string;
  avatarIdx: number;
}

const SpaceMain = (props: RouteComponentProps) => {
  const query = qs.parse(props.location.search) as SpaceMainQuery; // URL에서 쿼리 부분 파싱하여 roomId, nickname, avatarIdx 를 가진 SpaceMainQuery 객체에 저장
  const canvasRef = useRef<HTMLCanvasElement>(null); //canvas DOM 선택하기
  const peerManagerRef = useRef<PeerManager>();

  // 랜더링할 때 처음 한번만 실행.
  useEffect(() => {
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
    const imageInfoProvider = new ImageInfoProvider(gl, 0); // image와 관련된 정보들을 모두 저장
    if (!imageInfoProvider) {
      console.error('makeImageInfoProvider fail');
      return;
    }

    //카메라 객체 초기화
    const camera = new Camera(
      canvas.clientWidth,
      canvas.clientHeight,
      canvas.clientWidth / 2,
      canvas.clientHeight / 2,
      1,
      0,
      imageInfoProvider.background,
    );

    //webGL관련 작업 처리(그리기 전 준비 끝리
    const glHelper = new GLHelper(
      gl,
      window.innerWidth,
      window.innerHeight,
      camera,
    );
    if (!glHelper) {
      console.error('make GLHelper fail');
      return;
    }

    //내 오디오 연결 가져오고,
    navigator.mediaDevices
      .getUserMedia({video: false, audio: true}) // 오디오 연결
      .then((stream: MediaStream) => {
        const audioContainer = document.querySelector('#audioContainer');
        if (!audioContainer) {
          console.error('audioContainer can not found');
          return;
        }
        // 이름표
        const divContainer = document.querySelector(
          '#divContainer',
        ) as HTMLDivElement;
        if (!divContainer) {
          console.error('divContainer can not found');
          return;
        }
        // 백엔드와 연결, socket을 통해 백엔드와 소통
        // const socket = io("http://localhost:8080");
        const socket = io('https://under5.site:8080');
        if (!socket) {
          console.error('socket connection fail');
          return;
        }

        // 나, 너 그리고 우리를 관리하는 객체
        peerManagerRef.current = new PeerManager(
          socket,
          stream,
          query.nickname,
          query.avatarIdx,
          audioContainer,
          divContainer,
          {
            x: imageInfoProvider.background.width / 2,
            y: imageInfoProvider.background.height / 2,
          },
          query.roomId,
        );
        const peerManager = peerManagerRef.current;

        if (peerManager === undefined) {
          console.error("PeerManager undefined");
          return;
        }

        // 배경을 그리기 위해 필요한 정보
        const backgroundDrawInfo: DrawInfo = {
          tex: imageInfoProvider.background.tex,
          width: imageInfoProvider.background.width,
          height: imageInfoProvider.background.height,
          centerPosX: imageInfoProvider.background.width / 2,
          centerPosY: imageInfoProvider.background.height / 2,
          centerPositionPixelOffsetX: 0,
          centerPositionPixelOffsetY: 0,
          scale: 1,
          rotateRadian: 0,
        };
        // webGL에서 이미지 처리하는 거 여깄음ㅋ
        const drawBackround = () => glHelper.drawImage(backgroundDrawInfo);

        /////////////////////////////////////////////////
        // event setting start //////////////////////////
        window.addEventListener('resize', e => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          glHelper.projectionWidth = window.innerWidth;
          glHelper.projectionHeight = window.innerHeight;
          glHelper.gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
          camera.width = window.innerWidth;
          camera.height = window.innerHeight;
          camera.centerPosX = window.innerWidth / 2;
          camera.centerPosY = window.innerHeight / 2;
        });

        window.addEventListener('keydown', e => {
          if (e.key === '+') {
            camera.upScale(0.1);
          } else if (e.key === '-') {
            camera.upScale(-0.1);
          }
        });
        //for Desktop
        divContainer.addEventListener('mousedown', e => {
          e.preventDefault();
          peerManager.me.isMoving = true;
          peerManager.me.touchStartPos = {
            x: e.clientX,
            y: e.clientY,
          };
        });

        divContainer.addEventListener('mousemove', e => {
          e.preventDefault();
          peerManager.me.touchingPos = {
            x: e.clientX,
            y: e.clientY,
          };
        });

        divContainer.addEventListener('mouseup', e => {
          e.preventDefault();
          peerManager.me.isMoving = false;
        });

        //for Phone
        divContainer.addEventListener('touchstart', e => {
          e.preventDefault();
          peerManager.me.isMoving = true;
          peerManager.me.touchStartPos = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
          };
        });

        divContainer.addEventListener('touchmove', e => {
          e.preventDefault();
          peerManager.me.touchingPos = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
          };
        });

        divContainer.addEventListener('touchend', e => {
          e.preventDefault();
          peerManager.me.isMoving = false;
        });

        //계속해서 화면에 장면을 그려줌
        const requestAnimation = () => {
          drawBackround();
          peerManager.me.update(Date.now() - peerManager.lastUpdateTimeStamp);
          peerManager.peers.forEach((peer) => {
            if (peer.dc.readyState === "open")
              peer.dc.send(JSON.stringify(peerManager.me));
            glHelper.drawAnimal(imageInfoProvider, peer, peer.div);
            peer.updateSoundFromVec2(peerManager.me.centerPos);
          });
          peerManager.lastUpdateTimeStamp = Date.now();
          camera.updateCenterPosFromPlayer(peerManager.me);
          glHelper.drawAnimal(
            imageInfoProvider,
            peerManager.me,
            peerManager.me.div
          );
          requestAnimationFrame(requestAnimation);
        };
        peerManager.lastUpdateTimeStamp = Date.now();
        requestAnimationFrame(requestAnimation);
      })
      .catch(error => {
        console.error(`mediaStream error :${error.toString()}`);
      });
  }, []);

  const onClickMicOnOff = (on: boolean) => {
    if (peerManagerRef.current !== undefined) {
      peerManagerRef.current.localStream.getAudioTracks()[0].enabled = on;
    }
  };

  return (
    <>
      <canvas
        width={window.innerWidth.toString() + 'px'}
        height={window.innerHeight.toString() + 'px'}
        ref={canvasRef}
      ></canvas>
      <div id="divContainer"></div>
      <div id="audioContainer" style={{ width: "0", height: "0" }}></div>
      <Navigation
        peerManager={peerManagerRef.current}
        myMicToggle={onClickMicOnOff}
      />
    </>
  );
};

export default SpaceMain;
