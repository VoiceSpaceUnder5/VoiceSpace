import AudioStreamHelper from '../AudioStreamHelper';

const mockMediaStream = new MediaStream();

const mockEnumerateDevices: MediaDeviceInfo[] = [
  {
    deviceId: 'default',
    groupId: 'testGroupID1',
    kind: 'audioinput',
    label: 'default - InputLabel1',
    toJSON: jest.fn(),
  },
  {
    deviceId: 'enaiuwnfui',
    groupId: 'testGroupID1',
    kind: 'audioinput',
    label: 'InputLabel1',
    toJSON: jest.fn(),
  },
  {
    deviceId: 'asnefinoasn',
    groupId: 'testGroupID1',
    kind: 'audioinput',
    label: 'mijeong air pro',
    toJSON: jest.fn(),
  },

  {
    deviceId: 'default',
    groupId: 'testGroupID2',
    kind: 'audiooutput',
    label: 'default - outputLabel1',
    toJSON: jest.fn(),
  },
  {
    deviceId: 'afafafafe',
    groupId: 'testGroupID2',
    kind: 'audiooutput',
    label: 'outputLabel1',
    toJSON: jest.fn(),
  },
  {
    deviceId: 'enenenen',
    groupId: 'testGroupID2',
    kind: 'audiooutput',
    label: 'mijeong air pro',
    toJSON: jest.fn(),
  },
];

const setGUMSuccessAndEDSuccess = (ms: any, ed: any) => {
  // read-only property 가 포함되어 있을 경우, beforeEach 에서 직접 변경해야 됨.
  Object.defineProperty(global.navigator, 'mediaDevices', {
    value: {
      getUserMedia: jest.fn().mockReturnValue(Promise.resolve(ms)),
      enumerateDevices: jest.fn().mockReturnValue(Promise.resolve(ed)),
    },
    configurable: true,
  });
};

beforeEach(() => {
  setGUMSuccessAndEDSuccess(mockMediaStream, mockEnumerateDevices);
});

afterEach(() => {
  AudioStreamHelper.clear();
});

describe('AudioStreamHelper test', () => {
  test('getMicDevices 호출시, inputDevices 만 리턴 해줌 (.kind === "audioinput").', async () => {
    const result = await AudioStreamHelper.getMicDevices();
    result.forEach(mediaDeviceInfo => {
      expect(mediaDeviceInfo.kind).toBe('audioinput');
    });
  });
  test('getMicDevices 호출시, default 와 라벨이 겹치는 것 하나만 제외하고 inputDevices 그대로 리턴해줌.', async () => {
    const result = await AudioStreamHelper.getMicDevices();
    // default 와 라벨 겹치는게 없는지 테스트
    expect(result.length).not.toBe(0);
    const filtered = result.filter(mdi => {
      return mdi.label === 'InputLabel1' && mdi.deviceId !== 'default';
    });
    expect(filtered.length).toBe(0);
  });
  test('getSpeakerDevices 호출시, default 와 라벨이 겹치는 것 하나만 제외하고 outputDevices 그대로 리턴해줌.', async () => {
    const result = await AudioStreamHelper.getSpeakerDevices();
    result.forEach(mediaDeviceInfo => {
      expect(mediaDeviceInfo.kind).toBe('audiooutput');
    });
  });
  test('getSpeakerDevices 호출시, default 와 라벨이 겹치는 것 하나만 제외하고 outputDevices 그대로 리턴해줌.', async () => {
    const result = await AudioStreamHelper.getSpeakerDevices();
    // default 와 라벨 겹치는게 없는지 테스트
    expect(result.length).not.toBe(0);

    const filtered = result.filter(mdi => {
      return mdi.label === 'outputLabel1' && mdi.deviceId !== 'default';
    });
    expect(filtered.length).toBe(0);
  });
  test('getLocalAudioStream 호출 시, 콜백 호출', async () => {
    const cb = jest.fn();
    AudioStreamHelper.getLocalAudioStream(cb);
    await new Promise((r: any) => setTimeout(r, 5));
    expect(cb).toBeCalledWith(mockMediaStream);
  });
  test('micDeivcedId 변경 시, 기존 콜백 정상적으로 호출 되는지', async () => {
    const cb = jest.fn();
    AudioStreamHelper.getLocalAudioStream(cb);
    await new Promise((r: any) => setTimeout(r, 5));
    expect(cb).toBeCalledWith(mockMediaStream);
    const newMediaStream = new MediaStream();
    setGUMSuccessAndEDSuccess(newMediaStream, mockEnumerateDevices);
    AudioStreamHelper.micDeviceId = 'mijeong';
    await new Promise((r: any) => setTimeout(r, 5));
    expect(cb).toBeCalledWith(newMediaStream);
  });
});
