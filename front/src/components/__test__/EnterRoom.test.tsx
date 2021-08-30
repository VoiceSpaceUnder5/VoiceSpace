import React from 'react';
import {render, screen} from '@testing-library/react';
import EnterRoom from '../EnterRoom';

describe('EnterRoom test', () => {
  test('input 포커스 시 "참가하기"버튼 visible', async () => {
    const onClickFn = jest.fn();

    render(
      <EnterRoom
        buttonText={'enter'}
        inputPlaceHolder={'placeholder'}
        enterRoomButtonClick={onClickFn}
      />,
    );

    //await new Promise((r: any) => setTimeout(r, 500));
    //expect(funcOnLoad).toBeCalled();
    // const divElement = screen.getByText(/WELCOME/i);
    // expect(divElement).toBeInTheDocument();
    // screen.debug();
  });
});
