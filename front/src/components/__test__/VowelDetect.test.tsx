import React from 'react';
import {render, unmountComponentAtNode} from 'react-dom';
import {act} from 'react-dom/test-utils';
import {fireEvent, screen} from '@testing-library/react';
import VowelDetectButton, {formants} from '../VowelDetectButton';

let container: HTMLDivElement | null = null;
const mockMediaStream: any = 'hello';

const savedSetItem = localStorage.__proto__.setItem;
const savedGetItem = localStorage.__proto__.getItem;
const savedConsoleError = console.error;

const mockGetItem = () => {
  const savedformants = [
    {
      label: 'A',
      array: [1],
      Image: null,
    },
    {
      label: 'I',
      array: [2],
      Image: null,
    },
    {
      label: 'U',
      array: [3],
      Image: null,
    },
    {
      label: 'E',
      array: [4],
      Image: null,
    },
    {
      label: 'O',
      array: [5],
      Image: null,
    },
  ];
  return JSON.stringify(savedformants);
};

beforeEach(async () => {
  localStorage.__proto__.setItem = jest.fn();
  localStorage.__proto__.getItem = mockGetItem;
  container = document.createElement('div');
  document.body.appendChild(container);
  jest
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementationOnce((cb: any) => cb());
  await act(async () => {
    render(
      <VowelDetectButton stream={mockMediaStream}></VowelDetectButton>,
      container,
    );
  });
  const smileButtonElement = screen.getByRole('img');
  await act(async () => {
    fireEvent.click(smileButtonElement);
  });
});

afterEach(() => {
  localStorage.__proto__.setItem = savedSetItem;
  localStorage.__proto__.getItem = savedGetItem;
  if (container) {
    unmountComponentAtNode(container);
    document.body.removeChild(container);
    container = null;
  }
});

describe('VowelDetectButton test', () => {
  test('정상적으로 렌더링 되는지 테스트', async () => {
    const saveButtonElements = screen.queryAllByRole('button');
    expect(saveButtonElements.length).toBe(formants.length);
  });
  test('저장 버튼 한번씩 눌러서 잘 저장되는지 테스트', async () => {
    const saveButtonElements = screen.queryAllByRole('button');
    saveButtonElements.forEach(button => {
      fireEvent.click(button);
    });
    expect(localStorage.setItem).toBeCalledTimes(formants.length);
  });
});
