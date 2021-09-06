import React, {useState} from 'react';
import {Menu, Dropdown} from 'antd';
import {AudioMutedOutlined, LeftCircleFilled} from '@ant-design/icons';
import {
  AvatarImageEnum,
  avatarImageMDs,
  AvatarPartImageEnum,
} from '../utils/ImageMetaData';

export interface UserInfo {
  nickname: string;
  avatar: AvatarImageEnum;
  setVolume: (volumnMultiplyValue: number) => void;
}

export interface UsersDropDownProps {
  getUsers: () => UserInfo[];
  onClickPrevious: () => void;
}

export function UsersDropDown(props: UsersDropDownProps): JSX.Element {
  const users = props.getUsers();
  return (
    // <div></div>
    <Menu className="user_drop_down">
      <Menu.Item key="0">
        <div className="users_title">
          <div>사용자</div>
          <div>
            <LeftCircleFilled onClick={props.onClickPrevious} />
          </div>
        </div>
      </Menu.Item>
      <Menu.Divider></Menu.Divider>
      <Menu.Item key="1">
        {users.map((user, idx) => (
          <div className="user_list" key={idx} style={{color: '#606060'}}>
            <div>
              <img
                className="user_list_avatar"
                src={
                  avatarImageMDs[user.avatar].avatarMDInfos[
                    AvatarPartImageEnum.FACE_MUTE
                  ].src
                }
              ></img>{' '}
              {user.nickname}
            </div>
            <div>
              <AudioMutedOutlined
                className="user_list_mic"
                onClick={() => {
                  user.setVolume(0);
                }}
              />
            </div>
          </div>
        ))}
      </Menu.Item>
    </Menu>
  );
}

export default null;
