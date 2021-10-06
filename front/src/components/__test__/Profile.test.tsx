import React from 'react';
import {render} from 'react-dom';
import {screen} from '@testing-library/react';
import Profile, {ProfileDropDown, ProfileProps} from '../Profile';
import userEvent from '@testing-library/user-event';
import {
  AvatarImageEnum,
  avatarImageMDs,
  AvatarPartImageEnum,
} from '../../utils/ImageMetaData';
import {act} from 'react-dom/test-utils';

const mockedProfileDropDownProps: ProfileProps = {
  nickname: 'hyeonkim',
  setNickname: jest.fn(),
  avatar: AvatarImageEnum.BROWN_BEAR,
  setAvatar: jest.fn(),
};

const mockedProfileProps: ProfileProps = {
  nickname: 'hyeonkim',
  setNickname: jest.fn(),
  avatar: AvatarImageEnum.BROWN_BEAR,
  setAvatar: jest.fn(),
};

function isImageSrcSame(
  imageElement: HTMLImageElement,
  avatar: AvatarImageEnum,
): boolean {
  return imageElement.src.includes(
    avatarImageMDs[avatar].avatarMDInfos[
      AvatarPartImageEnum.FACE_MUTE
    ].src.substr(1),
  );
}

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
// antd 의 Menu 컴포넌트를 사용하면 하위 컴포넌트들을 2개씩 렌더링 합니다.
// 실제 앞에 렌더링 되는 놈은 All 로 찾았을떄 1번 인덱스.
// 이유는 나도모름
// Menu.Item으로 변경 후 img elements(82, 131, 141번 줄)를 제외하고는 0번 인덱스로 수정
// 이유는 여전히 모르겠음
describe('ProfileDropDown test', () => {
  test('초기 nickname 값 정상적으로 들어갔는지 확인', async () => {
    if (!container) {
      expect(false).toBeTruthy();
      return;
    }
    await act(async () => {
      render(
        <ProfileDropDown {...mockedProfileDropDownProps}></ProfileDropDown>,
        container,
      );
    });
    const inputElements = screen.queryAllByTestId('profileDropdownInputTestId');
    expect(inputElements.length).not.toBe(0);
  });

  test('초기 avatar 값 정상적으로 들어갔는지(맞는 이미지가 렌더링 되었는지) 확인', async () => {
    if (!container) {
      expect(false).toBeTruthy();
      return;
    }
    await act(async () => {
      render(
        <ProfileDropDown {...mockedProfileDropDownProps}></ProfileDropDown>,
        container,
      );
    });
    const imageElements = screen.getAllByRole('img');
    const imageElement = imageElements[1];
    expect(
      isImageSrcSame(
        imageElement as HTMLImageElement,
        mockedProfileDropDownProps.avatar,
      ),
    ).toBeTruthy();
  });

  test('input 에 타이핑 했을때 타이핑 한 것이 즉시 리렌더링되는지 확인(10글자 제한까지)', async () => {
    if (!container) {
      expect(false).toBeTruthy();
      return;
    }
    await act(async () => {
      render(
        <ProfileDropDown {...mockedProfileDropDownProps}></ProfileDropDown>,
        container,
      );
    });
    const inputElements = screen.queryAllByTestId('profileDropdownInputTestId');
    const inputElement = inputElements[0] as HTMLInputElement;
    const inputValue = '1234';
    userEvent.type(inputElement, inputValue);
    const expectedValue = (
      mockedProfileDropDownProps.nickname + inputValue
    ).substr(0, 10);
    expect(inputElement.value).toBe(expectedValue);
  });

  test('input 우클릭/ 좌클릭 했을 때 순서에 맞는 image src 가 로드되는지 확인', async () => {
    if (!container) {
      expect(false).toBeTruthy();
      return;
    }
    await act(async () => {
      render(
        <ProfileDropDown {...mockedProfileDropDownProps}></ProfileDropDown>,
        container,
      );
    });
    const leftButtonElement = screen.queryAllByTestId(
      'profileDropdownLeftButtonTestId',
    );
    const rightButtonElement = screen.queryAllByTestId(
      'profileDropdownRightButtonTestId',
    );
    userEvent.click(rightButtonElement[0]);
    let imageElements = screen.getAllByRole('img');
    let imageElement = imageElements[1];
    let nextEnum = mockedProfileDropDownProps.avatar + 1;
    if (nextEnum >= avatarImageMDs.length) nextEnum = 0;
    expect(
      isImageSrcSame(imageElement as HTMLImageElement, nextEnum),
    ).toBeTruthy();

    userEvent.click(leftButtonElement[0]);
    userEvent.click(leftButtonElement[0]);
    imageElements = screen.getAllByRole('img');
    imageElement = imageElements[1];
    nextEnum = mockedProfileDropDownProps.avatar - 1;
    if (nextEnum < 0) nextEnum = avatarImageMDs.length - 1;
    expect(
      isImageSrcSame(imageElement as HTMLImageElement, nextEnum),
    ).toBeTruthy();
  });

  test('input 에 닉네임 작성하고, 버튼 눌러서 avatar 고르고, 확인버튼 눌렀을 때 set 으로 시작하는 두 props 의 함수가 정상적으로 매개변수를 받아서 실행되는지 확인', async () => {
    if (!container) {
      expect(false).toBeTruthy();
      return;
    }
    await act(async () => {
      render(
        <ProfileDropDown {...mockedProfileDropDownProps}></ProfileDropDown>,
        container,
      );
    });
    const inputElements = screen.queryAllByTestId('profileDropdownInputTestId');
    const inputElement = inputElements[0] as HTMLInputElement;
    const inputValue = '1234';
    userEvent.type(inputElement, inputValue);
    const expectedInputValue = (
      mockedProfileDropDownProps.nickname + inputValue
    ).substr(0, 10);
    // Menu.Item 태그는 하나만 생성되나보다.
    const changeButton = screen.getByText('변경');
    // get => error
    // query => null
    // find => 기본적으로 get으로 찾음(async)
    const rightButtonElement = screen.queryAllByTestId(
      'profileDropdownRightButtonTestId',
    );
    userEvent.click(rightButtonElement[0]);
    let nextEnum = mockedProfileDropDownProps.avatar + 1;
    if (nextEnum >= avatarImageMDs.length) nextEnum = 0;

    act(() => {
      userEvent.click(changeButton);
    });
    expect(mockedProfileDropDownProps.setNickname).toBeCalledWith(
      expectedInputValue,
    );
    expect(mockedProfileDropDownProps.setAvatar).toBeCalledWith(nextEnum);
  });
});

describe('Profile test', () => {
  test('초기 nickname 값이 정상적으로  표기 되는지 확인', async () => {
    if (!container) {
      expect(false).toBeTruthy();
      return;
    }
    await act(async () => {
      render(<Profile {...mockedProfileProps}></Profile>, container);
    });
    const reg = new RegExp(mockedProfileProps.nickname, 'i');
    const spanElement = screen.queryByText(reg);
    expect(spanElement).toBeInTheDocument();
  });

  test('버튼 클릭시 정상적으로 드롭다운이 렌더링 되는지 확인', async () => {
    if (!container) {
      expect(false).toBeTruthy();
      return;
    }
    await act(async () => {
      render(<Profile {...mockedProfileProps}></Profile>, container);
    });
    // const profile = screen.getByText('hyeonkim').closest('a');
    const profile = screen.getByRole('button');
    await act(async () => {
      userEvent.click(profile);
    });
    const changeButton = screen.queryByText('변경');
    expect(changeButton).toBeInTheDocument();
  });
});
