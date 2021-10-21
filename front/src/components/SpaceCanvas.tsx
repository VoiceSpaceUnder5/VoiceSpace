import React, {useEffect, useRef} from 'react';
import {GameData} from '../utils/pixiUtils/GameData';
import {
  pixiCanvasDestroy,
  pixiCanvasStart,
} from '../utils/pixiUtils/PixiCanvas';
import {SceneManager} from '../utils/pixiUtils/SceneManager';
import PeerManager, {PlayerDto, Peer, DataDtoType} from '../utils/RTCGameUtils';

interface spaceCanvasProps {
  peerManager: PeerManager;
}

function SpaceCanvas(props: spaceCanvasProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    props.peerManager.setDataChannelEventHandler(
      DataDtoType.PLAYER_INFO,
      (playerDto: PlayerDto, peer: Peer) => {
        peer.update(playerDto);
      },
    );
    // pixi Start
    SceneManager.changeCanvas(canvasRef.current);
    GameData.setPeerManager(props.peerManager);
    pixiCanvasStart();
    return () => {
      props.peerManager.close();
      pixiCanvasDestroy();
    };
  }, []);
  return <canvas ref={canvasRef}></canvas>;
}

export default SpaceCanvas;
