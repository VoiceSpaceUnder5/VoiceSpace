import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import EnterRoom from '../EnterRoom';
import userEvent from '@testing-library/user-event';

describe('EnterRoom test', () => {
  test('render 초기상태에 "참가하기"버튼 안보여야함.', () => {
    const onClickFn = jest.fn();
    render(
      <EnterRoom
        buttonText={'enter'}
        inputPlaceHolder={'placeholder'}
        enterRoomButtonClick={onClickFn}
      />,
    );
    const buttonElement = screen.queryByText('enter');
    expect(buttonElement).not.toBeInTheDocument();
  });

  test('input 포커스 시 "참가하기"버튼 visible', async () => {
    const onClickFn = jest.fn();
    render(
      <EnterRoom
        buttonText={'enter'}
        inputPlaceHolder={'placeholder'}
        enterRoomButtonClick={onClickFn}
      />,
    );

    const inputElement = screen.getByPlaceholderText('placeholder');
    fireEvent.focus(inputElement);
    const buttonElement = await screen.findByText('enter');
    expect(buttonElement).toBeInTheDocument();
  });

  test('input 에 입력하고, 참가하기 버튼 눌렀을 시 onClickFn 호출테스트', async () => {
    const onClickFn = jest.fn();
    render(
      <EnterRoom
        buttonText={'enter'}
        inputPlaceHolder={'placeholder'}
        enterRoomButtonClick={onClickFn}
      />,
    );

    const inputElement = screen.getByPlaceholderText('placeholder');
    userEvent.type(inputElement, '123');
    const buttonElement = await screen.findByText('enter');
    userEvent.click(buttonElement);
    expect(onClickFn).toBeCalledWith('123');
  });
});
