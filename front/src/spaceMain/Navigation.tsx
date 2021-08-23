import React, {ChangeEvent, ReactElement, ReactHTML, useState} from 'react';
import {
  RouteComponentProps,
  StaticRouterProps,
  withRouter,
} from 'react-router-dom';
import 'antd/dist/antd.css';
import './spaceMain.css';
import {Menu, Dropdown, message, Button} from 'antd';
import {
  AudioOutlined,
  AudioMutedOutlined,
  EllipsisOutlined,
  UpOutlined,
  DesktopOutlined,
  LogoutOutlined,
  LeftCircleFilled,
  RightCircleFilled,
} from '@ant-design/icons';
import PeerManager from './RTCGameUtils';
import {useContext} from 'react';
import GlobalContext from './GlobalContext';
import MicOnOff from './MicOnOff';
import Profile from './Profile';
import ScreenShare from './ScreenShare';
import Options from './Options';
import Panel from './Panel';

interface NavigationProps {
  initialInfo: [avatarIdx: number, nickname: string];
  peerManager: PeerManager | undefined;
  onProfileChange: (avatarIdx: number, nickname: string) => void;
  myMicToggle: (on: boolean) => void;
  goToHome: () => void;
}

const Navigation = (props: NavigationProps) => {
  const globalContext = useContext(GlobalContext);

  const exit = () => {
    if (globalContext.peerManager) {
      globalContext.peerManager.close();
    }
    props.goToHome();
  };

  return (
    <nav className="navbar">
      <div className="navbar_left">
        <Profile />
      </div>

      <div className="navbar_center">
        <MicOnOff />
        <ScreenShare />
        <Options />
        <LogoutOutlined onClick={exit} />
      </div>

      <div className="navbar_right">
        <li>
          <Panel />
        </li>
      </div>
    </nav>
  );
};

export default Navigation;
