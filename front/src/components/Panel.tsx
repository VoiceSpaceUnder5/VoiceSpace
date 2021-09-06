import React, {useState} from 'react';
import {Menu, Dropdown} from 'antd';
import {UpOutlined, LeftCircleFilled} from '@ant-design/icons';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import '../pages/spacePage/space.css';
import {Peer} from '../utils/RTCGameUtils';
import {UserInfo, UsersDropDown} from './UserDropDown';

export interface PanelProps {
  getUsers: () => UserInfo[];
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

export function MessageDropDown(props: MessageDropDownProps): JSX.Element {
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
          ? UsersDropDown({
              getUsers: props.getUsers,
              onClickPrevious: onClickPrevious,
            })
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
