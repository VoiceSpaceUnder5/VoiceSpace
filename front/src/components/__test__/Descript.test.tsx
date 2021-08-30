import React from 'react';
import {render, screen} from '@testing-library/react';
import Descript from '../Descript';

describe('Descript test', () => {
  test('should render component correctly', () => {
    render(<Descript divInnerText={'divinnerText'} brInnerText={'brtest'} />);
    const divElement = screen.getByText(/divinnerText/i);
    const brElement = screen.getByText(/brtest/i);
    // 하나의 test 블럭에 expect 는 하나만 있도록 하는 것이 좋은데,
    // 귀찮아서 이렇게했습니다.
    expect(divElement).toBeInTheDocument();
    expect(brElement).toBeInTheDocument();
  });
});
