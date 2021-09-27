import React, {useEffect, useState} from 'react';
import {Menu, Dropdown} from 'antd';
import {UpOutlined} from '@ant-design/icons';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import '../pages/spacePage/space.css';
import {UserInfo, UserList} from './UserList';
import {Message, Messenger} from './Messenger';

export interface PanelProps {
  getMyNickname: () => string;
  getUsers: () => UserInfo[];
  roomId: string;
  onCopy: () => void;
  sendMessage: (message: string) => void;
  setOnMessageCallback: (arg0: (message: Message) => void) => void;
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
      <Menu.Item key="2" onClick={props.onClickSubMenu}>
        메시지
      </Menu.Item>
    </Menu>
  );
}

function Panel(props: PanelProps): JSX.Element {
  const [subMenu, setSubMenu] = useState(0);
  const [visible, setVisible] = useState(false);
  const [volume, setVolume] = useState(0);
  const [message, setMessage] = useState('');
  const [messageArray, setMessageArray] = useState<string[]>([]);

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
  const onChangeVolume = (changedVolume: number) => {
    volume;
    setVolume(changedVolume);
  };
  const onMessageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };
  const onSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const messageData: Message = {
      type: 'message',
      nickname: props.getMyNickname(),
      data: message,
    };
    props.sendMessage(JSON.stringify(messageData));
    setMessage('');
    if (messageArray === undefined) {
      setMessageArray([`나: ${message}`]);
    } else {
      setMessageArray(messageArray.concat(`나: ${message}`));
    }
  };
  const onMessageCallback = (message: Message): void => {
    const newMessage = `${message.nickname}: ${message.data}`;
    setMessageArray(before => {
      return [...before, newMessage];
    });
  };

  useEffect(() => {
    props.setOnMessageCallback(onMessageCallback);
  }, []);

  return (
    <Dropdown
      visible={visible}
      onVisibleChange={handleVisibleChange}
      overlay={
        subMenu === 0
          ? PanelDropDown({...props, onClickSubMenu: onClickSubMenu})
          : subMenu === 1
          ? UserList({
              getUsers: props.getUsers,
              onClickPrevious: onClickPrevious,
              onChangeVolume: onChangeVolume,
            })
          : Messenger({
              messageArray: messageArray,
              onClickPrevious: onClickPrevious,
              message: message,
              onMessageInput: onMessageInput,
              onSendMessage: onSendMessage,
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
