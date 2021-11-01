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

let audioStreamHelper: AudioStreamHelper | null = null;

beforeEach(async () => {
  setGUMSuccessAndEDSuccess(mockMediaStream, mockEnumerateDevices);
  audioStreamHelper = new AudioStreamHelper();
  await audioStreamHelper.getDefaultDevice();
});

afterEach(() => {
  audioStreamHelper = null;
});

describe('AudioStreamHelper test', () => {
  test('getMicDevices 호출시, inputDevices 만 리턴 해줌 (.kind === "audioinput").', async () => {
    const result = await audioStreamHelper!.getMicDevices();
    result.forEach(mediaDeviceInfo => {
      expect(mediaDeviceInfo.kind).toBe('audioinput');
    });
  });
  test('getSpeakerDevices 호출시, outputDevices 만 리턴 해줌 (.kind === "audiooutput").', async () => {
    const result = await audioStreamHelper!.getSpeakerDevices();
    result.forEach(mediaDeviceInfo => {
      expect(mediaDeviceInfo.kind).toBe('audiooutput');
    });
  });
  // test('micDeivcedId 변경 시, 기존 콜백 정상적으로 호출 되는지', async () => {
  //   const cb = jest.fn();
  //   AudioStreamHelper.addOnLocalAudioStream(cb);
  //   await getLocalAudioStreamAndAwait5ms(cb);
  //   expect(cb).toBeCalledWith(mockMediaStream);
  //   const newMediaStream = new MediaStream();
  //   setGUMSuccessAndEDSuccess(newMediaStream, mockEnumerateDevices);
  //   AudioStreamHelper.micDeviceId = 'mijeong';
  //   await new Promise((r: any) => setTimeout(r, 5));
  //   expect(cb).toBeCalledWith(newMediaStream);
  // });
  // test('callback 집어넣고, removeOnLocalAudioStream 했을때 정상적으로 사라지는지', async () => {
  //   const cb = jest.fn();
  //   AudioStreamHelper.addOnLocalAudioStream(cb);
  //   await getLocalAudioStreamAndAwait5ms();
  //   expect(cb).toBeCalledTimes(1);
  //   await getLocalAudioStreamAndAwait5ms();
  //   expect(cb).toBeCalledTimes(2);
  //   AudioStreamHelper.removeOnLocalAudioStream(cb);
  //   await getLocalAudioStreamAndAwait5ms();
  //   expect(cb).toBeCalledTimes(2);
  // });
});
