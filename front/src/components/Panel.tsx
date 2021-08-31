import React from 'react';
import {Menu, Dropdown} from 'antd';
import {UpOutlined} from '@ant-design/icons';
import {CopyToClipboard} from 'react-copy-to-clipboard';

export interface PanelProps {
  roomId: string;
  onCopy: () => void;
}

export function PanelDropDown(props: PanelProps): JSX.Element {
  return (
    <Menu>
      <Menu.Item key="0">
        <CopyToClipboard
          text={`https://under5.site/space?roomId=${props.roomId}`}
          onCopy={props.onCopy}
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
}

function Panel(props: PanelProps): JSX.Element {
  return (
    <Dropdown overlay={PanelDropDown(props)} trigger={['click']}>
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
