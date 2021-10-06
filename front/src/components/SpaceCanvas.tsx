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
  return 100 * Math.round(loadStatus.finishLoad / loadStatus.needToLoad);
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
  const [gLHelper2, setGLHelper2] = useState<GLHelper | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvas2Ref = useRef<HTMLCanvasElement>(null);
  const canvas3Ref = useRef<HTMLCanvasElement>(null);
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

    if (!canvasRef.current || !canvas2Ref.current || !canvas3Ref.current) {
      console.error('canvas is not rendered error');
      return;
    }
    const canvas = canvasRef.current;
    const canvas2 = canvas2Ref.current;
    const canvas3 = canvas3Ref.current;
    const gl = canvas.getContext('webgl');
    const gl2 = canvas2.getContext('webgl', {preserveDrawingBuffer: true});
    const gl3 = canvas3?.getContext('2d');
    if (!gl || !gl2 || !gl3) {
      console.error('getContext webgl error');
      return;
    }
    const imageInfoProvider = new ImageInfoProvider(
      gl,
      setLoadStatus,
      props.mapMakingInfo,
    );
    const imageInfoProvider2 = new ImageInfoProvider(
      gl2,
      setLoadStatus,
      props.mapMakingInfo,
    );
    const glHelper = new GLHelper(
      gl,
      new Camera(
        {width: canvas.clientWidth, height: canvas.clientHeight},
        {...props.mapMakingInfo.respawnPosition},
        {...props.mapMakingInfo.backgroundSize},
      ),
      imageInfoProvider,
    );
    const gLHelper2 = new GLHelper(
      gl2,
      new Camera(
        {width: canvas2.clientWidth, height: canvas2.clientHeight},
        {...props.mapMakingInfo.respawnPosition},
        {...props.mapMakingInfo.backgroundSize},
      ),
      imageInfoProvider2,
    );

    setGLHelper(glHelper);
    setGLHelper2(gLHelper2);
    const resizeEventHandler = () => {
      if (!gLHelper2) return;
      glHelper.updateFromCavnas(canvas);
      canvas3.width = canvas3.clientWidth;
      canvas3.height = canvas3.clientHeight;
    };
    resizeEventHandler();
    window.addEventListener('resize', resizeEventHandler);

    const unLoadEventHandler = () => {
      props.peerManager.close();
    };
    window.addEventListener('beforeunload', unLoadEventHandler);
    return () => {
      window.removeEventListener('resize', resizeEventHandler);
      window.removeEventListener('beforeunload', unLoadEventHandler);
    };
  }, []);

  const drawBackgroundFromBuffer = (xNumber: number) => {
    if (!gLHelper) return;
    const centerX = gLHelper.camera.centerPos.x;
    const centerY = gLHelper.camera.centerPos.y;
    const cameraWidth = gLHelper.camera.originSize.width;
    const cameraHeight = gLHelper.camera.originSize.height;
    const leftTopX = centerX - cameraWidth / 2;
    const leftTopY = centerY - cameraHeight / 2;
    const gl3 = canvas3Ref.current?.getContext('2d');
    const canvas2 = canvas2Ref.current;

    if (gl3 && canvas2) {
      gl3.drawImage(
        canvas2,
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

  let count = 0;
  useEffect(() => {
    if (!isLoading(loadStatus) || !gLHelper || !gLHelper2) {
      return;
    }
    const peerManager = props.peerManager;
    // test
    gLHelper2.drawObjectsBeforeAvatar();
    // gLHelper2.gl.canvas.getContext('2d')?.save();
    //계속해서 화면에 장면을 그려줌
    const requestAnimation = () => {
      gLHelper.camera.updateCenterPosFromPlayer(peerManager.me);
      peerManager.me.update(gLHelper);

      drawBackgroundFromBuffer(count++);
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
      <canvas className="spaceCanvas" ref={canvasRef} />
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
        <div id="divLoad">{getPercentageFromLoadStatus(loadStatus)}</div>
      ) : null}
      <button>x</button>
      <canvas className="spaceCanvas" ref={canvas3Ref}></canvas>
      <button>x</button>
      <canvas width={2400} height={2400} ref={canvas2Ref}></canvas>
      <button>xx</button>
    </>
  );
}

export default SpaceCanvas;
