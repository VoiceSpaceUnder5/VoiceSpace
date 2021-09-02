import React from 'react'; //test
import {render, screen} from '@testing-library/react';
import Welcome from '../Welcome';

describe('Welcome test', () => {
  test('should render image correctly', () => {
    render(<Welcome logoImageSrc="./assets/home/homeLogo.png" />);
    const imageElement = screen.getByRole('img');
    expect(imageElement).toBeInTheDocument();
    //await new Promise((r: any) => setTimeout(r, 500));
    //expect(funcOnLoad).toBeCalled();
    // const divElement = screen.getByText(/WELCOME/i);
    // expect(divElement).toBeInTheDocument();
    // screen.debug();
  });
});
