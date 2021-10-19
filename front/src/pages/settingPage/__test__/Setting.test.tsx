import React from 'react'; //docs 배포 테스트
import {render} from 'react-dom';
import {fireEvent, screen} from '@testing-library/react';
import Setting, {nicknameDefaultValue} from '../Setting';
import {act} from 'react-dom/test-utils';
import {message} from 'antd';
import {
  AvatarImageEnumMax,
  AvatarImageEnumMin,
} from '../../../utils/pixiUtils/metaData/ImageMetaData';

const settingProps: any = {
  location: {
    search: '?roomId=6240af57-a7d5-4622-a3c3-14c1ec79364e&isNew=true',
  },
  history: {
    push: jest.fn(),
  },
};

const makeQuery = (
  nickname: string = nicknameDefaultValue,
  avatarIdx: number = 0,
  speakerDeviceID: string = 'default',
  micDeviceID: string = 'default',
) => {
  return `/space?roomId=6240af57-a7d5-4622-a3c3-14c1ec79364e&avatarIdx=${avatarIdx}&nickname=${nickname}&speakerDeviceID=${speakerDeviceID}&micDeviceID=${micDeviceID}`;
};

const mockMediaStream: any = 'hello';
const mockEnumerateDevices: MediaDeviceInfo[] = [
  {
    deviceId: 'default',
    groupId: 'testGroupID1',
    kind: 'audioinput',
    label: 'defaultInputLabel1',
    toJSON: jest.fn(),
  },
  {
    deviceId: 'testInputDeviceID2',
    groupId: 'testGroupID2',
    kind: 'audioinput',
    label: 'testInputLabel2',
    toJSON: jest.fn(),
  },
  {
    deviceId: 'default',
    groupId: 'testGroupID1',
    kind: 'audiooutput',
    label: 'defaultoutputLabel1',
    toJSON: jest.fn(),
  },
  {
    deviceId: 'testspeakerDeviceID2',
    groupId: 'testGroupID2',
    kind: 'audiooutput',
    label: 'testoutputLabel2',
    toJSON: jest.fn(),
  },
];
let container: HTMLDivElement | null = null;

const saveMessageError = message.error;

const setGUMSuccessAndEDSuccess = () => {
  // read-only property 가 포함되어 있을 경우, beforeEach 에서 직접 변경해야 됨.
  Object.defineProperty(global.navigator, 'mediaDevices', {
    value: {
      getUserMedia: jest.fn().mockReturnValue(Promise.resolve(mockMediaStream)),
      enumerateDevices: jest
        .fn()
        .mockReturnValue(Promise.resolve(mockEnumerateDevices)),
    },
    configurable: true,
  });
};

const setGUMFailAndEDSuccess = () => {
  // read-only property 가 포함되어 있을 경우, beforeEach 에서 직접 변경해야 됨.
  Object.defineProperty(global.navigator, 'mediaDevices', {
    value: {
      getUserMedia: jest.fn().mockReturnValue(Promise.reject()),
      enumerateDevices: jest
        .fn()
        .mockReturnValue(Promise.resolve(mockEnumerateDevices)),
    },
    configurable: true, // re-define 이 가능하게 해준다.
  });
};

const setGUMSuccessAndEDFail = () => {
  Object.defineProperty(global.navigator, 'mediaDevices', {
    value: {
      getUserMedia: jest.fn().mockReturnValue(Promise.resolve(mockMediaStream)),
      enumerateDevices: jest.fn().mockReturnValue(Promise.reject()),
    },
    configurable: true, // re-define 이 가능하게 해준다.
  });
};

const setAudioElementSetSinkId = () => {
  Object.defineProperty(HTMLMediaElement.prototype, 'setSinkId', {
    value: jest.fn().mockReturnValue(Promise.resolve()),
    configurable: true,
  });
};

const indexLeft = (originIdx: number) => {
  let resultIdx = originIdx - 1;
  if (resultIdx < AvatarImageEnumMin) resultIdx = AvatarImageEnumMax;
  return resultIdx;
};

const indexRight = (originIdx: number) => {
  let resultIdx = originIdx + 1;
  if (resultIdx > AvatarImageEnumMax) resultIdx = AvatarImageEnumMin;
  return resultIdx;
};

jest.mock('antd', () => {
  const antd = jest.requireActual('antd');

  const Select = ({children, onChange}: any) => {
    return <select onChange={e => onChange(e.target.value)}>{children}</select>;
  };

  Select.Option = ({children, ...otherProps}: any) => {
    return <option {...otherProps}>{children}</option>;
  };

  return {
    ...antd,
    Select,
  };
});

beforeEach(() => {
  //참조 : https://stackoverflow.com/questions/62732346/test-exception-unstable-flushdiscreteupdates
  Object.defineProperty(HTMLMediaElement.prototype, 'muted', {
    set: jest.fn(),
    configurable: true,
  });

  container = document.createElement('div');
  document.body.appendChild(container);
  message.error = jest.fn();
});

afterEach(() => {
  if (container) {
    document.body.removeChild(container);
    container = null;
  }
  message.error = saveMessageError;
});

describe('Setting test', () => {
  test('getUserMedia 성공, Enumberate 성공, setSinkId 없음 렌더링 테스트', async () => {
    if (!container) {
      expect(false).toBeTruthy();
    } else {
      await act(async () => {
        setGUMSuccessAndEDSuccess();
        render(<Setting {...settingProps}></Setting>, container);
      });
      expect(message.error).not.toBeCalled();
    }
  });
  test('getUserMedia 성공, Enumberate 성공, setSinkId 있음 렌더링 테스트', async () => {
    if (!container) {
      expect(false).toBeTruthy();
    } else {
      await act(async () => {
        setGUMSuccessAndEDSuccess();
        setAudioElementSetSinkId();
        render(<Setting {...settingProps}></Setting>, container);
      });
      expect(message.error).not.toBeCalled();
    }
  });
  test('getUserMedia 실패, Enumberate 성공 경우 렌더링 테스트', async () => {
    if (!container) {
      expect(false).toBeTruthy();
    } else {
      await act(async () => {
        setGUMFailAndEDSuccess();
        render(<Setting {...settingProps}></Setting>, container);
      });
      expect(message.error).toBeCalled();
    }
  });
  test('getUserMedia 성공, Enumberate 실패 경우 렌더링 테스트', async () => {
    if (!container) {
      expect(false).toBeTruthy();
    } else {
      await act(async () => {
        setGUMSuccessAndEDFail();
        render(<Setting {...settingProps}></Setting>, container);
      });
      expect(message.error).toBeCalled();
    }
  });
  test('getUserMedia 성공, Enumberate 성공, setSinkId 있음, nickname Input 변경 테스트', async () => {
    if (!container) {
      expect(false).toBeTruthy();
    } else {
      await act(async () => {
        setGUMSuccessAndEDSuccess();
        render(<Setting {...settingProps}></Setting>, container);
      });
      const nicknameInputElement = screen.getByDisplayValue(
        new RegExp(nicknameDefaultValue, 'i'),
      );
      fireEvent.change(nicknameInputElement, {target: {value: 'honleeRabbit'}});
      expect(nicknameInputElement).toHaveValue('honleeRabbit');
    }
  });
  test('getUserMedia 성공, Enumberate 성공, setSinkId 있음, avatar 선택 좌측 버튼 테스트', async () => {
    if (!container) {
      expect(false).toBeTruthy();
    } else {
      await act(async () => {
        setGUMSuccessAndEDSuccess();
        render(<Setting {...settingProps}></Setting>, container);
      });
      const leftButtonElement = screen.getAllByRole('button')[0];
      let avatarIdx = 0;
      const enterButtonElement = screen.getByText(/입장하기/i);
      for (let i = 0; i < 15; i++) {
        fireEvent.click(leftButtonElement);
        avatarIdx = indexLeft(avatarIdx);
        fireEvent.click(enterButtonElement);
        expect(settingProps.history.push).toBeCalledWith(
          makeQuery(nicknameDefaultValue, avatarIdx),
        );
      }
    }
  });
  test('getUserMedia 성공, Enumberate 성공, setSinkId 있음, avatar 선택 우측 버튼 테스트', async () => {
    if (!container) {
      expect(false).toBeTruthy();
    } else {
      await act(async () => {
        setGUMSuccessAndEDSuccess();
        render(<Setting {...settingProps}></Setting>, container);
      });
      const RightButtonElement = screen.getAllByRole('button')[1];
      let avatarIdx = 0;
      const enterButtonElement = screen.getByText(/입장하기/i);
      for (let i = 0; i < 15; i++) {
        fireEvent.click(RightButtonElement);
        avatarIdx = indexRight(avatarIdx);
        fireEvent.click(enterButtonElement);
        expect(settingProps.history.push).toBeCalledWith(
          makeQuery(nicknameDefaultValue, avatarIdx),
        );
      }
    }
  });
  test('장치 재검색 성공 테스트', async () => {
    if (!container) {
      expect(false).toBeTruthy();
    } else {
      await act(async () => {
        setGUMSuccessAndEDSuccess();
        setAudioElementSetSinkId();
        render(<Setting {...settingProps}></Setting>, container);
      });
      const devicesReloadButtonElement = screen.getByText(/장치 재검색/i);
      await act(async () => {
        fireEvent.click(devicesReloadButtonElement);
      });
      expect(message.error).not.toBeCalled();
    }
  });
  test('장치 재검색 실패 테스트 (setSinkId 없음)', async () => {
    if (!container) {
      expect(false).toBeTruthy();
    } else {
      await act(async () => {
        setGUMSuccessAndEDSuccess();
        render(<Setting {...settingProps}></Setting>, container);
      });
      Object.defineProperty(HTMLMediaElement.prototype, 'setSinkId', {
        value: jest.fn().mockReturnValue(Promise.reject()),
        configurable: true,
      });
      const devicesReloadButtonElement = screen.getByText(/장치 재검색/i);
      await act(async () => {
        fireEvent.click(devicesReloadButtonElement);
      });
      expect(message.error).toBeCalled();
    }
  });
  test('장치 재검색 실패 테스트 (setSinkId 실패)', async () => {
    if (!container) {
      expect(false).toBeTruthy();
    } else {
      await act(async () => {
        setGUMSuccessAndEDSuccess();
        render(<Setting {...settingProps}></Setting>, container);
      });
      const devicesReloadButtonElement = screen.getByText(/장치 재검색/i);
      await act(async () => {
        fireEvent.click(devicesReloadButtonElement);
      });
      expect(message.error).toBeCalled();
    }
  });
  test('장치 재검색 실패 테스트 (enumerateDevices 실패)', async () => {
    if (!container) {
      expect(false).toBeTruthy();
    } else {
      await act(async () => {
        setGUMSuccessAndEDSuccess();
        render(<Setting {...settingProps}></Setting>, container);
      });
      setGUMSuccessAndEDFail();
      const devicesReloadButtonElement = screen.getByText(/장치 재검색/i);
      await act(async () => {
        fireEvent.click(devicesReloadButtonElement);
      });
      expect(message.error).toBeCalled();
    }
  });
  test('마이크 변경', async () => {
    if (!container) {
      expect(false).toBeTruthy();
    } else {
      await act(async () => {
        setGUMSuccessAndEDSuccess();
        render(<Setting {...settingProps}></Setting>, container);
      });
      const micSelector = screen.getAllByRole('combobox')[1];
      expect(micSelector).toHaveValue(mockEnumerateDevices[0].deviceId);
      const enterButton = screen.getByText(/입장하기/i);
      await act(async () => {
        fireEvent.change(micSelector, {
          target: {value: mockEnumerateDevices[1].deviceId},
        });
      });
      await new Promise((r: any) => setTimeout(r, 100));
      await act(async () => {
        fireEvent.click(enterButton);
      });
      expect(settingProps.history.push).toBeCalledWith(
        makeQuery(
          nicknameDefaultValue,
          0,
          'default',
          mockEnumerateDevices[1].deviceId,
        ),
      );
    }
  });
  test('스피커 변경', async () => {
    if (!container) {
      expect(false).toBeTruthy();
    } else {
      await act(async () => {
        setGUMSuccessAndEDSuccess();
        setAudioElementSetSinkId();
        render(<Setting {...settingProps}></Setting>, container);
      });
      const micSelector = screen.getAllByRole('combobox')[0];
      expect(micSelector).toHaveValue(mockEnumerateDevices[2].deviceId);
      const enterButton = screen.getByText(/입장하기/i);
      await act(async () => {
        fireEvent.change(micSelector, {
          target: {value: mockEnumerateDevices[3].deviceId},
        });
      });
      await new Promise((r: any) => setTimeout(r, 100));
      await act(async () => {
        fireEvent.click(enterButton);
      });
      expect(settingProps.history.push).toBeCalledWith(
        makeQuery(nicknameDefaultValue, 0, mockEnumerateDevices[3].deviceId),
      );
    }
  });
});
