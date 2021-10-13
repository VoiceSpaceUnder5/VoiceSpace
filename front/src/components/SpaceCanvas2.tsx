import React, {useEffect} from 'react';
import {GameData} from '../utils/pixiUtils/GameData';
import {pixiCanvasStart} from '../utils/pixiUtils/pixiCanvasStart';
import PeerManager, {PlayerDto, Peer, DataDtoType} from '../utils/RTCGameUtils';

interface spaceCanvasProps {
  peerManager: PeerManager;
}

function SpaceCanvas2(props: spaceCanvasProps): JSX.Element {
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
    };
  }, []);
  return <canvas id="game-canvas"></canvas>;
}

export default SpaceCanvas2;
