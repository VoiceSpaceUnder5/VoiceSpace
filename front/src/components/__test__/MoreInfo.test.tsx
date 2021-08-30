import React from 'react';
import {render, screen} from '@testing-library/react';
import MoreInfo from '../MoreInfo';
import userEvent from '@testing-library/user-event';

describe('MoreInfo test', () => {
  test('html a 요소 클릭시 callback 호출 테스트', () => {
    const aClickFn = jest.fn();
    render(
      <MoreInfo brInnerText="brtext" aInnerText="atext" aOnClick={aClickFn} />,
    );
    const aElement = screen.getByText(/atext/i);
    userEvent.click(aElement);
    expect(aClickFn).toBeCalled();
  });
});
