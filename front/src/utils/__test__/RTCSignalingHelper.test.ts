import EventEmitter from 'events';
import RTCSignalingHelper, {
  OfferAnswerDto,
  IceDto,
} from '../RTCSignalingHelper';

class MockedSocket extends EventEmitter {
  close = jest.fn();
  id = 'testID';
}

let temp: any = [];
let socket: any = null;
let rtcSignalingHelper: RTCSignalingHelper | null;
const mockedOfferAnswerDto: OfferAnswerDto = {
  fromClientId: 'from',
  toClientId: 'to',
  sdp: temp,
};
const mockedIce: IceDto = {
  fromClientId: 'from',
  toClientId: 'to',
  ice: temp,
};

beforeEach(() => {
  socket = new MockedSocket();
  socket.close = jest.fn();
  socket.id = 'testID';
  rtcSignalingHelper = new RTCSignalingHelper(socket, false);
  rtcSignalingHelper.onOffer = jest.fn();
  rtcSignalingHelper.onAnswer = jest.fn();
  rtcSignalingHelper.onIce = jest.fn();
  rtcSignalingHelper.onNeedToOffer = jest.fn();
});

afterEach(() => {
  rtcSignalingHelper = null;
});

describe('RTCSignalingHelper Test', () => {
  test('getClientID() 호출시 socket.id 의 값이 리턴되어야 함', () => {
    if (!rtcSignalingHelper || !socket) {
      expect(false).toBe(true);
      return;
    }
    expect(rtcSignalingHelper.getSocketID()).toBe('testID');
  });

  test('close() 호출시 socket.close() 가 호출되어야 함', () => {
    if (!rtcSignalingHelper || !socket) {
      expect(false).toBe(true);
      return;
    }
    rtcSignalingHelper.close();
    expect(socket.close).toBeCalledTimes(1);
  });

  test('JoinRoom() 호출시 socket.emit("joinRoom") 호출되야 함.', () => {
    if (!rtcSignalingHelper || !socket) {
      expect(false).toBe(true);
      return;
    }
    const tempFn = jest.fn();
    socket.on('joinRoom', tempFn);
    rtcSignalingHelper.joinRoom('');
    expect(tempFn).toBeCalledTimes(0);
    rtcSignalingHelper.joinRoom('honlee');
    expect(tempFn).toBeCalledTimes(1);
    expect(tempFn).toBeCalledWith('honlee');
  });

  test('server 쪽 socket.emit 시 적절한 함수가 호출 되어야 함.', () => {
    if (!rtcSignalingHelper || !socket) {
      expect(false).toBe(true);
      return;
    }
    socket.emit('offer', mockedOfferAnswerDto);
    expect(rtcSignalingHelper.onOffer).toBeCalledWith(mockedOfferAnswerDto);
    socket.emit('answer', mockedOfferAnswerDto);
    expect(rtcSignalingHelper.onAnswer).toBeCalledWith(mockedOfferAnswerDto);
    socket.emit('ice', mockedIce);
    expect(rtcSignalingHelper.onIce).toBeCalledWith(mockedIce);
    socket.emit('needToOffer', ['test', 'test2']);
    expect(rtcSignalingHelper.onNeedToOffer).toBeCalledWith(['test', 'test2']);
  });

  test('client 쪽 socket.emit 시 적절한 함수가 호출 되어야 함. (dto 의 from 이 잘못되었을 경우는 호출되지 않아야함)', () => {
    if (!rtcSignalingHelper || !socket) {
      expect(false).toBe(true);
      return;
    }
    const offerFn = jest.fn();
    const answerFn = jest.fn();
    const iceFn = jest.fn();
    socket.on('offer', offerFn);
    socket.on('answer', answerFn);
    socket.on('ice', iceFn);

    rtcSignalingHelper.emitOffer(mockedOfferAnswerDto);
    expect(offerFn).toBeCalledTimes(0);

    rtcSignalingHelper.emitAnswer(mockedOfferAnswerDto);
    expect(answerFn).toBeCalledTimes(0);

    rtcSignalingHelper.emitIce(mockedIce);
    expect(iceFn).toBeCalledTimes(0);

    const oad = {...mockedOfferAnswerDto};
    oad.fromClientId = 'testID';
    const ice = {...mockedIce};
    ice.fromClientId = 'testID';

    rtcSignalingHelper.emitOffer(oad);
    expect(offerFn).toBeCalledTimes(1);
    expect(offerFn).toBeCalledWith(oad);

    rtcSignalingHelper.emitAnswer(oad);
    expect(answerFn).toBeCalledTimes(1);
    expect(answerFn).toBeCalledWith(oad);

    rtcSignalingHelper.emitIce(ice);
    expect(iceFn).toBeCalledTimes(1);
    expect(iceFn).toBeCalledWith(ice);
  });
});
