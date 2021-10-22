import React, {useEffect, useRef, useState} from 'react';
import {GameData} from '../utils/pixiUtils/GameData';
import {
  pixiCanvasDestroy,
  pixiCanvasStart,
} from '../utils/pixiUtils/PixiCanvas';
import PeerManager, {PlayerDto, Peer, DataDtoType} from '../utils/RTCGameUtils';
import SpaceLoading from './SpaceLoading';
import YoutubeEmbedRenderer from './YoutubeEmbed';

interface spaceCanvasProps {
  peerManager: PeerManager;
}

function SpaceCanvas(props: spaceCanvasProps): JSX.Element {
  const [loadingPercentage, setLoadingPercentage] = useState(0);
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
    GameData.setPeerManager(props.peerManager);
    pixiCanvasStart(canvasRef.current, setLoadingPercentage);
    return () => {
      props.peerManager.close();
      pixiCanvasDestroy();
      YoutubeEmbedRenderer.clear();
    };
  }, []);
  return (
    <>
      {loadingPercentage < 100 ? (
        <SpaceLoading loadingPercentage={loadingPercentage} />
      ) : null}
      <canvas ref={canvasRef}></canvas>
    </>
  );
}

export default SpaceCanvas;
