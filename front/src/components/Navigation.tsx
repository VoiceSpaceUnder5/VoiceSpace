import React from 'react';
import 'antd/dist/antd.css';
import '../pages/spacePage/space.css';
import {LogoutOutlined} from '@ant-design/icons';
import MicOnOff from './MicOnOff';
import Profile from './Profile';
import ScreenShare from './ScreenShare';
import Options from './Options';
import Panel from './Panel';
import PeerManager, {TrackKind} from '../utils/RTCGameUtils';
import {AvatarImageEnum} from '../utils/ImageMetaData';
import {message} from 'antd';
import {UserInfo} from './UserList';
import {Message} from './Messenger';

interface NavigationProps {
  peerManager: PeerManager;
  goToHome: () => void;
}

function Navigation(props: NavigationProps): JSX.Element {
  const exit = () => {
    props.peerManager.close();
    props.goToHome();
  };
  const setNickName = (nickname: string): void => {
    props.peerManager.me.nickname = nickname;
  };
  const setAvatar = (avatar: AvatarImageEnum): void => {
    props.peerManager.me.avatar = avatar;
  };
  const setIsMicOn = (isOn: boolean): void => {
    props.peerManager.localStream.getAudioTracks()[0].enabled = isOn;
  };
  const onCopy = () => {
    message.info('클립보드에 복사 되었습니다!');
  };
  const sendMessage = (message: string) => {
    props.peerManager.peers.forEach(peer => {
      peer.transmitUsingDataChannel(message);
    });
  };
  const setOnMessageCallback = (
    onMessageCallback: (message: Message) => void,
  ) => {
    props.peerManager.setOnMessageCallback(onMessageCallback);
  };
  const getMyNickname = (): string => {
    return props.peerManager.me.nickname;
  };
  const addTrack = (stream: MediaStream, trackKind: TrackKind): void => {
    props.peerManager.forEachPeer(peer => {
      stream.getTracks().forEach(track => {
        peer.addTrackAndSaveOutput(track, trackKind);
      });
      props.peerManager.peerOffer(peer);
    });
  };
  const removeTrack = (trackKind: TrackKind): void => {
    props.peerManager.forEachPeer(peer => {
      peer.removeTrackFromSaveOutput(trackKind);
      props.peerManager.peerOffer(peer);
    });
  };

  const setTrackEventHandler = (
    trackEventHandler: (event: RTCTrackEvent) => void,
  ) => {
    props.peerManager.trackEventHandler = trackEventHandler;
  };
  const getUsers = (): UserInfo[] => {
    const result: UserInfo[] = [
      {
        nickname: `${props.peerManager.me.nickname} (나)`,
        avatar: props.peerManager.me.avatar,
        volume: 1,
        setVolume: (arg0: number) => {
          console.error(
            `called setVolume of ME error. so It doesn't work with ${arg0}`,
          );
        },
      },
    ];
    props.peerManager.peers.forEach(peer => {
      const setVolume = (volumnMultiplyValue: number): void => {
        peer.volumnMultiplyValue = volumnMultiplyValue;
      };
      const temp: UserInfo = {
        nickname: peer.nickname,
        avatar: peer.avatar,
        volume: peer.volumnMultiplyValue,
        setVolume: setVolume,
      };
      result.push(temp);
    });
    return result;
  };

  const changeEachAudio = (deviceId: string): void => {
    props.peerManager.changeEachAudio(deviceId);
  };
  const changeInputStream = (stream: MediaStream): void => {
    props.peerManager.forEachPeer(peer => {
      peer.removeTrackFromSaveOutput(TrackKind.AUDIO);
      stream.getTracks().forEach(track => {
        peer.addTrackAndSaveOutput(track, TrackKind.AUDIO);
      });
      props.peerManager.peerOffer(peer);
    });
  };

  return (
    <nav className="navbar">
      <div className="navbar_left">
        <Profile
          nickname={props.peerManager.me.nickname}
          avatar={props.peerManager.me.avatar}
          setNickname={setNickName}
          setAvatar={setAvatar}
        />
      </div>
      <div className="navbar_center">
        <MicOnOff setIsMicOn={setIsMicOn} />
        <ScreenShare
          addTrack={addTrack}
          setTrackEventHandler={setTrackEventHandler}
          removeTrack={removeTrack}
        />
        <Options
          changeEachAudio={changeEachAudio}
          changeInputStream={changeInputStream}
        />
        <div>
          <LogoutOutlined className="navbar_button" onClick={exit} />
        </div>
      </div>
      <div className="navbar_right">
        <Panel
          getMyNickname={getMyNickname}
          getUsers={getUsers}
          roomId={props.peerManager.roomID}
          onCopy={onCopy}
          sendMessage={sendMessage}
          setOnMessageCallback={setOnMessageCallback}
        />
      </div>
    </nav>
  );
}

export default Navigation;
