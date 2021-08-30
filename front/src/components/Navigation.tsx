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

interface NavigationProps {
  peerManager: PeerManager;
  goToHome: () => void;
}

function Navigation(props: NavigationProps): JSX.Element {
  const exit = () => {
    props.peerManager.close();
    props.goToHome();
  };

  return (
    <nav className="navbar">
      <div className="navbar_left">
        <Profile peerManager={props.peerManager} />
      </div>
      <div className="navbar_center">
        <MicOnOff peerManager={props.peerManager} />
        <ScreenShare />
        <Options />
        <div>
          <LogoutOutlined className="navbar_button" onClick={exit} />
        </div>
      </div>
      <div className="navbar_right">
        <Panel peerManager={props.peerManager} />
      </div>
    </nav>
  );
}

export default Navigation;
