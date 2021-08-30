import React, {useState, useContext} from 'react';
import {Menu, Dropdown, Button} from 'antd';
import {LeftCircleFilled, RightCircleFilled} from '@ant-design/icons';
import GlobalContext from '../utils/GlobalContext';
import '../pages/spacePage/space.css';
const imgSrcs = [
  './assets/spaceMain/avatar/brownHorseFaceMute.png',
  './assets/spaceMain/avatar/brownBearFaceMute.png',
  './assets/spaceMain/avatar/pinkPigFaceMute.png',
  './assets/spaceMain/avatar/whiteRabbitFaceMute.png',
];

const animalName: string[] = ['말', '곰', '돼지', '토끼'];

function Profile(): JSX.Element {
  const globalContext = useContext(GlobalContext);
  const [changedName, setChangedName] = useState(globalContext.initialInfo[1]);
  const [nickname, setNickname] = useState(globalContext.initialInfo[1]);
  const [avatarIdx, setAvatarIdx] = useState(
    Number(globalContext.initialInfo[0]),
  );
  const [changedIdx, setChangedIdx] = useState(
    Number(globalContext.initialInfo[0]),
  );
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
  const notChanged = () => {
    setTimeout(() => {
      setNickname(changedName);
      setAvatarIdx(changedIdx);
    }, 500);
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
        setChangedIdx(avatarIdx);
      } else {
        onProfileChangeButtonClick(
          avatarIdx,
          anonymous + animalName[avatarIdx],
        );
        setNickname(anonymous + animalName[avatarIdx]);
        setChangedName(anonymous + animalName[avatarIdx]);
        setChangedIdx(avatarIdx);
      }
    };
    return (
      <Menu className="navbar_profile">
        <div className="profile_title">프로필 설정</div>
        <Menu.Divider></Menu.Divider>
        <div>
          <div className="name_title">이름</div>
          <div className="profile_input">
            <input value={nickname} onChange={onNicknameInput} />
          </div>
          <div className="avatar_title">아바타</div>
          <div className="profile_avatar">
            <button>
              <LeftCircleFilled onClick={onLeftClick} />
            </button>
            <img className="avatar_preview" src={imgSrcs[avatarIdx]}></img>
            <button>
              <RightCircleFilled onClick={onRightClick} />
            </button>
          </div>
        </div>
        <div className="profile_button">
          <Button type="primary" shape="round" onClick={onProfileChangeClick}>
            변경
          </Button>
        </div>
      </Menu>
    );
  };
  return (
    <Dropdown
      onVisibleChange={notChanged}
      overlay={profile}
      trigger={['click']}
    >
      <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
        <span className="navbar_button">{changedName}</span>
      </a>
    </Dropdown>
  );
}

export default Profile;
