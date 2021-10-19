import React from 'react';
import {screen, fireEvent} from '@testing-library/react';
import {render} from 'react-dom';
import Navigation from '../Navigation';
import userEvent from '@testing-library/user-event';
import PeerManager, {AudioAnalyser, Me, Peer} from '../../utils/RTCGameUtils';
import RTCSignalingHelper from '../../utils/RTCSignalingHelper';
import {EventEmitter} from 'stream';
import {iceConfig} from '../../utils/IceServerList';
import {unmountComponentAtNode} from 'react-dom';
import {act} from 'react-dom/test-utils';

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
  onended: jest.fn(),
};

const mockVideoStream: any = {
  id: 1,
  getVideoTracks: () => {
    return [];
  },
  getTracks: () => {
    return [mockVideoTrack];
  },
  getAudioTracks: () => {
    return [mockVideoTrack];
  },
};

class MockedSocket extends EventEmitter {
  close = jest.fn();
  id = 'testID';
}

let container: HTMLDivElement | null = null;

beforeEach(async () => {
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
    'mijeong',
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
  container = document.createElement('div');
  document.body.appendChild(container);
  const mockNavigatorProps = {
    peerManager: peerManager,
    goToHome: jest.fn(),
  };
  await act(async () => {
    render(<Navigation {...mockNavigatorProps}></Navigation>, container);
  });
});

afterEach(() => {
  socket = null;
  audioContainer = null;
  nicknameContainer = null;
  signalingHelper = null;
  peerAudioElement = null;
  peer = null;

  if (container) {
    unmountComponentAtNode(container);
    document.body.removeChild(container);
    container = null;
  }
});

describe('Navigator test', () => {
  test('정상적으로 렌더링 되는지 테스트', () => {
    const divElement = screen.queryByText('mijeong');
    expect(divElement).not.toBe(null);
  });
  test('프로필 버튼을 눌렀을 때 프로필 창이 정상적으로 렌더링 되는지 체크', async () => {
    const avatarChangeButtonBefore = screen.queryByText(/변경/i);
    expect(avatarChangeButtonBefore).toBe(null);
    const profileButton = screen.getByText('mijeong');
    await act(async () => {
      fireEvent.click(profileButton);
    });
    const avatarChangeButtonAfter = screen.queryByText(/변경/i);
    expect(avatarChangeButtonAfter).not.toBe(null);
  });
});
