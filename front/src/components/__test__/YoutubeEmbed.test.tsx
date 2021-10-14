import React from 'react';
import {screen} from '@testing-library/react';
import YoutubeEmbedRenderer, {YoutubeEmbedProps} from '../YoutubeEmbed';

const mockedYoutubeEmbedProps: YoutubeEmbedProps = {
  left: 500,
  top: 499,
  videoID: 'testVideoID',
  width: 50,
  height: 49,
};

describe('YoutubeEmbed test', () => {
  test('정상적으로 프로퍼티들이 알맞게 렌더링 되는지 테스트', () => {
    YoutubeEmbedRenderer.render(mockedYoutubeEmbedProps);
    const iframeElement = screen.queryByRole(
      'presentation',
    ) as HTMLIFrameElement;
    expect(iframeElement.src).toMatch(/testVideoID/i);
    expect(iframeElement).toHaveStyle('width:50px');
    expect(iframeElement).toHaveStyle('height:49px');
    expect(iframeElement).toHaveStyle('left:500px');
    expect(iframeElement).toHaveStyle('top:499px');
    YoutubeEmbedRenderer.deleteLastRenderedComponent();
  });

  test('deleteLastRenderedComponent 가 정상적으로 컴포넌트를 삭제하는지 테스트', () => {
    YoutubeEmbedRenderer.render(mockedYoutubeEmbedProps);
    const iframeElement = screen.queryByRole('presentation');
    expect(iframeElement).not.toBe(null); // 정상적으로 렌더링?
    YoutubeEmbedRenderer.deleteLastRenderedComponent();
    const iframeElementAfterDelete = screen.queryByRole('presentation');
    expect(iframeElementAfterDelete).toBe(null); // 정상적으로 삭제?
  });

  test('컴포넌트 렌더링 안된 상태에서 deleteLastRenderedComponent 동작 테스트', () => {
    const save = YoutubeEmbedRenderer.delete;
    YoutubeEmbedRenderer.delete = jest.fn();
    YoutubeEmbedRenderer.deleteLastRenderedComponent();
    expect(YoutubeEmbedRenderer.delete).not.toBeCalled();
    YoutubeEmbedRenderer.delete = save;
  });

  test('delete 가 정상적으로 컴포넌트를 삭제하는지 테스트', () => {
    const container1 = YoutubeEmbedRenderer.render(mockedYoutubeEmbedProps);
    const container2 = YoutubeEmbedRenderer.render(mockedYoutubeEmbedProps);
    const iframeElement = screen.queryAllByRole('presentation'); // 2개가 검색 되어야 함.
    expect(iframeElement).not.toBe(null); // 정상적으로 렌더링?
    YoutubeEmbedRenderer.delete(container2);
    YoutubeEmbedRenderer.delete(container1);
    const iframeElementAfterDelete = screen.queryByRole('presentation');
    expect(iframeElementAfterDelete).toBe(null); // 정상적으로 삭제?
  });

  test('컴포넌트 렌더링 안된 상태에서 deleteLastRenderedComponent 동작 테스트', () => {
    YoutubeEmbedRenderer.delete = jest.fn();
    YoutubeEmbedRenderer.deleteLastRenderedComponent();
    expect(YoutubeEmbedRenderer.delete).not.toBeCalled();
  });
});
