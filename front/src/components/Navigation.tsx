import React from 'react';
import 'antd/dist/antd.css';
import '../pages/spacePage/space.css';
import {LogoutOutlined} from '@ant-design/icons';
import MicOnOff from './MicOnOff';
import Profile from './Profile';
import ScreenShare from './ScreenShare';
import Options from './Options';
import Panel from './Panel';
import PeerManager, {AudioAnalyser} from '../utils/RTCGameUtils';
import {AvatarImageEnum} from '../utils/ImageMetaData';
import {message} from 'antd';
import {UserInfo} from './UserList';
import {Message} from './Messenger';
import VowelDetectButton from './VowelDetectButton';

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

  const addVideoTrack = (stream: MediaStream): void => {
    stream.getTracks().forEach(track => {
      props.peerManager.screenVideoTracks.push(track);
    });
    props.peerManager.forEachPeer(peer => {
      stream.getTracks().forEach(track => {
        peer.addTrack(track);
      });
      props.peerManager.peerOffer(peer);
    });
  };

  const removeVideoTrack = (): void => {
    props.peerManager.screenVideoTracks =
      props.peerManager.screenVideoTracks.filter(track => {
        return track.kind !== 'video';
      });
    props.peerManager.forEachPeer(peer => {
      peer.getSenders().forEach(sender => {
        if (sender.track?.kind === 'video') peer.removeTrack(sender);
      });
      peer.transmitUsingDataChannel(
        JSON.stringify({type: 'closeVideo', data: ''}),
      );
    });
  };

  const setTrackEventHandler = (
    trackEventHandler: (peerId: string, event: RTCTrackEvent | null) => void,
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
      peer.getSenders().forEach(sender => {
        if (sender.track?.kind === 'audio') {
          peer.removeTrack(sender);
        }
      });
      stream.getTracks().forEach(track => {
        peer.addTrack(track);
      });
      props.peerManager.peerOffer(peer);
    });
    props.peerManager.me.setAnalyser(new AudioAnalyser(stream));
    props.peerManager.localStream = stream;
    catchAudioTrackEnended(stream);
  };
  const catchAudioTrackEnended = (catchedStream: MediaStream) => {
    catchedStream.getAudioTracks()[0].onended = () => {
      console.log('!!!!change localStream!!!!');
      navigator.mediaDevices
        .enumerateDevices()
        .then((deviceInfos: MediaDeviceInfo[]) => {
          const deviceId = deviceInfos[1].deviceId;
          navigator.mediaDevices
            .getUserMedia({video: false, audio: {deviceId: deviceId}})
            .then(stream => {
              changeInputStream(stream);
            });
        });
    };
  };
  catchAudioTrackEnended(props.peerManager.localStream);
  return (
    <>
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
            addVideoTrack={addVideoTrack}
            setTrackEventHandler={setTrackEventHandler}
            removeVideoTrack={removeVideoTrack}
          />
          <Options
            changeEachAudio={changeEachAudio}
            changeInputStream={changeInputStream}
          />
          <VowelDetectButton />
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
    </>
  );
}

export default Navigation;
