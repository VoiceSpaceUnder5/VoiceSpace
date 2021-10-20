import {EventEmitter} from 'stream';
import PeerManager, {AudioAnalyser, Me, Peer, PlayerDto} from '../RTCGameUtils';
import RTCSignalingHelper from '../RTCSignalingHelper';
import {iceConfig} from '../IceServerList';
jest.mock('../RTCSignalingHelper');

let socket: any = null;
let me: Me | null = null;
let peerManager: PeerManager | null = null;
let audioContainer: HTMLDivElement | null = null;
let nicknameContainer: HTMLDivElement | null = null;
let textMessageDiv: HTMLDivElement | null = null;
let signalingHelper: RTCSignalingHelper | null = null;
let peer: Peer | null = null;
let peerAudioElement: HTMLAudioElement | null = null;

const joinRoomSpy = jest.spyOn(RTCSignalingHelper.prototype, 'joinRoom');

const mockVideoTrack: any = {
  kind: 'audio',
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

class MockedSocket extends EventEmitter {
  close = jest.fn();
  id = 'testID';
}

beforeEach(() => {
  socket = new MockedSocket();
  socket.close = jest.fn();
  socket.id = 'testID';
  socket.off = jest.fn();
  socket.emit = jest.fn();
  audioContainer = document.createElement('div');
  nicknameContainer = document.createElement('div');
  textMessageDiv = document.createElement('div');
  const me = new Me(
    nicknameContainer,
    nicknameContainer,
    new AudioAnalyser(mockVideoStream, 5, 30, 50),
    {x: 50, y: 50},
    'honlee',
    '',
  );

  signalingHelper = new RTCSignalingHelper(socket, false);
  peerManager = new PeerManager(
    signalingHelper,
    mockVideoStream,
    audioContainer,
    nicknameContainer,
    iceConfig,
    'testRoomID',
    me,
  );
  peerAudioElement = document.createElement('audio');
  peer = new Peer(
    signalingHelper,
    'kilee',
    mockVideoStream,
    peerAudioElement,
    nicknameContainer,
    textMessageDiv,
    iceConfig,
    new Map(),
    jest.fn(),
  );
});

afterEach(() => {
  socket = null;
  audioContainer = null;
  nicknameContainer = null;
  signalingHelper = null;
  peerAudioElement = null;
  peer = null;
});

describe('peerManager Test', () => {
  test('생성 후 , signalingHelper 의 joinRoom 을 한번, 정상적으로 호출하였는지 확인', () => {
    expect(peerManager).not.toBe(null);
    expect(joinRoomSpy).toBeCalledTimes(1);
    expect(joinRoomSpy).toBeCalledWith(peerManager?.roomID);
  });
  test('needToOffer event 시 정상적으로 peer 가 만들어 지는지 확인, 그리고 해당 peer 나간 후 없어지는 지도 확인', async () => {
    const socketIDs = ['kilee', 'hyeonkim'];
    signalingHelper!.onNeedToOffer(socketIDs);
    await new Promise(r => setTimeout(r, 10));
    expect(peerManager?.peers.size).toBe(socketIDs.length);
    expect(signalingHelper?.emitOffer).toBeCalledTimes(2);
    signalingHelper!.onPeerExitRoom('kilee');
    expect(peerManager?.peers.size).toBe(socketIDs.length - 1);
  });
  test('peerManager close 호출 시 signalingHelper 의 close 가 호출되는지', () => {
    peerManager?.close();
    expect(signalingHelper?.close).toBeCalledTimes(1);
  });
  test('peerManager onOffer 호출시 정상적으로 createNewPeerAndAddPeers 동작하여 peers peer 가 추가되는지 확인', () => {
    const offerDto = {
      fromClientId: 'kilee',
      sdp: 'sdpfromkileetotestID',
      toClientId: 'testID',
    };
    signalingHelper?.onOffer(offerDto as any);
    expect(peerManager?.peers.size).toBe(1);
  });
});

describe('peer test', () => {
  test('peer 의 update 호출 시 자신이 가진 PlayerDto 관련 요소가 모두 매개변수와 같아져야함', () => {
    const data: PlayerDto = {
      centerPos: {x: 5, y: 5},
      nickname: 'honlee',
      textMessage: 'asdf',
      avatar: 1,
      avatarFace: 3,
      avatarFaceScale: 1.5,
      partRotatedegree: 3,
      lookLeft: true,
      rotateCounterclockwise: true,
    };

    peer?.update(data);
    expect(peer?.centerPos).toBe(data.centerPos);
    expect(peer?.nickname).toBe(data.nickname);
    expect(peer?.textMessage).toBe(data.textMessage);
    expect(peer?.avatar).toBe(data.avatar);
    expect(peer?.avatarFace).toBe(data.avatarFace);
    expect(peer?.avatarFaceScale).toBe(data.avatarFaceScale);
    expect(peer?.partRotatedegree).toBe(data.partRotatedegree);
    expect(peer?.nicknameDiv.innerText).toBe(data.nickname);
    expect(peer?.textMessageDiv.innerText).toBe(data.textMessage);
    expect(peer?.lookLeft).toBe(data.lookLeft);
  });
});
