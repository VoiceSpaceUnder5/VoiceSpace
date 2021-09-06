import React, {useState} from 'react';
import {Menu, Dropdown} from 'antd';
import {
  UpOutlined,
  LeftCircleFilled,
  // AudioOutlined,
  AudioMutedOutlined,
} from '@ant-design/icons';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import '../pages/spacePage/space.css';
import {Peer, Me} from '../utils/RTCGameUtils';
import {avatarImageMDs, AvatarPartImageEnum} from '../utils/ImageMetaData';

export interface PanelProps {
  // nickname: string;
  me: Me;
  roomId: string;
  peers: Map<string, Peer>;
  onCopy: () => void;
}

interface MenuItemProps {
  key: string;
}

export interface PanelDropDownProps {
  roomId: string;
  onCopy: () => void;
  onClickSubMenu: (e: MenuItemProps) => void;
}

export interface UsersDropDownProps {
  me: Me;
  // nickname: string;
  peers: Map<string, Peer>;
  onClickPrevious: () => void;
}

export interface MessageDropDownProps {
  onClickPrevious: () => void;
}

export function PanelDropDown(props: PanelDropDownProps): JSX.Element {
  return (
    <Menu>
      <Menu.Item key="0">
        <CopyToClipboard
          text={`https://giggleforest.com/space?roomId=${props.roomId}`}
          onCopy={props.onCopy}
        >
          <a>참여 링크 복사</a>
        </CopyToClipboard>
      </Menu.Item>
      <Menu.Item key="1" onClick={props.onClickSubMenu}>
        사용자
      </Menu.Item>
      <Menu.Item key="2" onClick={props.onClickSubMenu}>
        메시지
      </Menu.Item>
    </Menu>
  );
}

export function UsersDropDown(props: UsersDropDownProps): JSX.Element {
  const users = [];
  users.push([`${props.me.nickname} (나)`, props.me.avatar]);
  props.peers.forEach(peer => {
    users.push([peer.div.innerText, peer.avatar]);
  });
  return (
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
                  avatarImageMDs[Number(user[1])].avatarMDInfos[
                    AvatarPartImageEnum.FACE_MUTE
                  ].src
                }
              ></img>{' '}
              {user[0]}
            </div>
            <div>
              <AudioMutedOutlined className="user_list_mic" />
            </div>
          </div>
        ))}
      </Menu.Item>
    </Menu>
  );
}

export function MessageDropDown(props: UsersDropDownProps): JSX.Element {
  return (
    <Menu className="message_drop_down">
      <Menu.Item key="0">
        <div className="message_title">
          <div>메시지</div>
          <div>
            <LeftCircleFilled onClick={props.onClickPrevious} />
          </div>
        </div>
      </Menu.Item>
      <Menu.Divider></Menu.Divider>
      <Menu.Item key="1">구현 예정</Menu.Item>
    </Menu>
  );
}

function Panel(props: PanelProps): JSX.Element {
  const [subMenu, setSubMenu] = useState(0);
  const [visible, setVisible] = useState(false);

  const onClickSubMenu = (e: MenuItemProps) => {
    setVisible(true);
    setSubMenu(Number(e.key));
  };
  const onClickPrevious = () => {
    setVisible(true);
    setSubMenu(0);
  };
  const handleVisibleChange = () => {
    setVisible(!visible);
    setTimeout(() => {
      setSubMenu(0);
    }, 500);
  };
  return (
    <Dropdown
      visible={visible}
      onVisibleChange={handleVisibleChange}
      overlay={
        subMenu === 0
          ? PanelDropDown({...props, onClickSubMenu: onClickSubMenu})
          : subMenu === 1
          ? UsersDropDown({...props, onClickPrevious: onClickPrevious})
          : MessageDropDown({...props, onClickPrevious: onClickPrevious})
      }
      trigger={['click']}
    >
      <a
        role="button"
        className="ant-dropdown-link"
        onClick={e => e.preventDefault()}
      >
        <UpOutlined className="navbar_button" />
      </a>
    </Dropdown>
  );
}

export default Panel;
