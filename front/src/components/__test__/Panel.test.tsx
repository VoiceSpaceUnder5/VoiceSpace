import React from 'react';
import {render} from 'react-dom';
import {screen} from '@testing-library/react';
import Panel, {PanelDropDown, PanelDropDownProps, PanelProps} from '../Panel';
import {ProfileDropdownOnOff} from '../Navigation';
import userEvent from '@testing-library/user-event';
import {act} from 'react-dom/test-utils';
import {UserInfo} from '../UserList';

// profileDropdownOnOff: ProfileDropdownOnOff;
// getMyNickname: () => string;
// getUsers: () => UserInfo[];
// roomId: string;
// onCopy: () => void;
// sendMessage: (message: string) => void;
// setDataChannelEventHandler: (
//   arg0: DataDtoType,
//   // eslint-disable-next-line
//   arg1: (data: any) => void,
// ) => void;

const profileDropdownOnOff: ProfileDropdownOnOff = {
  on: false,
};

const mockedPanelProps: PanelProps = {
  profileDropdownOnOff: profileDropdownOnOff,
  getMyNickname: jest.fn(),
  getUsers: jest.fn(),
  roomId: 'testRoomID',
  onCopy: jest.fn(),
  sendMessage: jest.fn(),
  setDataChannelEventHandler: jest.fn(),
  exit: jest.fn(),
  changeEachAudio: jest.fn(),
  changeInputStream: jest.fn(),
  seletedOutputDevice: 'testOutputDevice',
  seletedInputDevice: 'testInputDevice',
};

// roomId: string;
// onCopy: () => void;
// onClickSubMenu: (e: MenuItemProps) => void;

const mockedPanelDropDownProps: PanelDropDownProps = {
  roomId: 'testID',
  onCopy: jest.fn(),
  onClickSubMenu: jest.fn(),
  onClickPrevious: jest.fn(),
  onChangeVolume: jest.fn(),
  getUsers: jest.fn(),
  hidePanel: jest.fn(),
  exit: jest.fn(),
  // Options props
  changeEachAudio: jest.fn(),
  changeInputStream: jest.fn(),
  seletedOutputDevice: 'testOutputDevice',
  seletedInputDevice: 'testInputDevice',
};

// jest 의 render 함수가 사용하는 virtualDOM 은 거의 모든 window 함수들을 구현했지만
// 일부 구현하지 않은 함수들이 있습니다. 대표적으로 window.alert 이 그것입니다
// 이러한 함수들이 호출 되었을 경우 error 를 뱉기 때문에 아래와 같이 잠시 빈 함수로 만들어서
// error 를 차단 할 수 있습니다.
const temp = window.prompt;

let container: HTMLDivElement | null = null;
beforeEach(() => {
  window.prompt = jest.fn();
  container = document.createElement('div');
  document.body.appendChild(container);
});
afterEach(() => {
  if (container) {
    document.body.removeChild(container);
    container = null;
  }
  window.prompt = temp;
});

describe('PanelDropDown test', () => {
  test('버튼 클릭 후 콜백함수 호출', async () => {
    if (!container) {
      expect(false).toBeTruthy();
      return;
    }
    await act(async () => {
      render(
        <PanelDropDown {...mockedPanelDropDownProps}></PanelDropDown>,
        container,
      );
    });
    const aElement = screen.getByText(/참여 링크 복사/i);
    userEvent.click(aElement);
    expect(mockedPanelDropDownProps.onCopy).toBeCalled();
  });
});
describe('Panel test', () => {
  test('드롭다운 버튼 눌렀을 때 PanelDropDown 렌더링', async () => {
    if (!container) {
      expect(false).toBeTruthy();
      return;
    }
    await act(async () => {
      render(<Panel {...mockedPanelProps}></Panel>, container);
    });
    const panel = screen.getByRole('button');
    await act(async () => {
      userEvent.click(panel);
    });
    const copyLinkButton = screen.getByText(/참여 링크 복사/);
    expect(copyLinkButton).toBeInTheDocument();
  });
});
