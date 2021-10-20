import React, {useEffect} from 'react';
import {GameData} from '../utils/pixiUtils/GameData';
import {
  pixiCanvasDestroy,
  pixiCanvasStart,
} from '../utils/pixiUtils/PixiCanvas';
import PeerManager, {PlayerDto, Peer, DataDtoType} from '../utils/RTCGameUtils';

interface spaceCanvasProps {
  peerManager: PeerManager;
}

function SpaceCanvas(props: spaceCanvasProps): JSX.Element {
  useEffect(() => {
    props.peerManager.setDataChannelEventHandler(
      DataDtoType.PLAYER_INFO,
      (playerDto: PlayerDto, peer: Peer) => {
        peer.update(playerDto);
      },
    );
    GameData.setPeerManager(props.peerManager);
    pixiCanvasStart();
    return () => {
      props.peerManager.close();
      pixiCanvasDestroy();
    };
  }, []);
  return <canvas id="game-canvas"></canvas>;
}

export default SpaceCanvas;
