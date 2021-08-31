import React from 'react';
import {render, screen} from '@testing-library/react';
import MicOnOff, {MicOnOffProps} from '../MicOnOff';
import userEvent from '@testing-library/user-event';

const mockedMicOnOffProps: MicOnOffProps = {
  setIsMicOn: jest.fn(),
};

let spanMicOffElement: HTMLSpanElement | null = null;

beforeEach(() => {
  render(<MicOnOff {...mockedMicOnOffProps}></MicOnOff>);
  const spanMicOnElement = screen.getByLabelText(/audio/i) as HTMLSpanElement;
  userEvent.click(spanMicOnElement);
  spanMicOffElement = screen.queryByLabelText(
    /audio-muted/i,
  ) as HTMLSpanElement;
});

afterEach(() => {
  spanMicOffElement = null;
});

describe('MicOnOff test', () => {
  test('최초 렌더링 후 버튼 한번 눌렀을 때 마이크 Off', () => {
    expect(spanMicOffElement).toBeInTheDocument();
    expect(mockedMicOnOffProps.setIsMicOn).toBeCalled();
  });
  test('최초 렌더링 후 버튼 두번 누르면 최초 렌더링 상태와 같아야함', () => {
    if (!spanMicOffElement) {
      expect(0).toBeTruthy();
      return;
    }
    userEvent.click(spanMicOffElement);
    const spanMicOnElement = screen.getByLabelText(/audio/i) as HTMLSpanElement;
    expect(spanMicOnElement).toBeInTheDocument();
    expect(mockedMicOnOffProps.setIsMicOn).toBeCalledTimes(2);
  });
});
