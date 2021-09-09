import React from 'react'; //docs 배포 테스트
import {render} from '@testing-library/react';
import Home from '../Home';

describe('Home test', () => {
  const temp: any = {};
  test('렌더링 테스트', () => {
    render(<Home {...temp} />);
  });
});
