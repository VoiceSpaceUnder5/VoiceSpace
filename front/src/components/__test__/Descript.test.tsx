import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {BrowserRouter} from 'react-router-dom';
import Descript from '../Descript';

describe('Descript test', () => {
  test('should render component correctly', async () => {
    render(<Descript divInnerText={'divinnerText'} brInnerText={'brtest'} />);
    const divElement = screen.getByText(/divinnerText/i);
    const brElement = screen.getByText(/brtest/i);
    expect(divElement).toBeInTheDocument();
    expect(brElement).toBeInTheDocument();
  });
});
