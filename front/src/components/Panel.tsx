import React, {useState} from 'react';
import {Menu, Dropdown} from 'antd';
import {UpOutlined} from '@ant-design/icons';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import '../pages/spacePage/space.css';
import {UserInfo, UserList} from './UserList';
import {DataDtoType} from '../utils/RTCGameUtils';
import {ProfileDropdownOnOff} from './Navigation';

export interface PanelProps {
  profileDropdownOnOff: ProfileDropdownOnOff;
  getMyNickname: () => string;
  getUsers: () => UserInfo[];
  roomId: string;
  onCopy: () => void;
  sendMessage: (message: string) => void;
  setDataChannelEventHandler: (
    arg0: DataDtoType,
    // eslint-disable-next-line
    arg1: (data: any) => void,
  ) => void;
}

interface MenuItemProps {
  key: string;
}

export interface PanelDropDownProps {
  roomId: string;
  onCopy: () => void;
  onClickSubMenu: (e: MenuItemProps) => void;
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
    </Menu>
  );
}

function Panel(props: PanelProps): JSX.Element {
  const [subMenu, setSubMenu] = useState(0);
  const [visible, setVisible] = useState(false);
  const [volume, setVolume] = useState(0);

  const onClickSubMenu = (e: MenuItemProps) => {
    setVisible(true);
    setSubMenu(Number(e.key));
  };
  const onClickPrevious = () => {
    setVisible(true);
    setSubMenu(0);
  };
  const handleVisibleChange = () => {
    if (subMenu !== 2) {
      setVisible(!visible);
      setTimeout(() => {
        setSubMenu(0);
      }, 500);
    }
  };
  const onChangeVolume = (changedVolume: number) => {
    volume;
    setVolume(changedVolume);
  };

  return (
    <Dropdown
      visible={visible}
      onVisibleChange={handleVisibleChange}
      overlay={
        subMenu === 0
          ? PanelDropDown({...props, onClickSubMenu: onClickSubMenu})
          : UserList({
              getUsers: props.getUsers,
              onClickPrevious: onClickPrevious,
              onChangeVolume: onChangeVolume,
            })
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
