import React, {useEffect} from 'react';
import 'antd/dist/antd.css';
import '../pages/spacePage/space.css';
import {LogoutOutlined} from '@ant-design/icons';
import MicOnOff from './MicOnOff';
import Profile from './Profile';
import ScreenShare from './ScreenShare';
import Options from './Options';
import Panel from './Panel';
import PeerManager, {
  AudioAnalyser,
  DataDto,
  DataDtoType,
  Peer,
  Vec2,
} from '../utils/RTCGameUtils';
import {AvatarImageEnum} from '../utils/ImageMetaData';
import {message} from 'antd';
import {UserInfo} from './UserList';
// import VowelDetectButton from './VowelDetectButton';

interface NavigationProps {
  peerManager: PeerManager;
  goToHome: () => void;
}

interface textMessageDivInnerTextArray {
  time: number;
  textMessage: string;
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

  const textMessageDivInnerTextArray: textMessageDivInnerTextArray[] = [];
  const sendMessage = (stringifiedMessageData: string) => {
    const parsedMessageData = JSON.parse(stringifiedMessageData);
    const textMessage = `${parsedMessageData.data.nickname}: ${parsedMessageData.data.data}`;
    // props.peerManager.me.textMessage = textMessage;
    textMessageDivInnerTextArray.push({
      time: Date.now(),
      textMessage: textMessage,
    });
    props.peerManager.peers.forEach(peer => {
      peer.transmitUsingDataChannel(stringifiedMessageData);
    });
  };

  const textMessageIntervalHanlder = () => {
    if (textMessageDivInnerTextArray.length === 1) {
      if (Date.now() - textMessageDivInnerTextArray[0].time < 3000) {
        props.peerManager.me.textMessage =
          textMessageDivInnerTextArray[0].textMessage;
      } else {
        props.peerManager.me.textMessage = '';
        textMessageDivInnerTextArray.shift();
      }
    } else if (textMessageDivInnerTextArray.length > 1) {
      textMessageDivInnerTextArray.shift();
      props.peerManager.me.textMessage =
        textMessageDivInnerTextArray[0].textMessage;
    }
  };

  useEffect(() => {
    const setIntervalReturnValue = setInterval(textMessageIntervalHanlder, 50);
    return () => {
      console.log('interval clear');
      clearInterval(setIntervalReturnValue);
    };
  }, []);

  const setDataChannelEventHandler = (
    dataType: DataDtoType,
    // eslint-disable-next-line
    dataChannelEventHandler: (arg0: any, peer: Peer) => void,
  ) => {
    props.peerManager.setDataChannelEventHandler(
      dataType,
      dataChannelEventHandler,
    );
  };
  const getMyNickname = (): string => {
    return props.peerManager.me.nickname;
  };

  const getNickNameFromSocketID = (socketID: string): string => {
    if (props.peerManager.peers.has(socketID)) {
      // eslint-disable-next-line
      return props.peerManager.peers.get(socketID)!.nickname;
    } else {
      return '나';
    }
  };

  const addVideoTrack = (stream: MediaStream): void => {
    stream.getTracks().forEach(track => {
      props.peerManager.screenVideoTracks.push(track);
    });
    props.peerManager.forEachPeer(peer => {
      stream.getTracks().forEach(track => {
        peer.addTrack(track, stream);
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
      const data: DataDto = {
        type: DataDtoType.SHARED_SCREEN_CLOSE,
        data: peer.socketID,
      };
      peer.transmitUsingDataChannel(JSON.stringify(data));
    });
  };

  const setOtherSideDrawStartPos = (
    fromSocketID: string,
    toSocketID: string,
    startPos: Vec2,
  ) => {
    const dataDto: DataDto = {
      type: DataDtoType.SHARED_SCREEN_DRAW_START,
      data: {
        fromSocketID: fromSocketID,
        toSocketID: toSocketID,
        startPos: startPos,
      },
    };
    const sendData = JSON.stringify(dataDto);
    props.peerManager.forEachPeer(peer => {
      peer.transmitUsingDataChannel(sendData);
    });
  };

  const setOtherSideDraw = (
    fromSocketID: string,
    toSocketID: string,
    toPos: Vec2,
    strokeColor: string,
    lineWidth: number,
  ) => {
    const dataDto: DataDto = {
      type: DataDtoType.SHARED_SCREEN_DRAWING,
      data: {
        fromSocketID: fromSocketID,
        toSocketID: toSocketID,
        toPos: toPos,
        strokeColor: strokeColor,
        lineWidth: lineWidth,
      },
    };
    const sendData = JSON.stringify(dataDto);
    props.peerManager.forEachPeer(peer => {
      peer.transmitUsingDataChannel(sendData);
    });
  };

  const setOtherSideClear = (fromSocketID: string, toSocketID: string) => {
    const dataDto: DataDto = {
      type: DataDtoType.SHARED_SCREEN_CLEAR,
      data: {
        fromSocketID: fromSocketID,
        toSocketID: toSocketID,
      },
    };
    const sendData = JSON.stringify(dataDto);
    props.peerManager.forEachPeer(peer => {
      peer.transmitUsingDataChannel(sendData);
    });
  };

  const setTrackEventHandler = (
    trackEventHandler: (peerId: string, event: RTCTrackEvent) => void,
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
  // 아래 두 함수가 서로를 참조하고 있고, 그 내부에서 peerManager 를 참조하고 있기 때문에,
  // 두 함수 모두 GC 의 타겟이 되지 않습니다. 따라서 두 함수에서 사용하고 있는 peerManager 도
  // GC 의 타겟이 되지 않기 때문에 지속적으로 쌓이게 됩니다. 메모리 문제도 있지만,
  // webGL context 와 audioContext 의 개수 한계가 금방 오게 됩니다.
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
    //catchAudioTrackEnended(stream);
  };
  //   const catchAudioTrackEnended = (catchedStream: MediaStream) => {
  //     catchedStream.getAudioTracks()[0].onended = () => {
  //       console.log('!!!!change localStream!!!!');
  //       navigator.mediaDevices
  //         .enumerateDevices()
  //         .then((deviceInfos: MediaDeviceInfo[]) => {
  //           const deviceId = deviceInfos[1].deviceId;
  //           navigator.mediaDevices
  //             .getUserMedia({video: false, audio: {deviceId: deviceId}})
  //             .then(stream => {
  //               changeInputStream(stream);
  //             });
  //         });
  //     };
  //   };
  //   catchAudioTrackEnended(props.peerManager.localStream);
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
          socketID={props.peerManager.socketID}
          addVideoTrack={addVideoTrack}
          setTrackEventHandler={setTrackEventHandler}
          removeVideoTrack={removeVideoTrack}
          setDataChannelEventHandler={setDataChannelEventHandler}
          setOtherSideDrawStartPos={setOtherSideDrawStartPos}
          setOtherSideDraw={setOtherSideDraw}
          setOtherSideClear={setOtherSideClear}
          getNickNameFromSocketID={getNickNameFromSocketID}
        />
        <Options
          changeEachAudio={changeEachAudio}
          changeInputStream={changeInputStream}
          seletedInputDevice={props.peerManager.micDeviceID}
          seletedOutputDevice={props.peerManager.speakerDeviceID}
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
          setDataChannelEventHandler={setDataChannelEventHandler}
        />
      </div>
    </nav>
  );
}

export default Navigation;
