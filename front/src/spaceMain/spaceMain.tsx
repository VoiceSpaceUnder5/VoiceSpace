import { useEffect, useRef } from "react";
import { RouteComponentProps } from "react-router-dom";
import ImageInfoProvider from "./ImageInfos";
import GLHelper, { DrawInfo, Camera } from "./webGLUtils";
import io from "socket.io-client";
import PeerManager, { IPlayer } from "./RTCGameUtils";
import Navigation from "./Navigation";

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

    const camera = new Camera(
      canvas.clientWidth,
      canvas.clientHeight,
      canvas.clientWidth / 2,
      canvas.clientHeight / 2,
      1,
      0,
      imageInfoProvider.background
    );

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

        const divContainer = document.querySelector(
          "#divContainer"
        ) as HTMLDivElement;
        if (!divContainer) {
          console.error("divContainer can not found");
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
          divContainer,
          {
            x: imageInfoProvider.background.width / 2,
            y: imageInfoProvider.background.height / 2,
          },
          query.roomId
        );

        const backgroundDrawInfo: DrawInfo = {
          tex: imageInfoProvider.background.tex,
          width: imageInfoProvider.background.width,
          height: imageInfoProvider.background.height,
          centerPosX: imageInfoProvider.background.width / 2,
          centerPosY: imageInfoProvider.background.height / 2,
          centerPositionPixelOffsetX: 0,
          centerPositionPixelOffsetY: 0,
          scale: 1,
          rotateRadian: 0,
        };

        const drawBackround = () => glHelper.drawImage(backgroundDrawInfo);

        /////////////////////////////////////////////////
        // event setting start //////////////////////////
        window.addEventListener("resize", (e) => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          glHelper.projectionWidth = window.innerWidth;
          glHelper.projectionHeight = window.innerHeight;
          glHelper.gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
          camera.width = window.innerWidth;
          camera.height = window.innerHeight;
          camera.centerPosX = window.innerWidth / 2;
          camera.centerPosY = window.innerHeight / 2;
        });

        window.addEventListener("keydown", (e) => {
          if (e.key === "+") {
            camera.upScale(0.1);
          } else if (e.key === "-") {
            camera.upScale(-0.1);
          }
        });

        //for Desktop
        divContainer.addEventListener("mousedown", (e) => {
          e.preventDefault();
          peerManger.me.isMoving = true;
          peerManger.me.touchStartPos = { x: e.clientX, y: e.clientY };
        });

        divContainer.addEventListener("mousemove", (e) => {
          e.preventDefault();
          peerManger.me.touchingPos = { x: e.clientX, y: e.clientY };
        });

        divContainer.addEventListener("mouseup", (e) => {
          e.preventDefault();
          peerManger.me.isMoving = false;
        });

        //for Phone
        divContainer.addEventListener("touchstart", (e) => {
          e.preventDefault();
          peerManger.me.isMoving = true;
          peerManger.me.touchStartPos = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
          };
        });

        divContainer.addEventListener("touchmove", (e) => {
          e.preventDefault();
          peerManger.me.touchingPos = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
          };
        });

        divContainer.addEventListener("touchend", (e) => {
          e.preventDefault();
          peerManger.me.isMoving = false;
        });

        const requestAnimation = () => {
          drawBackround();
          peerManger.me.update(Date.now() - peerManger.lastUpdateTimeStamp);
          peerManger.peers.forEach((peer) => {
            if (peer.dc.readyState === "open")
              peer.dc.send(JSON.stringify(peerManger.me));
            glHelper.drawAnimal(imageInfoProvider, peer, peer.div);
            peer.updateSoundFromVec2(peerManger.me.centerPos);
          });
          peerManger.lastUpdateTimeStamp = Date.now();
          camera.updateCenterPosFromPlayer(peerManger.me);
          glHelper.drawAnimal(
            imageInfoProvider,
            peerManger.me,

            peerManger.me.div
          );

          requestAnimationFrame(requestAnimation);
        };
        peerManger.lastUpdateTimeStamp = Date.now();
        requestAnimationFrame(requestAnimation);
      })
      .catch((error) => {
        console.error(`mediaStream error :${error.toString()}`);
      });
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
      <Navigation {...props}/>
    </>
  );
};

export default SpaceMain;
