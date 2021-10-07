import React, {useRef, useState, useEffect} from 'react';
import ImageInfoProvider from '../utils/ImageInfoProvider';
import {MapMakingInfo} from '../utils/ImageMetaData';
import PeerManager, {
  DataDto,
  DataDtoType,
  Peer,
  PlayerDto,
  Vec2,
} from '../utils/RTCGameUtils';
import GLHelper, {Camera} from '../utils/webGLUtils';
import Joystick from './Joystick';
import SpaceLoading from './SpaceLoading';

interface SpaceCanvasProps {
  peerManager: PeerManager;
  mapMakingInfo: MapMakingInfo;
}

export interface LoadingInfo {
  needToLoad: number;
  finishLoad: number;
}

function getPercentageFromLoadStatus(loadStatus: LoadingInfo): number {
  if (!loadStatus.needToLoad) return 0;
  return Math.floor((loadStatus.finishLoad / loadStatus.needToLoad) * 100);
}

function isLoading(loadStatus: LoadingInfo): boolean {
  if (!loadStatus.needToLoad) return false;
  if (loadStatus.needToLoad === loadStatus.finishLoad) return true;
  return false;
}

function SpaceCanvas(props: SpaceCanvasProps): JSX.Element {
  //state
  const [loadStatus, setLoadStatus] = useState<LoadingInfo>({
    needToLoad: 0,
    finishLoad: 0,
  });
  const [gLHelper, setGLHelper] = useState<GLHelper | null>(null);

  const spaceCanvasRef = useRef<HTMLCanvasElement>(null);
  const savedGroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const groundCanvasRef = useRef<HTMLCanvasElement>(null);
  // function
  const setIsMoving = (isMoving: boolean) => {
    props.peerManager.me.isMoving = isMoving;
  };

  const setNextNormalizedDirectionVector = (dir: Vec2) => {
    props.peerManager.me.nextNormalizedDirectionVector = dir;
  };

  const setCameraScaleByPinch = (value: number) => {
    if (gLHelper) {
      gLHelper.camera.upScaleByPinch(value);
    }
  };

  const getCameraScale = (): number => {
    if (gLHelper) {
      return gLHelper.camera.scale;
    }
    return 0;
  };
  // called only once
  useEffect(() => {
    // peerManager event add
    props.peerManager.setDataChannelEventHandler(
      DataDtoType.PLAYER_INFO,
      (playerDto: PlayerDto, peer: Peer) => {
        peer.update(playerDto);
      },
    );

    if (
      !spaceCanvasRef.current ||
      !savedGroundCanvasRef.current ||
      !groundCanvasRef.current
    ) {
      console.error('canvas is not rendered error');
      return;
    }
    const spaceCanvas = spaceCanvasRef.current;
    const groundCanvas = groundCanvasRef.current;
    const gl = spaceCanvas.getContext('webgl');
    if (!gl) {
      console.error('getContext webgl error');
      return;
    }
    //test
    const imageInfoProvider = new ImageInfoProvider(
      gl,
      setLoadStatus,
      props.mapMakingInfo,
    );
    const glHelper = new GLHelper(
      gl,
      new Camera(
        {width: spaceCanvas.clientWidth, height: spaceCanvas.clientHeight},
        {...props.mapMakingInfo.respawnPosition},
        {...props.mapMakingInfo.backgroundSize},
      ),
      imageInfoProvider,
    );

    setGLHelper(glHelper);
    const resizeEventHandler = () => {
      glHelper.updateFromCavnas(spaceCanvas);
      groundCanvas.width = groundCanvas.clientWidth;
      groundCanvas.height = groundCanvas.clientHeight;
    };
    resizeEventHandler();
    window.addEventListener('resize', resizeEventHandler);

    const unLoadEventHandler = () => {
      props.peerManager.close();
    };
    window.addEventListener('beforeunload', unLoadEventHandler);
    return () => {
      props.peerManager.close();
      window.removeEventListener('resize', resizeEventHandler);
      window.removeEventListener('beforeunload', unLoadEventHandler);
    };
  }, []);

  const drawBackgroundFromBuffer = (savedGroundCanvas: HTMLCanvasElement) => {
    if (!gLHelper) return;
    const centerX = gLHelper.camera.centerPos.x;
    const centerY = gLHelper.camera.centerPos.y;
    const cameraWidth = gLHelper.camera.originSize.width;
    const cameraHeight = gLHelper.camera.originSize.height;
    const leftTopX = centerX - cameraWidth / 2;
    const leftTopY = centerY - cameraHeight / 2;
    const gl = groundCanvasRef.current?.getContext('2d');

    // console.log(`width: ${cameraWidth}, height: ${cameraHeight}`);
    if (gl && savedGroundCanvas) {
      if (!groundCanvasRef.current) return;
      gl.clearRect(
        0,
        0,
        groundCanvasRef.current.clientWidth,
        groundCanvasRef.current.clientHeight,
      );
      gl.drawImage(
        savedGroundCanvas,
        leftTopX,
        leftTopY,
        cameraWidth,
        cameraHeight,
        0,
        0,
        cameraWidth,
        cameraHeight,
      );
    }
  };

  useEffect(() => {
    // background savedGroundCanvas에 따로 저장.
    const backgroundImage = new Image();
    backgroundImage.src =
      './assets/spaceMain/background/seaAndMountainVer1.png';
    const savedGroundCanvas = savedGroundCanvasRef.current;
    if (!savedGroundCanvas) return;
    const gl2 = savedGroundCanvas.getContext('2d');
    if (!gl2) return;
    gl2.drawImage(backgroundImage, 0, 0);
    if (!isLoading(loadStatus) || !gLHelper) {
      return;
    }
    const peerManager = props.peerManager;
    //화면에 장면을 그려줌
    const requestAnimation = () => {
      gLHelper.camera.updateCenterPosFromPlayer(peerManager.me);
      peerManager.me.update(gLHelper);

      drawBackgroundFromBuffer(savedGroundCanvas);
      gLHelper.drawObjectsBeforeAvatar();
      const data: DataDto = {
        type: DataDtoType.PLAYER_INFO,
        data: peerManager.me.getPlayerDto(),
      };
      const transData = JSON.stringify(data);
      peerManager.forEachPeer(peer => {
        peer.transmitUsingDataChannel(transData);
        gLHelper.drawAvatar(peer, peer.nicknameDiv, peer.textMessageDiv);
        peer.updateSoundFromVec2(peerManager.me.centerPos);
      });
      gLHelper.drawAvatar(
        peerManager.me,
        peerManager.me.nicknameDiv,
        peerManager.me.textMessageDiv,
      );
      gLHelper.drawObjectsAfterAvatar(peerManager.me.centerPos);
      requestAnimationFrame(requestAnimation);
    };
    requestAnimationFrame(requestAnimation);
  }, [loadStatus]);

  return (
    <>
      <canvas
        className="spaceCanvas"
        ref={groundCanvasRef}
        style={{position: 'absolute', left: '0px', top: '0px', zIndex: -10}}
      ></canvas>
      <canvas
        className="spaceCanvas"
        ref={spaceCanvasRef}
        // style={{position: 'absolute', left: '0px', top: '0px'}}
      />
      {gLHelper ? (
        <Joystick
          setIsMoving={setIsMoving}
          setNextNormalizedDirectionVector={setNextNormalizedDirectionVector}
          setCameraScaleByPinch={setCameraScaleByPinch}
          getCameraScale={getCameraScale}
          divContainer={props.peerManager.nicknameContainer}
        />
      ) : null}
      {!isLoading(loadStatus) ? (
        <div id="divLoad">
          <SpaceLoading
            loadingPercentage={getPercentageFromLoadStatus(loadStatus)}
          ></SpaceLoading>
        </div>
      ) : null}
      <canvas
        width={2400}
        height={2400}
        ref={savedGroundCanvasRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          visibility: 'hidden',
          // display: 'none',
        }}
      ></canvas>
    </>
  );
}

export default SpaceCanvas;
