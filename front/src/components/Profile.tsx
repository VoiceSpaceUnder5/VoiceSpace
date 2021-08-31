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
      <div className="profile_title">프로필 설정</div>
      <Menu.Divider></Menu.Divider>
      <div>
        <div className="name_title">이름</div>
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
              onClick={onLeftClick}
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
              onClick={onRightClick}
            />
          </button>
        </div>
      </div>
      <div className="profile_button">
        <Menu.Item className="change_button" onClick={onProfileChangeClick}>
          변경
        </Menu.Item>
      </div>
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
