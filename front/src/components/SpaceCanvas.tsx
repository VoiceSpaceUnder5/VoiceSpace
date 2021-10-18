import React, {useRef, useState, useEffect} from 'react';
import ImageInfoProvider from '../utils/ImageInfoProvider';
import {MapMakingInfo, BodySize} from '../utils/ImageMetaData';
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
  // state
  const [loadStatus, setLoadStatus] = useState<LoadingInfo>({
    needToLoad: 0,
    finishLoad: 0,
  });
  const [aniNumber, setAniNumber] = useState(0);
  // ref
  const spaceCanvasRef = useRef<HTMLCanvasElement>(null);
  const savedGroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const groundCanvasRef = useRef<HTMLCanvasElement>(null);
  const gLHelperRef = useRef<GLHelper | null>(null);
  // function

  const setIsMoving = (isMoving: boolean) => {
    props.peerManager.me.isMoving = isMoving;
  };

  const setNextNormalizedDirectionVector = (dir: Vec2) => {
    props.peerManager.me.nextNormalizedDirectionVector = dir;
  };

  const setCameraScaleByPinch = (value: number) => {
    if (gLHelperRef.current) {
      gLHelperRef.current.camera.upScaleByPinch(value);
    }
  };

  const getCameraScale = (): number => {
    if (gLHelperRef.current) {
      return gLHelperRef.current.camera.scale;
    }
    return 0;
  };

  const resizeEventHandler = () => {
    if (
      gLHelperRef.current &&
      spaceCanvasRef.current &&
      groundCanvasRef.current
    ) {
      gLHelperRef.current.updateFromCavnas(spaceCanvasRef.current);
      groundCanvasRef.current.width = groundCanvasRef.current.clientWidth;
      groundCanvasRef.current.height = groundCanvasRef.current.clientHeight;
    }
  };

  const unLoadEventHandler = () => {
    props.peerManager.close();
  };

  const requestAnimation = () => {
    if (gLHelperRef.current) {
      const LegSize = BodySize.armLegSize.y / 2 + BodySize.armOffsetY;
      const gLHelper = gLHelperRef.current;
      const peerManager = props.peerManager;
      gLHelper.camera.updateCenterPosFromPlayer(peerManager.me);
      peerManager.me.update();

      drawBackgroundFromBuffer();
      gLHelper.resetAllDrawThings();
      const data: DataDto = {
        type: DataDtoType.PLAYER_INFO,
        data: peerManager.me.getPlayerDto(),
      };
      const transData = JSON.stringify(data);
      peerManager.forEachPeer(peer => {
        peer.transmitUsingDataChannel(transData);
        gLHelper.pushToDrawThings(2, peer.centerPos.y + LegSize, peer);
        peer.updateSoundFromVec2(peerManager.me.centerPos);
      });
      gLHelper.pushToDrawThings(
        2,
        peerManager.me.centerPos.y + LegSize,
        peerManager.me,
      );
      gLHelper.drawAll(peerManager.me.centerPos);
      setAniNumber(requestAnimationFrame(requestAnimation));
    }
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

    if (!spaceCanvasRef.current || !savedGroundCanvasRef.current) {
      console.error('canvas is not rendered error');
      return;
    }
    const spaceCanvas = spaceCanvasRef.current;
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
    gLHelperRef.current = new GLHelper(
      gl,
      new Camera(
        {width: spaceCanvas.clientWidth, height: spaceCanvas.clientHeight},
        {...props.mapMakingInfo.respawnPosition},
        {...props.mapMakingInfo.backgroundSize},
      ),
      imageInfoProvider,
    );
    resizeEventHandler();
    window.addEventListener('resize', resizeEventHandler);
    window.addEventListener('beforeunload', unLoadEventHandler);
    return () => {
      props.peerManager.close();
      window.removeEventListener('resize', resizeEventHandler);
      window.removeEventListener('beforeunload', unLoadEventHandler);
    };
  }, []);

  const drawBackgroundFromBuffer = () => {
    if (!gLHelperRef.current) return;
    const centerX = gLHelperRef.current.camera.centerPos.x;
    const centerY = gLHelperRef.current.camera.centerPos.y;
    const cameraWidth = gLHelperRef.current.camera.originSize.width;
    const cameraHeight = gLHelperRef.current.camera.originSize.height;
    const leftTopX = centerX - cameraWidth / 2;
    const leftTopY = centerY - cameraHeight / 2;
    const gl = groundCanvasRef.current?.getContext('2d');
    const savedGroundCanvas = savedGroundCanvasRef.current;

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
    backgroundImage.src = './assets/spaceMain/background/forestVer1.png';
    const savedGroundCanvas = savedGroundCanvasRef.current;
    if (!savedGroundCanvas) return;
    const gl2 = savedGroundCanvas.getContext('2d');
    if (!gl2) return;
    gl2.drawImage(backgroundImage, 0, 0);
    if (!isLoading(loadStatus) || !gLHelperRef.current) {
      return;
    }
    gLHelperRef.current.imageInfoProvider.objects.forEach(object => {
      if (gLHelperRef.current)
        gLHelperRef.current.pushToDrawThings(
          1,
          object.centerPos.y + object.size.height / 2,
          object,
        );
    });

    setAniNumber(requestAnimationFrame(requestAnimation));
    return () => {
      cancelAnimationFrame(aniNumber);
      gLHelperRef.current = null;
    };
  }, [loadStatus]);

  return (
    <>
      <canvas id="game-canvas"></canvas>
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
      {gLHelperRef.current ? (
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
        width={3072}
        height={3072}
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
