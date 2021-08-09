import { useEffect, useRef } from "react";
import { RouteComponentProps } from "react-router-dom";
import ImageInfoProvider from "./ImageInfos";
import GLHelper, { DrawInfo } from "./webGLUtils";
import io from "socket.io-client";
import PeerManager from "./RTCGameUtils";

const qs = require("query-string");

interface SpaceMainQuery {
  roomId: string;
  nickname: string;
  avatarIdx: number;
}

const SpaceMain = (props: RouteComponentProps) => {
  const query = qs.parse(props.location.search) as SpaceMainQuery;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      console.error("set canvas HTML Error");
      return;
    }
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("getContext Error");
      return;
    }
    const imageInfoProvider = new ImageInfoProvider(gl, 0);
    if (!imageInfoProvider) {
      console.error("makeImageInfoProvider fail");
      return;
    }

    const camera: DrawInfo = {
      tex: null,
      width: canvas.clientWidth,
      height: canvas.clientHeight,
      centerPosX: canvas.clientWidth / 2,
      centerPosY: canvas.clientHeight / 2,
      scale: 0.3,
      rotateRadian: 0,
    };

    const glHelper = new GLHelper(
      gl,
      window.innerWidth,
      window.innerHeight,
      camera
    );
    if (!glHelper) {
      console.error("make GLHelper fail");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream: MediaStream) => {
        const audioContainer = document.querySelector("#audioContainer");
        if (!audioContainer) {
          console.error("audioContainer can not found");
          return;
        }

        const socket = io("http://localhost:8080");
        if (!socket) {
          console.error("socket connection fail");
          return;
        }

        const peerManger = new PeerManager(
          socket,
          stream,
          query.nickname,
          query.avatarIdx,
          audioContainer,
          query.roomId
        );

        const backgroundDrawInfo: DrawInfo = {
          tex: imageInfoProvider.background.tex,
          width: imageInfoProvider.background.width,
          height: imageInfoProvider.background.height,
          centerPosX: imageInfoProvider.background.width / 2,
          centerPosY: imageInfoProvider.background.height / 2,
          scale: 1,
          rotateRadian: 0,
        };

        const drawBackround = () => glHelper.drawImage(backgroundDrawInfo);

        const requestAnimation = () => {
          drawBackround();
          peerManger.me.update(0);
          const meFaceDrawInfo: DrawInfo = {
            tex: imageInfoProvider.animals[peerManger.me.idx].imageInfos[0].tex,
            width:
              imageInfoProvider.animals[peerManger.me.idx].imageInfos[0].width,
            height:
              imageInfoProvider.animals[peerManger.me.idx].imageInfos[0].height,
            centerPosX:
              peerManger.me.centerPos.x +
              imageInfoProvider.animals[peerManger.me.idx].imageInfos[0]
                .centerPositionPixelOffsetX,
            centerPosY:
              peerManger.me.centerPos.y +
              imageInfoProvider.animals[peerManger.me.idx].imageInfos[0]
                .centerPositionPixelOffsetY,
            scale: 1 + peerManger.me.volume / 200,
            rotateRadian: peerManger.me.rotateRadian,
          };
          glHelper.drawImage(meFaceDrawInfo);
          requestAnimationFrame(requestAnimation);
        };
        requestAnimationFrame(requestAnimation);

        console.log("all clear!");
      })
      .catch((error) => {
        console.error(`mediaStream error :${error.toString()}`);
      });

    // const drawFace = () =>
    //   glHelper.drawImage({
    //     tex: imageInfoProvider.animals[0].imageInfos[0].tex,
    //     width: imageInfoProvider.animals[0].imageInfos[0].width,
    //     height: imageInfoProvider.animals[0].imageInfos[0].height,
    //     centerPosX:
    //       imageInfoProvider.animals[0].imageInfos[0].width / 2 +
    //       imageInfoProvider.animals[0].imageInfos[0].centerPositionPixelOffsetX,
    //     centerPosY:
    //       imageInfoProvider.animals[0].imageInfos[0].height / 2 +
    //       imageInfoProvider.animals[0].imageInfos[0].centerPositionPixelOffsetY,
    //     scale: 1,
    //     rotateRadian: 0,
    //   });

    // const drawTail = () =>
    //   glHelper.drawImage({
    //     tex: imageInfoProvider.animals[0].imageInfos[1].tex,
    //     width: imageInfoProvider.animals[0].imageInfos[1].width,
    //     height: imageInfoProvider.animals[0].imageInfos[1].height,
    //     centerPosX:
    //       imageInfoProvider.animals[0].imageInfos[1].width / 2 +
    //       imageInfoProvider.animals[0].imageInfos[1].centerPositionPixelOffsetX,
    //     centerPosY:
    //       imageInfoProvider.animals[0].imageInfos[1].height / 2 +
    //       imageInfoProvider.animals[0].imageInfos[1].centerPositionPixelOffsetY,
    //     scale: 1,
    //     rotateRadian: 0,
    //   });
  }, []);
  return (
    <>
      <canvas
        width={window.innerWidth.toString() + "px"}
        height={window.innerHeight.toString() + "px"}
        ref={canvasRef}
      ></canvas>
      <div id="divContainer"></div>
      <div id="audioContainer" style={{ width: "0", height: "0" }}></div>
    </>
  );
};

export default SpaceMain;
