import React, {useEffect, useRef, useState} from 'react';
import {Menu, Dropdown} from 'antd';
import '../pages/spacePage/space.css';
import {
  AvatarImageEnum,
  avatarImageMDs,
} from '../utils/pixiUtils/metaData/ImageMetaData';
import {ProfileDropdownOnOff} from './Navigation';
import {isMobile} from '../utils/AgentCheck';

export interface ProfileProps {
  profileDropdownOnOff: ProfileDropdownOnOff;
  nickname: string;
  setNickname: (nickname: string) => void;
  avatar: AvatarImageEnum;
  setAvatar: (avatar: AvatarImageEnum) => void;
  setVisible: React.Dispatch<React.SetStateAction<boolean>> | null;
}

export function ProfileDropDown(props: ProfileProps): JSX.Element {
  const [newNickname, setNewNickname] = useState(props.nickname);
  const [newAvatar, setNewAvatar] = useState(props.avatar);
  const numberOfAvatars = avatarImageMDs.length;

  const inputRef = useRef<HTMLInputElement>(null);

  if (!isMobile()) {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }

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
      setNewNickname(nextNickname);
    }
    props.setAvatar(newAvatar);
    props.setNickname(nextNickname);
    if (!props.setVisible) {
      return;
    }
    props.setVisible(false);
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
            props.profileDropdownOnOff.on = false;
          }}
        >
          <div className="profile_input">
            <input
              ref={inputRef}
              data-testid="profileDropdownInputTestId"
              maxLength={10}
              value={newNickname}
              onChange={onNicknameInput}
            />
          </div>
        </form>
        <div className="avatar_title">아바타</div>
        <div className="profile_avatar">
          <button
            className="profile_left_button"
            data-testid="profileDropdownLeftButtonTestId"
            onClick={e => {
              e.preventDefault();
              onLeftClick();
            }}
          >
            <img src="./assets/navigation/profile_left_button.png"></img>
          </button>
          <img
            className="avatar_preview"
            src={avatarImageMDs[newAvatar].avatarProfileSrc}
          ></img>
          <button
            className="profile_right_button"
            data-testid="profileDropdownRightButtonTestId"
            onClick={e => {
              e.preventDefault();
              onRightClick();
            }}
          >
            <img src="./assets/navigation/profile_right_button.png"></img>
          </button>
        </div>
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
  const [visible, setVisible] = useState(props.profileDropdownOnOff.on);

  const newSetNickname = (nickname: string): void => {
    props.setNickname(nickname);
    setNickname(nickname);
  };
  const newSetAvatar = (avatar: AvatarImageEnum): void => {
    props.setAvatar(avatar);
    setAvatar(avatar);
  };
  const profileDropDownProps: ProfileProps = {
    profileDropdownOnOff: props.profileDropdownOnOff,
    nickname: nickname,
    setNickname: newSetNickname,
    avatar: avatar,
    setAvatar: newSetAvatar,
    setVisible: setVisible,
  };
  const onEscKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      props.profileDropdownOnOff.on = false;
      setVisible(false);
    }
  };
  useEffect(() => {
    window.addEventListener('keydown', onEscKeyDown);
    return () => {
      window.removeEventListener('keydown', onEscKeyDown);
    };
  }, []);
  useEffect(() => {
    props.profileDropdownOnOff.on = visible;
  }, [visible]);

  return (
    <Dropdown
      placement={'topLeft'}
      visible={visible}
      data-testid="dropDownTestId"
      onVisibleChange={setVisible}
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
