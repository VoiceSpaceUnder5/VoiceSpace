import React from 'react';
import {Menu, Dropdown, message} from 'antd';
import {UpOutlined} from '@ant-design/icons';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import PeerManager from '../utils/RTCGameUtils';

interface PanelProps {
  peerManager: PeerManager;
}

function Panel(props: PanelProps): JSX.Element {
  const panel = () => {
    const messageHandle = () => {
      message.info('Copy Success!');
    };
    Menu.Item;
    return (
      <Menu>
        <Menu.Item key="0">
          <CopyToClipboard
            text={
              'https://under5.site/space?roomId=' + props.peerManager.roomId
            }
            onCopy={messageHandle}
          >
            <a>참여 링크 복사</a>
          </CopyToClipboard>
        </Menu.Item>
        <Menu.Item key="1">
          <a href="naver.com">사용자</a>
        </Menu.Item>
        <Menu.Item key="2">
          <a href="naver.com">메세지</a>
        </Menu.Item>
      </Menu>
    );
  };
  return (
    <Dropdown overlay={panel} trigger={['click']}>
      <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
        <UpOutlined className="navbar_button" />
      </a>
    </Dropdown>
  );
}

export default Panel;
