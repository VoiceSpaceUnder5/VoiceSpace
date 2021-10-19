import React from 'react';
import {Menu} from 'antd';
import {LeftCircleFilled} from '@ant-design/icons';
import {AvatarImageEnum, avatarImageMDs} from '../utils/ImageMetaData';
import '../pages/spacePage/space.css';

export interface UserInfo {
  nickname: string;
  avatar: AvatarImageEnum;
  volume: number;
  setVolume: (volumnMultiplyValue: number) => void;
}

export interface UsersListProps {
  getUsers: () => UserInfo[];
  onClickPrevious: () => void;
  onChangeVolume: (volume: number) => void;
}

export function UserList(props: UsersListProps): JSX.Element {
  const users = props.getUsers();
  return (
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
      {users &&
        users.map((user, idx) => {
          return (
            <Menu.Item key={idx.toString()}>
              <div
                className="user_list"
                key={idx + 1}
                style={{color: '#606060'}}
              >
                <div>
                  <img
                    className="user_list_avatar"
                    src={avatarImageMDs[user.avatar].avatarProfileSrc}
                  ></img>{' '}
                  {user.nickname}
                </div>
                {idx !== 0 ? (
                  <div className="panel_volume">
                    <input
                      role="button"
                      className="panel_volume_bar"
                      type="range"
                      min="0"
                      max="100"
                      value={user.volume * 100}
                      onChange={e => {
                        user.setVolume(Number(e.target.value) * 0.01);
                        props.onChangeVolume(user.volume);
                      }}
                    />
                    <output className="panel_volume_value">
                      {Math.round(user.volume * 100)}
                    </output>
                  </div>
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
