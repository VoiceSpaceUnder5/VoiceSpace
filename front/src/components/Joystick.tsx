import React, {useEffect, useRef, useState} from 'react';
import {Vec2} from '../utils/RTCGameUtils';

export interface JoystickProps {
  setIsMoving: (arg0: boolean) => void;
  setNextNormalizedDirectionVector: (arg0: Vec2) => void;
  setCameraScaleByPinch: (arg0: number) => void;
  isClickRef: React.MutableRefObject<boolean>;
  getCameraScale: () => number;
  divContainer: HTMLDivElement;
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

    joystickBase.style.left = '0px';
    joystickBase.style.top = '0px';
    joystick.style.left = '0px';
    joystick.style.top = '0px';
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
    if (!props.isClickRef.current) return;

    console.log('move!!');
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

  const divMouseDownEventHandler = (e: MouseEvent) => {
    e.preventDefault();
    console.log('mouseDownEvent!');
    props.isClickRef.current = true;
    props.setIsMoving(true);
    touchStartPosRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
    revealJoystickBase();
  };

  const divMouseMoveEventHandler = (e: MouseEvent) => {
    e.preventDefault();
    touchingPosRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
    props.setNextNormalizedDirectionVector(getDir());
    moveJoystick();
  };

  const divMouseUpEventHandler = (e: MouseEvent) => {
    e.preventDefault();
    props.isClickRef.current = false;
    console.log('mouse Up!!');
    props.setIsMoving(false);
    hideJoystickBase();
  };

  const divTouchStartEventHandler = (e: TouchEvent) => {
    e.preventDefault();
    props.isClickRef.current = true;
    if (e.touches.length === 1) {
      props.setIsMoving(true);
      touchStartPosRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      revealJoystickBase();
    } else {
      props.setIsMoving(false);
      hideJoystickBase();
      oldCameraScale.current = props.getCameraScale();
      oldTouchesPositions.current[0] = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      oldTouchesPositions.current[1] = {
        x: e.touches[1].clientX,
        y: e.touches[1].clientY,
      };
    }
  };

  const divTouchMoveEventHandler = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      touchingPosRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      props.setNextNormalizedDirectionVector(getDir());
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
      props.setCameraScaleByPinch((oldCameraScale.current * newLen) / oldLen);
    }
  };

  const divTouchEndEventHandler = (e: TouchEvent) => {
    e.preventDefault();
    props.isClickRef.current = false;
    hideJoystickBase();
    props.setIsMoving(false);
    if (joystickRef.current && joystickBaseRef.current) {
      joystickRef.current.style.left = '0px';
      joystickRef.current.style.top = '0px';
      joystickBaseRef.current.style.left = '0px';
      joystickBaseRef.current.style.top = '0px';
    }
  };
  useEffect(() => {
    const divContainer = props.divContainer;
    //for Desktop
    divContainer.addEventListener('mousedown', divMouseDownEventHandler);
    divContainer.addEventListener('mousemove', divMouseMoveEventHandler);
    divContainer.addEventListener('mouseup', divMouseUpEventHandler);

    //for Phone
    divContainer.addEventListener('touchstart', divTouchStartEventHandler);
    divContainer.addEventListener('touchmove', divTouchMoveEventHandler);
    divContainer.addEventListener('touchend', divTouchEndEventHandler);
    return () => {
      //for Desktop
      divContainer.removeEventListener('mousedown', divMouseDownEventHandler);
      divContainer.removeEventListener('mousemove', divMouseMoveEventHandler);
      divContainer.removeEventListener('mouseup', divMouseUpEventHandler);

      //for Phone
      divContainer.removeEventListener('touchstart', divTouchStartEventHandler);
      divContainer.removeEventListener('touchmove', divTouchMoveEventHandler);
      divContainer.removeEventListener('touchend', divTouchEndEventHandler);
    };
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
