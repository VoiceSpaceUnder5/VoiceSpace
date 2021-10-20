import {profile} from 'console';
import React from 'react';
import Messenger, {MessengerProps, Message} from '../Messenger';
import {ProfileDropdownOnOff} from '../Navigation';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const profileDropdownOnOff: ProfileDropdownOnOff = {
  on: false,
};

const mockedMessengerProps: MessengerProps = {
  getMyNickname: jest.fn(),
  sendMessage: jest.fn(),
  setDataChannelEventHandler: jest.fn(),
  profileDropdownOnOff: profileDropdownOnOff,
};

beforeEach(() => {
  render(<Messenger {...mockedMessengerProps}></Messenger>);
  const messageElement = screen.
});

describe('Messenger test', () => {
  test('최초 렌더링 후 버튼 눌렀을 때 메세지 창 On', () => {
    expect();
  });
  test('최초 렌더링 후 다른 곳을 클릭해도 계속 존재해야함.', () => {});
});
