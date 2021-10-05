import {render} from '@testing-library/react';
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

    if (!canvasRef.current || !canvas2Ref.current) {
      console.error('canvas is not rendered error');
      return;
    }
    const canvas = canvasRef.current;
    const canvas2 = canvas2Ref.current;
    const gl = canvas.getContext('webgl');
    const gl2 = canvas2.getContext('webgl');
    if (!gl || !gl2) {
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
      canvas2Ref.current!.getContext('webgl')!,
      new Camera(
        {width: canvas.clientWidth, height: canvas.clientHeight},
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
      gLHelper2.updateFromCavnas(canvas2);
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

  const onClickTest = () => {
    const image = new Image();
    image.src = './assets/spaceMain/background/seaAndMountainVer1.png';
    const ctx = gLHelper2?.gl.canvas.getContext('2d');
    ctx?.drawImage(image, 0, 0, 1000, 1000);
    // if (!gLHelper2) return;
    // gLHelper2.gl.enable(gLHelper2.gl.SCISSOR_TEST);
    // gLHelper2.gl.scissor(0, 0, 1000, 1000);
    // gLHelper2.gl.clearColor(0, 0, 1, 1);
    // gLHelper2.gl.clear(gLHelper2.gl.COLOR_BUFFER_BIT);
  };
  useEffect(() => {
    if (!isLoading(loadStatus) || !gLHelper || !gLHelper2) {
      return;
    }
    const peerManager = props.peerManager;
    // test
    gLHelper2.drawObjectsBeforeAvatar();

    //계속해서 화면에 장면을 그려줌
    const requestAnimation = () => {
      gLHelper.camera.updateCenterPosFromPlayer(peerManager.me);
      peerManager.me.update(gLHelper);

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
      <canvas className="space-canvas" ref={canvasRef} />
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
      <canvas ref={canvas2Ref}></canvas>
      <button onClick={onClickTest}>x</button>
      <canvas ref={canvas3Ref}></canvas>
      <button>xx</button>
      <img
        src="./assets/spaceMain/background/seaAndMountainVer1.png"
        width="1000px"
        height="1000px"
      ></img>
    </>
  );
}

export default SpaceCanvas;
