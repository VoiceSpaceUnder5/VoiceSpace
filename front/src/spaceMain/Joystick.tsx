import React, {useContext, useEffect, useRef} from 'react';
import GlobalContext from './GlobalContext';
import {Vec2} from './RTCGameUtils';

export default function Joystick(): JSX.Element {
  // useRef
  const joystickBaseRef = useRef<HTMLImageElement>(null);
  const joystickRef = useRef<HTMLImageElement>(null);
  const oldTouchesPositions = useRef<Vec2[]>([
    {x: 0, y: 0},
    {x: 0, y: 0},
  ]);
  const oldCameraScale = useRef(0);
  // useContext
  const globalContext = useContext(GlobalContext);

  const revealJoystickBase = () => {
    if (
      !globalContext.peerManager ||
      !joystickRef.current ||
      !joystickBaseRef.current
    )
      return;
    const peerManager = globalContext.peerManager;
    const joystickBase = joystickBaseRef.current;
    const joystick = joystickRef.current;

    const posX = peerManager.me.touchStartPos.x;
    const posY = peerManager.me.touchStartPos.y;

    if (joystickBase === null) return;
    if (joystick === null) return;
    joystickBase.style.left = `${posX - joystickBase.width / 2}px`;
    joystickBase.style.top = `${posY - joystickBase.height / 2}px`;
    joystickBase.style.visibility = 'visible';
    joystick.style.left = `${posX - joystick.width / 2}px`;
    joystick.style.top = `${posY - joystick.height / 2}px`;
    joystick.style.visibility = 'visible';
  };

  const hideJoystickBase = () => {
    if (!joystickRef.current || !joystickBaseRef.current) return;
    const joystickBase = joystickBaseRef.current;
    const joystick = joystickRef.current;
    joystickBase.style.visibility = 'hidden';
    joystick.style.visibility = 'hidden';
  };
  const moveJoystick = () => {
    if (
      !globalContext.peerManager ||
      !joystickRef.current ||
      !joystickBaseRef.current
    )
      return;
    const peerManager = globalContext.peerManager;
    const joystickBase = joystickBaseRef.current;
    const joystick = joystickRef.current;

    const startPosX = peerManager.me.touchStartPos.x;
    const startPosY = peerManager.me.touchStartPos.y;
    const endPosX = peerManager.me.touchingPos.x;
    const endPosY = peerManager.me.touchingPos.y;
    if (joystick === null) return;
    if (joystickBase === null) return;

    const dist2 = Math.sqrt(
      Math.pow(endPosX - startPosX, 2) + Math.pow(endPosY - startPosY, 2),
    );
    const dist1 = joystickBase.width / 2 - joystick.width / 2;

    if (dist2 <= dist1) {
      const x = endPosX - joystick.width / 2;
      const y = endPosY - joystick.height / 2;
      joystick.style.left = `${x}px`;
      joystick.style.top = `${y}px`;
    } else {
      joystick.style.left = `${
        (dist1 * (endPosX - startPosX)) / dist2 + startPosX - joystick.width / 2
      }px`;
      joystick.style.top = `${
        (dist1 * (endPosY - startPosY)) / dist2 +
        startPosY -
        joystick.height / 2
      }px`;
    }
  };

  useEffect(() => {
    if (!globalContext.peerManager || !globalContext.camera) return;
    console.log('setting Event started, in JoyStick');
    const peerManager = globalContext.peerManager;
    const camera = globalContext.camera;
    const divContainer = peerManager.divContainer;

    const getLen = (pos1: Vec2, pos2: Vec2) => {
      return Math.sqrt(
        Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2),
      );
    };

    window.addEventListener('keydown', e => {
      if (e.key === '+') {
        camera.upScaleByKeyBoard(0.1);
      } else if (e.key === '-') {
        camera.upScaleByKeyBoard(-0.1);
      }
    });
    //for Desktop
    divContainer.addEventListener('mousedown', e => {
      e.preventDefault();
      peerManager.me.isMoving = true;
      peerManager.me.touchStartPos = {
        x: e.clientX,
        y: e.clientY,
      };
      revealJoystickBase();
    });

    divContainer.addEventListener('mousemove', e => {
      e.preventDefault();
      peerManager.me.touchingPos = {
        x: e.clientX,
        y: e.clientY,
      };
      moveJoystick();
    });

    divContainer.addEventListener('mouseup', e => {
      e.preventDefault();
      peerManager.me.isMoving = false;
      hideJoystickBase();
    });

    //for Phone
    divContainer.addEventListener('touchstart', e => {
      e.preventDefault();
      if (e.touches.length === 1) {
        peerManager.me.isMoving = true;
        peerManager.me.touchStartPos = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        revealJoystickBase();
      } else {
        hideJoystickBase();
        peerManager.me.isMoving = false;
        oldCameraScale.current = camera.scale;
        oldTouchesPositions.current[0] = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        oldTouchesPositions.current[1] = {
          x: e.touches[1].clientX,
          y: e.touches[1].clientY,
        };
      }
    });

    divContainer.addEventListener('touchmove', e => {
      e.preventDefault();
      if (e.touches.length === 1) {
        peerManager.me.touchingPos = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        moveJoystick();
      } else {
        hideJoystickBase();
        peerManager.me.isMoving = false;
        const oldLen = getLen(
          oldTouchesPositions.current[0],
          oldTouchesPositions.current[1],
        );
        const newLen = getLen(
          {x: e.touches[0].clientX, y: e.touches[0].clientY},
          {x: e.touches[1].clientX, y: e.touches[1].clientY},
        );
        camera.upScaleByPinch((oldCameraScale.current * newLen) / oldLen);
      }
    });

    divContainer.addEventListener('touchend', e => {
      e.preventDefault();
      peerManager.me.isMoving = false;
      hideJoystickBase();

      if (joystickRef.current && joystickBaseRef.current) {
        joystickRef.current.style.left = '0px';
        joystickRef.current.style.top = '0px';
        joystickBaseRef.current.style.left = '0px';
        joystickBaseRef.current.style.top = '0px';
      }
    });
  }, [globalContext.peerManager]);
  return (
    <>
      <img
        className="joystickBase"
        src="./assets/joystick/joystick.png"
        alt="조이스틱베이스"
        ref={joystickBaseRef}
      />
      <img
        className="joystick"
        src="./assets/joystick/joystick.png"
        alt="조이스틱"
        ref={joystickRef}
      />
    </>
  );
}
