import React from 'react';
import {screen, fireEvent} from '@testing-library/react';
import {act} from 'react-dom/test-utils';
import {render} from 'react-dom';
import Navigation from '../Navigation';
import PeerManager, {AudioAnalyser, Me, Peer} from '../../utils/RTCGameUtils';
import RTCSignalingHelper from '../../utils/RTCSignalingHelper';
import {EventEmitter} from 'stream';
import {iceConfig} from '../../utils/IceServerList';
import {unmountComponentAtNode} from 'react-dom';

let socket: any = null;
let me: Me | null = null;
let peerManager: PeerManager | null = null;
let audioContainer: HTMLDivElement | null = null;
let nicknameContainer: HTMLDivElement | null = null;
let textMessageDiv: HTMLDivElement | null = null;
let signalingHelper: RTCSignalingHelper | null = null;
let peer: Peer | null = null;
let peerAudioElement: HTMLAudioElement | null = null;

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
  test('렌더링 후 엔터를 누르면 메세지창이 떠야함.', async () => {
    const avatarChangeButtonBefore =
      screen.queryByPlaceholderText(/메시지를 입력하세요/i);
    expect(avatarChangeButtonBefore).toBe(null);
    await act(async () => {
      fireEvent.keyDown(window, {key: 'Enter'});
    });
    const avatarChangeButtonAfter =
      screen.queryByPlaceholderText(/메시지를 입력하세요/i);
    expect(avatarChangeButtonAfter).not.toBe(null);
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
  test('프로필 창이 떠 있는 상태에서 enter를 눌러도 메세지 창이 뜨지 않아야함.', async () => {
    const profileButton = screen.getByText('mijeong');
    await act(async () => {
      fireEvent.click(profileButton);
    });
    const avatarChangeButtonBefore =
      screen.queryByPlaceholderText(/메시지를 입력하세요/i);
    expect(avatarChangeButtonBefore).toBe(null);
    await act(async () => {
      fireEvent.keyDown(window, {key: 'Enter'});
    });
    const avatarChangeButtonAfter =
      screen.queryByPlaceholderText(/메시지를 입력하세요/i);
    expect(avatarChangeButtonAfter).toBe(null);
  });

  test('음소거 버튼을 한번 눌렀을 때에 음소거 아이콘이 제대로 변해야함.', async () => {
    const muteButton = screen.getByLabelText('audio');
    await act(async () => {
      fireEvent.click(muteButton);
    });
    const muteIcon = screen.getByLabelText('audio-muted');
    expect(muteIcon).not.toBe(null);
  });
  test('음소거 버튼을 두번 눌렀을 때에 음소거 아이콘이 그대로여야함.', async () => {
    const muteButton = screen.getByLabelText('audio');
    await act(async () => {
      fireEvent.click(muteButton);
    });
    const muteIcon = screen.getByLabelText('audio-muted');
    await act(async () => {
      fireEvent.click(muteIcon);
    });
    const originButton = screen.getByLabelText('audio');
    expect(originButton).not.toBe(null);
  });
  test('화면공유 버튼을 눌렀을 때에 화면 공유 창이 떠야함.', async () => {
    const screenShare = screen.getByLabelText('desktop');
    await act(async () => {
      fireEvent.click(screenShare);
    });
    const screenShareTab = screen.getByText('화면 공유');
    expect(screenShareTab).not.toBe(null);
  });
  test('음성 세팅 아이콘을 누르면 음성세팅 창이 떠야함.', async () => {
    const vowelDetect = screen.getByLabelText('smile');
    await act(async () => {
      fireEvent.click(vowelDetect);
    });
    const vowelDetectTab = screen.getByText(
      '다음 모음을 발음하며 저장 버튼을 누르세요.',
    );
    expect(vowelDetectTab).not.toBe(null);
  });
  test('채팅 아이콘을 누르면 채팅 창이 떠야함.', async () => {
    const messengerIcon = screen.getByLabelText('message');
    await act(async () => {
      fireEvent.click(messengerIcon);
    });
    const messegerTab = screen.getByText('메시지');
    expect(messegerTab).not.toBe(null);
  });
  test('패널아이콘을 누르면 패널이 떠야함.', async () => {
    const panelIcon = screen.getByLabelText('up');
    await act(async () => {
      fireEvent.click(panelIcon);
    });
    const panelTab = screen.getByText('참여 링크 복사');
    expect(panelTab).not.toBe(null);
  });
});
