import React from 'react';
import 'antd/dist/antd.css';
import './spaceMain.css';
import {LogoutOutlined} from '@ant-design/icons';
import {useContext} from 'react';
import GlobalContext from './GlobalContext';
import MicOnOff from './MicOnOff';
import Profile from './Profile';
import ScreenShare from './ScreenShare';
import Options from './Options';
import Panel from './Panel';

interface NavigationProps {
  goToHome: () => void;
}

function Navigation(props: NavigationProps): JSX.Element {
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
        <LogoutOutlined className="navbar_button" onClick={exit} />
      </div>

      <div className="navbar_right">
        <li>
          <Panel />
        </li>
      </div>
    </nav>
  );
}

export default Navigation;
