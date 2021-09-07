import React from 'react';
import {Menu} from 'antd';
import {LeftCircleFilled} from '@ant-design/icons';
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

export interface UsersListProps {
  getUsers: () => UserInfo[];
  onClickPrevious: () => void;
}

export function UserList(props: UsersListProps): JSX.Element {
  // const showValue = (e: any) => {
  //   console.log(e);
  // };
  const users = props.getUsers();
  return (
    // <div></div>
    <Menu className="user_drop_down">
      <Menu.Item key="10">
        <div className="users_title">
          <div>사용자</div>
          <div>
            <LeftCircleFilled onClick={props.onClickPrevious} />
          </div>
        </div>
      </Menu.Item>
      <Menu.Divider></Menu.Divider>
      {users.map((user, idx) => {
        return (
          <Menu.Item key={idx.toString()}>
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
              {idx !== 0 ? (
                <input
                  type="range"
                  min="0"
                  max="100"
                  onChange={e => {
                    user.setVolume(Number(e.target.value) * 0.01);
                    e.currentTarget.value = e.target.value;
                  }}
                />
              ) : (
                <></>
              )}
            </div>
          </Menu.Item>
        );
      })}
    </Menu>
  );
}
