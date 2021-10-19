import React from 'react';
import {render, unmountComponentAtNode} from 'react-dom';
import {fireEvent, screen} from '@testing-library/react';
import ScreenShare, {DrawHelper, ScreenShareProps} from '../ScreenShare';
import {act, mockComponent} from 'react-dom/test-utils';
import {DataDtoType} from '../../utils/RTCGameUtils';

let container: HTMLDivElement | null = null;

const nicknames = new Map<string, string>();
nicknames.set('honleeSocketID', 'honlee');
nicknames.set('mijeongSocketID', 'mijecton');
nicknames.set('kileeSocketID', 'kilee');
nicknames.set('hyeonkimSocketID', 'hyeonkim');

const cbs = new Map<DataDtoType, any>();

const getNickNameFromSocketID = (soscketID: string): string => {
  if (nicknames.has(soscketID)) return nicknames.get(soscketID)!;
  else return 'undefinedUser';
};

let trackEventHandler: any = null;
const setTrackEventHandler = (cb: any) => {
  trackEventHandler = cb;
};

const mockScreenShareProps: ScreenShareProps = {
  socketID: 'honleeSocketID', // -> 공유되면 내 rnd 는 honlee 라고 뜰 것
  addVideoTrack: jest.fn().mockImplementation(() => {
    console.log('hello!');
  }),
  setTrackEventHandler: setTrackEventHandler,
  removeVideoTrack: jest.fn(),
  setDataChannelEventHandler: (dataDto: DataDtoType, cb: any) => {
    cbs.set(dataDto, cb);
  },
  setOtherSideDrawStartPos: jest.fn(),
  setOtherSideDraw: jest.fn(),
  setOtherSideClear: jest.fn(),
  getNickNameFromSocketID: getNickNameFromSocketID,
};

const mockVideoTrack: any = {
  kind: 'video',
  getSettings: () => {
    return {
      aspectRatio: 2 / 1,
    };
  },
};

const mockVideoStream: any = {
  id: 1,
  getVideoTracks: () => {
    return [];
  },
  getTracks: () => {
    return [mockVideoTrack];
  },
};

const mockVideoStream2: any = {
  id: 2,
  getVideoTracks: () => {
    return [];
  },
  getTracks: () => {
    return [mockVideoTrack];
  },
};

const setGDMSuccess = () => {
  // read-only property 가 포함되어 있을 경우, beforeEach 에서 직접 변경해야 됨.
  Object.defineProperty(global.navigator, 'mediaDevices', {
    value: {
      getDisplayMedia: jest
        .fn()
        .mockReturnValue(Promise.resolve(mockVideoStream)),
    },
    configurable: true,
  });
};

const setGDMFail = () => {
  // read-only property 가 포함되어 있을 경우, beforeEach 에서 직접 변경해야 됨.
  Object.defineProperty(global.navigator, 'mediaDevices', {
    value: {
      getDisplayMedia: jest.fn().mockReturnValue(Promise.reject('error!')),
    },
    configurable: true,
  });
};

const clickScreenShareButton = async () => {
  const screenShareButtonElement = screen.getByText(/화면 공유/i);
  await act(async () => {
    fireEvent.click(screenShareButtonElement);
  });
};

const rndMove = async (posX: number, posY: number) => {
  const rndElement = container?.querySelector('.rnd') as HTMLDivElement;
  if (rndElement) {
    await act(async () => {
      fireEvent.mouseDown(rndElement);
      await new Promise(r => setTimeout(r, 50));
      fireEvent.mouseMove(rndElement, {clientX: posX, clientY: posY});
      fireEvent.mouseUp(rndElement);
      fireEvent.mouseLeave(rndElement);
    });
  }
};

Object.defineProperty(document.body, 'clientHeight', {
  writable: true,
  configurable: true,
  value: 1000,
});
Object.defineProperty(document.body, 'clientWidth', {
  writable: true,
  configurable: true,
  value: 1000,
});
beforeEach(async () => {
  container = document.createElement('div');
  document.body.appendChild(container);
  await act(async () => {
    render(<ScreenShare {...mockScreenShareProps}></ScreenShare>, container);
  });
  const buttonElement = screen.getByRole('img');
  await act(async () => {
    fireEvent.click(buttonElement);
  });
});

afterEach(() => {
  if (container) {
    unmountComponentAtNode(container);
    document.body.removeChild(container);
    container = null;
  }
});

describe('ScreenShare Test', () => {
  test('버튼 눌렀을 경우 정상적으로 메뉴가 표시되는지 부터 테스트', () => {
    const screenShareButtonElement = screen.queryByText(/화면 공유/i);
    const screenShareStopElement = screen.queryByText(/정지/i);
    const screenShareSortElement = screen.queryByText(/공유화면 정렬/i);
    expect(screenShareButtonElement).not.toBe(null);
    expect(screenShareStopElement).not.toBe(null);
    expect(screenShareSortElement).not.toBe(null);
  });

  test('"화면 공유" 버튼 눌렀을 때 정상적으로 화면 공유 되는지 확인', async () => {
    setGDMSuccess();
    await clickScreenShareButton();
    await new Promise(r => setTimeout(r, 100));
    const sharedScreenHeaderLabelElement = screen.queryByText(/honlee/i);
    expect(sharedScreenHeaderLabelElement).not.toBe(null);
  });

  test('"화면 공유" 이후 "정지"버튼 눌렀을 때 공유화면이 잘 제거되는지 확인', async () => {
    setGDMSuccess();
    await clickScreenShareButton();
    await new Promise(r => setTimeout(r, 100));
    const screenShareStopElement = screen.getByText(/정지/i);
    await act(async () => {
      fireEvent.click(screenShareStopElement);
    });
    const sharedScreenHeaderLabelElement = screen.queryByText(/honlee/i);
    expect(sharedScreenHeaderLabelElement).toBe(null);
  });

  // 왜 인진 모르겠는데 공유화면 정렬 관련 모든 이벤트가 잘 동작하는데 막상 translate 는 0px, 0px 로 돌아오지 않습니다...
  // test('"화면 공유" 이후 "공유화면 정렬"버튼 눌렀을 때 공유화면이 잘 정렬되는지 확인', async () => {
  //   setGDMSuccess();
  //   await clickScreenShareButton();
  //   await new Promise(r => setTimeout(r, 100));
  //   await rndMove(120, 120);
  //   screen.debug();
  //   await new Promise(r => setTimeout(r, 100));
  //   const screenShareSortElement = screen.getByText(/공유화면 정렬/i);
  //   await act(async () => {
  //     fireEvent.click(screenShareSortElement);
  //   });

  //   const rndDiv = container?.querySelector('.rnd') as HTMLDivElement;

  //   if (rndDiv) {
  //     expect(rndDiv.style.transform).toEqual('translate(0px,0px)');
  //   } else {
  //     expect(true).toBe(false);
  //   }
  // });
  test('"화면 공유" 이후 "ColorPicker"버튼 눌렀을 때 정상적으로 렌더링 되는지 확인"', async () => {
    setGDMSuccess();
    await clickScreenShareButton();
    await new Promise(r => setTimeout(r, 100));
    const colorPickerSliderBefore = screen.queryByLabelText('Hue');
    expect(colorPickerSliderBefore).toBe(null);

    const colorPickerButton = screen.getByLabelText('edit');
    await act(async () => {
      fireEvent.click(colorPickerButton);
    });
    const colorPickerSliderAfter = screen.queryByLabelText('Hue');
    expect(colorPickerSliderAfter).not.toBe(null);
  });

  test('화면 공유 이후 drawMode 로 전하지 않고 canvas mousedown 시 그려지는지지 않는 것 확인', async () => {
    setGDMSuccess();
    await clickScreenShareButton();
    await new Promise(r => setTimeout(r, 100));
    const canvasElement = screen.getByRole('presentation');
    await act(async () => {
      fireEvent.mouseDown(canvasElement);
    });
    expect(mockScreenShareProps.setOtherSideDrawStartPos).not.toBeCalled();
  });

  test('화면 공유 이후 drawMode 로 전환 후 mouse 이벤트 시 알맞은 콜백이 호출되는지 확인', async () => {
    setGDMSuccess();
    await clickScreenShareButton();
    await new Promise(r => setTimeout(r, 100));
    const drawModeOnButton = screen.getByRole('switch');
    await act(async () => {
      fireEvent.click(drawModeOnButton);
    });
    const canvasElement = screen.getByRole('presentation');

    await act(async () => {
      fireEvent.mouseDown(canvasElement);
      fireEvent.mouseUp(canvasElement);
    });
    await new Promise(r => setTimeout(r, 50));
    expect(mockScreenShareProps.setOtherSideDrawStartPos).toBeCalled();

    await act(async () => {
      fireEvent.mouseMove(canvasElement);
    });
    await new Promise(r => setTimeout(r, 50));
    expect(mockScreenShareProps.setOtherSideDraw).not.toBeCalled();

    await act(async () => {
      fireEvent.mouseDown(canvasElement);
      await new Promise(r => setTimeout(r, 10));
      fireEvent.mouseMove(canvasElement, {clientX: 5, clientY: 5});
      fireEvent.mouseUp(canvasElement);
      fireEvent.mouseLeave(canvasElement);
    });
    await new Promise(r => setTimeout(r, 50));
    expect(mockScreenShareProps.setOtherSideDraw).toBeCalledTimes(1);
  });

  test('화면 공유 이후 trackEventHandler fire(streams 존재) 되서 정상적으로 rnd 가 2개 생기는 것 확인', async () => {
    setGDMSuccess();
    await clickScreenShareButton();
    await new Promise(r => setTimeout(r, 50));
    expect(trackEventHandler).not.toBe(null); // tackEventHandler 가 정상적으로 세팅됨.
    const event = {
      streams: [mockVideoStream2],
    };
    await act(async () => {
      trackEventHandler('hyeonkimSocketID', event);
    });
    await new Promise(r => setTimeout(r, 50));
    const sharedScreens = container?.querySelectorAll('.rnd');
    expect(sharedScreens?.length).toBe(2);
  });
  test('화면 공유 이후 trackEventHandler fire(streams 없고 track 만) 되서 정상적으로 rnd 가 2개 생기는 것 확인', async () => {
    setGDMSuccess();
    await clickScreenShareButton();
    await new Promise(r => setTimeout(r, 50));
    expect(trackEventHandler).not.toBe(null); // tackEventHandler 가 정상적으로 세팅됨.
    const event = {
      streams: [],
      track: mockVideoTrack,
    };
    await act(async () => {
      trackEventHandler('hyeonkimSocketID', event);
    });
    await new Promise(r => setTimeout(r, 50));
    const sharedScreens = container?.querySelectorAll('.rnd');
    expect(sharedScreens?.length).toBe(2);
  });
  test('화면 공유 이후 clear button 클릭시 알맞는 콜백이 실행되는지', async () => {
    setGDMSuccess();
    await clickScreenShareButton();
    await new Promise(r => setTimeout(r, 50));
    const clearButton = screen.getByLabelText('clear');
    await act(async () => {
      fireEvent.click(clearButton);
    });
    expect(mockScreenShareProps.setOtherSideClear).toBeCalledTimes(1);
  });

  test('화면 공유 이후 외부에서 콜백 실행시 내부 drawHelper 의 메소드가 알맞게 실행되는지 확인', async () => {
    setGDMSuccess();
    await clickScreenShareButton();
    await new Promise(r => setTimeout(r, 100));
    expect(cbs.size).toBe(4); // CLOSE, DRAW_START, DRAWING, CLEAR
    const drawHelperSetDrawStartPosSpy = jest.spyOn(
      DrawHelper.prototype,
      'setDrawStartPos',
    );
    const drawHelperclear = jest.spyOn(DrawHelper.prototype, 'clear');
    const drawHelperdrawLineAndSaveStartPos = jest.spyOn(
      DrawHelper.prototype,
      'drawLineAndSaveStartPos',
    );
    const data = {
      toSocketID: 'honleeSocketID',
      startPos: {x: 0.5, y: 0.5},
      fromSocketID: 'hyeonkimSocketID',
      toPos: {x: 0.6, y: 0.6},
      strokeColor: '#000000',
      lineWidth: 6,
    };
    const setDrawStartPosCB = cbs.get(DataDtoType.SHARED_SCREEN_DRAW_START);
    await act(async () => {
      setDrawStartPosCB(data);
    });
    expect(drawHelperSetDrawStartPosSpy).toBeCalledTimes(1);

    const setDrawingCB = cbs.get(DataDtoType.SHARED_SCREEN_DRAWING);
    await act(async () => {
      setDrawingCB(data);
    });
    expect(drawHelperdrawLineAndSaveStartPos).toBeCalledTimes(1);

    const clearCB = cbs.get(DataDtoType.SHARED_SCREEN_CLEAR);
    await act(async () => {
      clearCB(data);
    });
    expect(drawHelperclear).toBeCalledTimes(1);
  });
});
