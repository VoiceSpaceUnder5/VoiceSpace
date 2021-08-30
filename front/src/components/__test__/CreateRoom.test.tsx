import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateRoom from '../CreateRoom';

describe('CreateRoom test', () => {
  test('button click called props.createRoomButtonClick function', async () => {
    const onclickfn = jest.fn();
    render(<CreateRoom createRoomButtonClick={onclickfn} />);
    const buttonElement = screen.getByRole('button');
    userEvent.click(buttonElement);
    expect(onclickfn).toBeCalled();
  });
});
