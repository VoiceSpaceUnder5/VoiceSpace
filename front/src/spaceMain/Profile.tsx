import React, {useState, useContext} from 'react';
import {Menu, Dropdown, Button} from 'antd';
import {LeftCircleFilled, RightCircleFilled} from '@ant-design/icons';
import GlobalContext from './GlobalContext';

const imgSrcs = [
  './assets/spaceMain/animal/brownHorseFaceMute.png',
  './assets/spaceMain/animal/brownBearFaceMute.png',
  './assets/spaceMain/animal/pinkPigFaceMute.png',
  './assets/spaceMain/animal/whiteRabbitFaceMute.png',
];

const animalName: string[] = ['말', '곰', '돼지', '토끼'];

const Profile = () => {
  const globalContext = useContext(GlobalContext);
  const [changedName, setChangedName] = useState(globalContext.initialInfo[1]);
  const [avatarIdx, setAvatarIdx] = useState(globalContext.initialInfo[0]);
  const [nickname, setNickname] = useState(globalContext.initialInfo[1]);
  const onProfileChangeButtonClick = (
    newAvatarIdx: number,
    newNickname: string,
  ) => {
    if (globalContext.peerManager !== undefined) {
      globalContext.peerManager.me.avatar = newAvatarIdx;
      globalContext.peerManager.me.div.innerText = newNickname;
      globalContext.peerManager.me.nickname = newNickname;
    }
  };
  const profile = () => {
    if (globalContext.peerManager === undefined) {
      return <></>;
    }
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
        onProfileChangeButtonClick(avatarIdx, nickname);
        setNickname(nickname);
        setChangedName(nickname);
      } else {
        onProfileChangeButtonClick(
          avatarIdx,
          anonymous + animalName[avatarIdx],
        );
        setNickname(anonymous + animalName[avatarIdx]);
        setChangedName(anonymous + animalName[avatarIdx]);
      }
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
  return (
    <Dropdown overlay={profile} trigger={['click']}>
      <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
        <span className="navigationObject">{changedName}</span>
      </a>
    </Dropdown>
  );
};

export default Profile;
