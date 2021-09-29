import React, {useState} from 'react';
import {Menu, Dropdown} from 'antd';
import {LeftCircleFilled, RightCircleFilled} from '@ant-design/icons';
import '../pages/spacePage/space.css';
import {
  AvatarImageEnum,
  avatarImageMDs,
  AvatarPartImageEnum,
} from '../utils/ImageMetaData';

export interface ProfileProps {
  nickname: string;
  setNickname: (nickname: string) => void;
  avatar: AvatarImageEnum;
  setAvatar: (avatar: AvatarImageEnum) => void;
}

export function ProfileDropDown(props: ProfileProps): JSX.Element {
  const [newNickname, setNewNickname] = useState(props.nickname);
  const [newAvatar, setNewAvatar] = useState(props.avatar);
  const numberOfAvatars = avatarImageMDs.length;

  const onNicknameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewNickname(e.target.value);
  };
  const onLeftClick = () => {
    setNewAvatar(beforeAvatar => {
      let newAvatar = beforeAvatar - 1;
      if (newAvatar < 0) newAvatar = numberOfAvatars - 1;
      return newAvatar;
    });
  };
  const onRightClick = () => {
    setNewAvatar(beforeAvatar => {
      let newAvatar = beforeAvatar + 1;
      if (newAvatar >= numberOfAvatars) newAvatar = 0;
      return newAvatar;
    });
  };
  const onProfileChangeClick = () => {
    let nextNickname = newNickname;
    if (newNickname === '') {
      nextNickname = `익명의 ${avatarImageMDs[newAvatar].avatarInitialName}`;
    }
    props.setAvatar(newAvatar);
    props.setNickname(nextNickname);
  };
  return (
    <Menu className="navbar_profile">
      <Menu.Item key="1" disabled={true} className="profile_title">
        프로필 설정
      </Menu.Item>
      <Menu.Divider></Menu.Divider>
      <Menu.Item key="2" disabled={true}>
        <div className="name_title">이름</div>
        <form
          onSubmit={e => {
            e.preventDefault();
            onProfileChangeClick();
          }}
        >
          <div className="profile_input">
            <input
              data-testid="profileDropdownInputTestId"
              maxLength={10}
              value={newNickname}
              onChange={onNicknameInput}
            />
          </div>
          <div className="avatar_title">아바타</div>
          <div className="profile_avatar">
            <button>
              <LeftCircleFilled
                data-testid="profileDropdownLeftButtonTestId"
                onClick={e => {
                  e.preventDefault();
                  onLeftClick();
                }}
              />
            </button>
            <img
              className="avatar_preview"
              src={
                avatarImageMDs[newAvatar].avatarMDInfos[
                  AvatarPartImageEnum.FACE_MUTE
                ].src
              }
            ></img>
            <button>
              <RightCircleFilled
                data-testid="profileDropdownRightButtonTestId"
                onClick={e => {
                  e.preventDefault();
                  onRightClick();
                }}
              />
            </button>
          </div>
        </form>
      </Menu.Item>
      <Menu.Item
        key="3"
        className="profile_button"
        onClick={onProfileChangeClick}
      >
        <div className="change_button">변경</div>
      </Menu.Item>
    </Menu>
  );
}

function Profile(props: ProfileProps): JSX.Element {
  const [nickname, setNickname] = useState(props.nickname);
  const [avatar, setAvatar] = useState(props.avatar);

  const newSetNickname = (nickname: string): void => {
    props.setNickname(nickname);
    setNickname(nickname);
  };
  const newSetAvatar = (avatar: AvatarImageEnum): void => {
    props.setAvatar(avatar);
    setAvatar(avatar);
  };
  const profileDropDownProps: ProfileProps = {
    nickname: nickname,
    setNickname: newSetNickname,
    avatar: avatar,
    setAvatar: newSetAvatar,
  };

  return (
    <Dropdown
      data-testid="dropDownTestId"
      overlay={ProfileDropDown(profileDropDownProps)}
      trigger={['click']}
    >
      <a
        role="button"
        className="ant-dropdown-link"
        onClick={e => e.preventDefault()}
      >
        <span className="navbar_button">{nickname}</span>
      </a>
    </Dropdown>
  );
}

export default Profile;
