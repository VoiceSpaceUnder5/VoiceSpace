import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import Joystick, {JoystickProps} from '../Joystick';

const divContainer = document.createElement('div');

const mockedJoystickProps: JoystickProps = {
  setIsMoving: jest.fn(),
  setNextNormalizedDirectionVector: jest.fn(),
  setCameraScaleByPinch: jest.fn(),
  getCameraScale: jest.fn(),
  divContainer: divContainer,
};

let joystickBaseElement: HTMLImageElement | null = null;
let joystickElement: HTMLImageElement | null = null;

beforeEach(() => {
  render(<Joystick {...mockedJoystickProps}></Joystick>);
  joystickBaseElement = screen.getByAltText(
    /조이스틱베이스/i,
  ) as HTMLImageElement;
  joystickElement = screen.getByAltText(/조이스틱$/i) as HTMLImageElement;

  // css 를 못불러와서 직접 입력해줌.. 이런짓 안해도될 것 같은데 방법을 모르겠
  joystickBaseElement.style.top = '0px';
  joystickBaseElement.style.position = 'absolute';
  joystickBaseElement.style.visibility = 'hidden';
  joystickBaseElement.width = 170;
  joystickBaseElement.height = 170;

  joystickElement.style.top = '0px';
  joystickElement.style.position = 'absolute';
  joystickElement.style.visibility = 'hidden';
  joystickElement.width = 70;
  joystickElement.height = 70;
});

afterEach(() => {
  joystickBaseElement = null;
  joystickElement = null;
});

describe('Joystick test', () => {
  test('.joystickBase class, .joystick class 가지고있어야함', () => {
    if (!joystickBaseElement || !joystickElement) {
      expect(false).toBeTruthy();
      return;
    }
    expect(joystickBaseElement).toHaveClass('joystickBase');
    expect(joystickElement).toHaveClass('joystick');
  });
  test('divContainer 클릭시 가상조이스틱(image 테그들) 클릭 위치에 보여야함.', () => {
    if (!joystickBaseElement || !joystickElement) {
      expect(false).toBeTruthy();
      return;
    }
    fireEvent.mouseDown(divContainer, {clientX: 200, clientY: 200});
    expect(joystickElement).toHaveStyle({left: '165px'});
    expect(joystickElement).toHaveStyle({top: '165px'});
    expect(joystickBaseElement).toHaveStyle({left: '115px'});
    expect(joystickBaseElement).toHaveStyle({top: '115px'});
  });
  test('divContainer 클릭하고 마우스 이동시 joystick 이 해당 마우스 위치로 움직여야함(base 의 범위를 벗어나지 않으면서)', () => {
    if (!joystickBaseElement || !joystickElement) {
      expect(false).toBeTruthy();
      return;
    }

    fireEvent.mouseDown(divContainer, {clientX: 200, clientY: 200});
    fireEvent.mouseMove(divContainer, {clientX: 100, clientY: 200});
    expect(joystickElement).toHaveStyle({left: '115px'});
    expect(joystickElement).toHaveStyle({top: '165px'});
    fireEvent.mouseMove(divContainer, {clientX: 180, clientY: 200});
    expect(joystickElement).toHaveStyle({left: '145px'});
    expect(joystickElement).toHaveStyle({top: '165px'});
    expect(
      mockedJoystickProps.setNextNormalizedDirectionVector,
    ).toBeCalledTimes(2);
  });
  test('divContainer 터치시 가상조이스틱(image 테그들) 터치 위치에 보여야함.', () => {
    if (!joystickBaseElement || !joystickElement) {
      expect(false).toBeTruthy();
      return;
    }
    fireEvent.touchStart(divContainer, {
      touches: [{clientX: 200, clientY: 200}],
    });
    expect(joystickElement).toHaveStyle({left: '165px'});
    expect(joystickElement).toHaveStyle({top: '165px'});
    expect(joystickBaseElement).toHaveStyle({left: '115px'});
    expect(joystickBaseElement).toHaveStyle({top: '115px'});
  });
  test('divContainer 터치하고 이동시 joystick 이 해당 터치 위치로 움직여야함(base 의 범위를 벗어나지 않으면서)', () => {
    if (!joystickBaseElement || !joystickElement) {
      expect(false).toBeTruthy();
      return;
    }

    fireEvent.touchStart(divContainer, {
      touches: [{clientX: 200, clientY: 200}],
    });
    fireEvent.touchMove(divContainer, {
      touches: [{clientX: 100, clientY: 200}],
    });
    expect(joystickElement).toHaveStyle({left: '115px'});
    expect(joystickElement).toHaveStyle({top: '165px'});
    fireEvent.touchMove(divContainer, {
      touches: [{clientX: 180, clientY: 200}],
    });
    expect(joystickElement).toHaveStyle({left: '145px'});
    expect(joystickElement).toHaveStyle({top: '165px'});
    expect(
      mockedJoystickProps.setNextNormalizedDirectionVector,
    ).toBeCalledTimes(2);
  });
  test('divContainer 두손가락으로 터치시 핀치 함수 호출되어야 함.', () => {
    if (!joystickBaseElement || !joystickElement) {
      expect(false).toBeTruthy();
      return;
    }
    fireEvent.touchMove(divContainer, {
      touches: [
        {clientX: 100, clientY: 200},
        {clientX: 200, clientY: 200},
      ],
    });
    expect(mockedJoystickProps.setCameraScaleByPinch).toBeCalledTimes(1);
  });
});
