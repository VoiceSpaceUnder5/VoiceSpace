import React from 'react';
import 'antd/dist/antd.css';
import '../pages/spacePage/space.css';
import {LogoutOutlined} from '@ant-design/icons';
import MicOnOff from './MicOnOff';
import Profile from './Profile';
import ScreenShare from './ScreenShare';
import Options from './Options';
import Panel from './Panel';
import PeerManager from '../utils/RTCGameUtils';
import {AvatarImageEnum} from '../utils/ImageMetaData';
import {message} from 'antd';

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
        <ScreenShare />
        <Options />
        <div>
          <LogoutOutlined className="navbar_button" onClick={exit} />
        </div>
      </div>
      <div className="navbar_right">
        <Panel roomId={props.peerManager.roomId} onCopy={onCopy} />
      </div>
    </nav>
  );
}

export default Navigation;
