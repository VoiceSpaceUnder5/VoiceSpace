import React, {useRef, useState, useEffect} from 'react';
import ImageInfoProvider from '../utils/ImageInfoProvider';
import PeerManager from '../utils/RTCGameUtils';
import GLHelper, {Camera} from '../utils/webGLUtils';
import Joystick from './Joystick';

interface SpaceCanvasProps {
  peerManager: PeerManager;
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

  // called only once
  useEffect(() => {
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
    const imageInfoProvider = new ImageInfoProvider(gl, setLoadStatus);
    const glHelper = new GLHelper(
      gl,
      new Camera(
        {width: canvas.clientWidth, height: canvas.clientHeight},
        {x: 1200, y: 1200},
        {width: 2400, height: 2400},
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
      const data = JSON.stringify(peerManager.me.getIPlayer());
      peerManager.peers.forEach(peer => {
        if (peer.dc.readyState === 'open') peer.dc.send(data);
        gLHelper.drawAvatar(peer, peer.div);
        peer.updateSoundFromVec2(peerManager.me.centerPos);
      });
      gLHelper.drawAvatar(peerManager.me, peerManager.me.div);
      gLHelper.drawObjectsAfterAvatar(peerManager.me.centerPos);
      requestAnimationFrame(requestAnimation);
    };
    requestAnimationFrame(requestAnimation);
  }, [loadStatus]);

  return (
    <>
      <canvas ref={canvasRef} />
      {gLHelper ? (
        <Joystick peerManager={props.peerManager} camera={gLHelper.camera} />
      ) : null}
      {!isLoading(loadStatus) ? (
        <div id="divLoad">{getPercentageFromLoadStatus(loadStatus)}</div>
      ) : null}
    </>
  );
}

export default SpaceCanvas;
