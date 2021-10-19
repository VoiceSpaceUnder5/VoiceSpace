import React from 'react';
import {render} from 'react-dom';
import {fireEvent, queryAllByRole, screen} from '@testing-library/react';
import {UserInfo, UsersListProps, UserList} from '../UserList';
import {AvatarImageEnum} from '../../utils/ImageMetaData';
import {act} from 'react-dom/test-utils';
const result: UserInfo[] = [
  {
    nickname: 'mijeong',
    avatar: AvatarImageEnum.BUNNY,
    volume: 0.5,
    setVolume: jest.fn(),
  },
  {
    nickname: 'hyeonkim',
    avatar: AvatarImageEnum.BUNNY,
    volume: 0.7,
    setVolume: jest.fn(),
  },
  {
    nickname: 'honlee',
    avatar: AvatarImageEnum.BUNNY,
    volume: 0.3,
    setVolume: jest.fn(),
  },
];
const mockedGetUsers = () => {
  return result;
};

const mockedUserListProps: UsersListProps = {
  getUsers: mockedGetUsers,
  onClickPrevious: jest.fn(),
  onChangeVolume: jest.fn(),
};

let container: HTMLDivElement | null = null;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  if (container) {
    document.body.removeChild(container);
    container = null;
  }
});

describe('UserList test', () => {
  test('정상적으로 getUsers 가 실행되어 렌더링 되는지 확인', async () => {
    if (!container) {
      expect(true).toBe(false);
    } else {
      await act(async () => {
        render(<UserList {...mockedUserListProps}></UserList>, container);
      });
      const renderedZeroIndex = screen.queryByText(
        new RegExp(mockedGetUsers()[0].nickname, 'i'),
      );
      const renderedOneIndex = screen.queryByText(
        new RegExp(mockedGetUsers()[1].nickname, 'i'),
      );
      expect(renderedZeroIndex).not.toBe(null);
      expect(renderedOneIndex).not.toBe(null);
    }
  });

  test('range input 이 정상적으로 동작하는지 확인', async () => {
    if (!container) {
      expect(true).toBe(false);
    } else {
      await act(async () => {
        render(<UserList {...mockedUserListProps}></UserList>, container);
      });
      const inputs = screen.queryAllByRole('button');
      expect(inputs.length).toBe(mockedGetUsers().length - 1);
      fireEvent.change(inputs[0], {target: {value: 30}});
      expect(mockedGetUsers()[1].setVolume).toBeCalledWith(0.3);
      expect(mockedUserListProps.onChangeVolume).toBeCalledTimes(1);
      fireEvent.change(inputs[1], {target: {value: 77}});
      expect(mockedGetUsers()[2].setVolume).toBeCalledWith(0.77);
      expect(mockedUserListProps.onChangeVolume).toBeCalledTimes(2);
    }
  });
});
