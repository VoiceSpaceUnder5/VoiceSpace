import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {BrowserRouter} from 'react-router-dom';
import Welcome from '../Welcome';

describe('Welcome test', () => {
  test('should render image correctly', async () => {
    const funcOnLoad = jest.fn();

    render(
      <Welcome
        logoImageSrc="./assets/home/homeLogo.png"
        logoImageOnload={funcOnLoad}
      />,
    );
    //const imageElement = screen.getByRole('img');
    await new Promise((r: any) => setTimeout(r, 500));
    expect(funcOnLoad).toBeCalled();

    // const divElement = screen.getByText(/WELCOME/i);
    // expect(divElement).toBeInTheDocument();
    // screen.debug();
  });
});
