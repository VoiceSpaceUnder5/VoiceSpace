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

interface NavigationProps {
  initialInfo: [avatarIdx: number, nickname: string];
  peerManager: PeerManager | undefined;
  onProfileChange: (avatarIdx: number, nickname: string) => void;
  myMicToggle: (on: boolean) => void;
}

const imgSrcs = [
  './assets/spaceMain/animal/brownHorseFaceMute.png',
  './assets/spaceMain/animal/brownBearFaceMute.png',
  './assets/spaceMain/animal/pinkPigFaceMute.png',
  './assets/spaceMain/animal/whiteRabbitFaceMute.png',
];

const animalName: string[] = ['말', '곰', '돼지', '토끼'];

const Navigation = (props: NavigationProps) => {
  const [changedName, setChangedName] = useState(props.initialInfo[1]);
  const [avatarIdx, setAvatarIdx] = useState(props.initialInfo[0]);
  const [nickname, setNickname] = useState(props.initialInfo[1]);

  const globalContext = useContext(GlobalContext);

  const onNicknameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
  };
  const onLeftClick = () => {
    setAvatarIdx((avatarIdx + 3) % 4);
  };
  const onRightClick = () => {
    setAvatarIdx((avatarIdx + 1) % 4);
  };
  const onProfileChangeClick = () => {
    const anonymous = '익명의 ';
    if (nickname !== '') {
      props.onProfileChange(avatarIdx, nickname);
      setNickname(nickname);
      setChangedName(nickname);
    } else {
      props.onProfileChange(avatarIdx, anonymous + animalName[avatarIdx]);
      setNickname(anonymous + animalName[avatarIdx]);
      setChangedName(anonymous + animalName[avatarIdx]);
    }
  };
  const profile = () => {
    const changeProfile = () => {
      console.log('프로필이 변경되었습니다.');
    };
    return (
      <Menu className="profile">
        <span style={{fontSize: '20px', fontWeight: 'bold'}}>프로필 설정</span>
        <div className="profileDisplay">
          이름
          <div>
            <input
              value={nickname}
              onChange={onNicknameInput}
              style={{width: '100%'}}
            />
          </div>
        </div>
        <div className="avatar">
          <div className="profileDisplay">아바타</div>
          <button>
            <LeftCircleFilled onClick={onLeftClick} />
          </button>
          <img
            src={imgSrcs[avatarIdx]}
            style={{width: '10vw', height: '20vh'}}
          ></img>
          <button>
            <RightCircleFilled onClick={onRightClick} />
          </button>
        </div>
        <Button
          type="primary"
          shape="round"
          style={{width: '100%'}}
          onClick={onProfileChangeClick}
        >
          변경
        </Button>
      </Menu>
    );
  };

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
    // props.history.push("/");
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
      <Dropdown overlay={profile} trigger={['click']}>
        <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
          <span className="navigationObject">{changedName}</span>
        </a>
      </Dropdown>
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
