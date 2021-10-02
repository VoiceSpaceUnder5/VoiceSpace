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
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    if (!canvasRef.current) {
      console.error('canvas is not rendered error');
      return;
    }
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('getContext webgl error');
      return;
    }
    const imageInfoProvider = new ImageInfoProvider(
      gl,
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
    setGLHelper(glHelper);

    const resizeEventHandler = () => {
      glHelper.updateFromCavnas(canvas);
    };
    resizeEventHandler();
    window.addEventListener('resize', resizeEventHandler);
    return () => {
      window.removeEventListener('resize', resizeEventHandler);
    };
  }, []);

  useEffect(() => {
    if (!isLoading(loadStatus) || !gLHelper) {
      return;
    }
    const peerManager = props.peerManager;

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
      <canvas ref={canvasRef} />
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
    </>
  );
}

export default SpaceCanvas;
