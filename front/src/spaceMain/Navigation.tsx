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

interface NavigationProps {
  initialInfo: [avatarIdx: number, nickname: string];
  peerManager: PeerManager | undefined;
  onProfileChange: (avatarIdx: number, nickname: string) => void;
  myMicToggle: (on: boolean) => void;
  goToHome: () => void;
}

const Navigation = (props: NavigationProps) => {
  const globalContext = useContext(GlobalContext);

  const panel = () => {
    const onClickLink = () => {
      // 복사 시켜줘야한다. 성공했는지 못했는지는 분기해주자.
      message.success('복사 성공!');
    };
    const onClickUsers = () => {
      console.log('user!!');
    };
    const onClickMessage = () => {
      console.log('message!!!');
    };
    return (
      <Menu>
        <Menu.Item key="0">
          <button onClick={onClickLink}>참여 링크 복사</button>
        </Menu.Item>
        <Menu.Item key="1">
          <button onClick={onClickUsers}>사용자</button>
        </Menu.Item>
        <Menu.Item key="3">
          <button onClick={onClickMessage}>메시지</button>
        </Menu.Item>
      </Menu>
    );
  };

  const screenshare = (
    <Menu>
      <Menu.Item key="0">
        <a href="https://www.antgroup.com"> 전체 화면</a>
      </Menu.Item>
      <Menu.Item key="1">
        <a href="https://www.aliyun.com"> 창</a>
      </Menu.Item>
    </Menu>
  );

  const exit = () => {
    if (globalContext.peerManager) {
      globalContext.peerManager.peers.forEach(peer => {
        peer.close();
      });
      globalContext.peerManager.socket.close();
    }
    props.goToHome();
  };

  const options = (
    <Menu>
      <Menu.Item key="0">
        <a href="https://www.antgroup.com">설정</a>
      </Menu.Item>
      <Menu.Item key="1">
        <a href="https://www.aliyun.com"> 문제 해결 및 도움말</a>
      </Menu.Item>
    </Menu>
  );

  return (
    <div id="footer">
      <Profile />
      <span className="footerCenter">
        <div style={{display: 'inline'}}></div>
        <MicOnOff />
        <Dropdown overlay={screenshare} trigger={['click']}>
          <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
            <DesktopOutlined className="navigationObject" />
          </a>
        </Dropdown>
        <Dropdown overlay={options} trigger={['click']}>
          <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
            <EllipsisOutlined
              className="navigationObject"
              style={{transform: 'rotate(90deg)'}}
            />
          </a>
        </Dropdown>
        <LogoutOutlined className="navigationObject" onClick={exit} />
      </span>
      <Dropdown overlay={panel} trigger={['click']}>
        <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
          <UpOutlined className="navigationObject" />
        </a>
      </Dropdown>
    </div>
  );
};

export default Navigation;
