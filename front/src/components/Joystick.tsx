import React, {useEffect, useRef} from 'react';
import PeerManager, {Vec2} from '../utils/RTCGameUtils';
import {Camera} from '../utils/webGLUtils';

export interface JoystickProps {
  peerManager: PeerManager;
  camera: Camera;
}

export default function Joystick(props: JoystickProps): JSX.Element {
  // useRef
  const joystickBaseRef = useRef<HTMLImageElement>(null);
  const joystickRef = useRef<HTMLImageElement>(null);
  const touchStartPosRef = useRef<Vec2>({x: 0, y: 0});
  const touchingPosRef = useRef<Vec2>({x: 0, y: 0});

  const oldTouchesPositions = useRef<Vec2[]>([
    {x: 0, y: 0},
    {x: 0, y: 0},
  ]);
  const oldCameraScale = useRef(0);
  // useContext

  const revealJoystickBase = () => {
    if (!joystickRef.current || !joystickBaseRef.current) return;
    const joystickBase = joystickBaseRef.current;
    const joystick = joystickRef.current;

    const posX = touchStartPosRef.current.x;
    const posY = touchStartPosRef.current.y;

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
    if (!joystickRef.current || !joystickBaseRef.current) return;
    const joystickBase = joystickBaseRef.current;
    const joystick = joystickRef.current;

    const startPosX = touchStartPosRef.current.x;
    const startPosY = touchStartPosRef.current.y;
    const endPosX = touchingPosRef.current.x;
    const endPosY = touchingPosRef.current.y;
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

  const getLen = (pos1: Vec2, pos2: Vec2): number => {
    return Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2),
    );
  };
  const getDir = (
    pos1: Vec2 = touchingPosRef.current,
    pos2: Vec2 = touchStartPosRef.current,
  ): Vec2 => {
    const result: Vec2 = {
      x: pos1.x - pos2.x,
      y: pos1.y - pos2.y,
    };
    const len = getLen(pos1, pos2);
    if (len === 0) {
      return {x: 0, y: 1};
    }
    result.x /= len;
    result.y /= len;
    return result;
  };

  useEffect(() => {
    if (!props.peerManager || !props.camera) return;
    const peerManager = props.peerManager;
    const camera = props.camera;
    const divContainer = peerManager.divContainer;

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
      touchStartPosRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
      revealJoystickBase();
    });

    divContainer.addEventListener('mousemove', e => {
      e.preventDefault();
      touchingPosRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
      peerManager.me.nextNormalizedDirectionVector = getDir();
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
        touchStartPosRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        revealJoystickBase();
      } else {
        peerManager.me.isMoving = false;
        hideJoystickBase();
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
        touchingPosRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        peerManager.me.nextNormalizedDirectionVector = getDir();
        moveJoystick();
      } else {
        hideJoystickBase();
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
      hideJoystickBase();
      peerManager.me.isMoving = false;
      if (joystickRef.current && joystickBaseRef.current) {
        joystickRef.current.style.left = '0px';
        joystickRef.current.style.top = '0px';
        joystickBaseRef.current.style.left = '0px';
        joystickBaseRef.current.style.top = '0px';
      }
    });
  }, []);
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
