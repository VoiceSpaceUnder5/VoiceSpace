import React, {useState} from 'react';
import {Menu, Dropdown} from 'antd';
import {UpOutlined} from '@ant-design/icons';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import '../pages/spacePage/space.css';
import {UserInfo, UserList} from './UserList';
import {DataDtoType} from '../utils/RTCGameUtils';
import {ProfileDropdownOnOff} from './Navigation';
import Options from './Options';

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
  exit: () => void;
  // Options props
  changeEachAudio: (deviceId: string) => void;
  changeInputStream: (stream: MediaStream) => void;
  seletedOutputDevice: string;
  seletedInputDevice: string;
}

interface MenuItemProps {
  key: string;
}

export interface PanelDropDownProps {
  roomId: string;
  onCopy: () => void;
  onClickSubMenu: (e: MenuItemProps) => void;
  onClickPrevious: () => void;
  onChangeVolume: (changedVolume: number) => void;
  getUsers: () => UserInfo[];
  hidePanel: () => void;
  exit: () => void;
  // Options props
  changeEachAudio: (deviceId: string) => void;
  changeInputStream: (stream: MediaStream) => void;
  seletedOutputDevice: string;
  seletedInputDevice: string;
}

export function PanelDropDown(props: PanelDropDownProps): JSX.Element {
  const [userListVisible, setUserListVisible] = useState(false);

  const onClickUserList = () => {
    // props.hidePanel();
    setUserListVisible(true);
  };

  const onClickOption = () => {
    // add
  };
  return (
    <Menu className="dropdown_menu">
      <Menu.Item key="0">
        <CopyToClipboard
          text={`https://giggleforest.com/space?roomId=${props.roomId}`}
          onCopy={props.onCopy}
        >
          <a>참여 링크 복사</a>
        </CopyToClipboard>
      </Menu.Item>
      <Menu.Item key="1" onClick={onClickUserList}>
        <Dropdown
          placement={'topCenter'}
          visible={userListVisible}
          onVisibleChange={setUserListVisible}
          overlay={UserList({
            getUsers: props.getUsers,
            onClickPrevious: props.onClickPrevious,
            onChangeVolume: props.onChangeVolume,
          })}
          trigger={['click']}
        >
          <a
            role="button"
            className="ant-dropdown-link"
            onClick={e => e.preventDefault()}
          >
            사용자
          </a>
        </Dropdown>
      </Menu.Item>
      <Menu.Item key="2" onClick={onClickOption}>
        <Options
          onClickOption={onClickOption}
          changeEachAudio={props.changeEachAudio}
          changeInputStream={props.changeInputStream}
          seletedInputDevice={props.seletedInputDevice}
          seletedOutputDevice={props.seletedOutputDevice}
        />
      </Menu.Item>
      <Menu.Item key="3" onClick={props.exit}>
        나가기
      </Menu.Item>
    </Menu>
  );
}

function Panel(props: PanelProps): JSX.Element {
  const [visible, setVisible] = useState(false);
  const [volume, setVolume] = useState(0);

  const onClickSubMenu = () => {
    setVisible(true);
  };
  const onClickPrevious = () => {
    setVisible(true);
  };
  const hidePanel = () => {
    setVisible(false);
  };
  const onChangeVolume = (changedVolume: number) => {
    volume;
    setVolume(changedVolume);
  };

  return (
    <Dropdown
      placement={'topCenter'}
      visible={visible}
      onVisibleChange={setVisible}
      overlay={PanelDropDown({
        roomId: props.roomId,
        getUsers: props.getUsers,
        onCopy: props.onCopy,
        onClickSubMenu: onClickSubMenu,
        onClickPrevious: onClickPrevious,
        onChangeVolume: onChangeVolume,
        hidePanel: hidePanel,
        exit: props.exit,
        changeEachAudio: props.changeEachAudio,
        changeInputStream: props.changeInputStream,
        seletedOutputDevice: props.seletedOutputDevice,
        seletedInputDevice: props.seletedInputDevice,
      })}
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
