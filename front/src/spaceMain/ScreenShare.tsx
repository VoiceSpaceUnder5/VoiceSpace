import React from 'react';
import {Menu, Dropdown} from 'antd';
import {DesktopOutlined} from '@ant-design/icons';
import './spaceMain';

function ScreenShare(): JSX.Element {
  const screenshare = () => {
    return (
      <Menu>
        <Menu.Item key="0">
          <a href="https://www.antgroup.com"> 전체 화면</a>
        </Menu.Item>
        <Menu.Item key="1">
          <a href="https://www.aliyun.com"> 창</a>
        </Menu.Item>
      </Menu>
    );
  };
  return (
    <Dropdown overlay={screenshare} trigger={['click']}>
      <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
        <DesktopOutlined className="navbar_button" />
      </a>
    </Dropdown>
  );
}

export default ScreenShare;
