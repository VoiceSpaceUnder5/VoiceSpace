import React from 'react';
import {Menu, Dropdown} from 'antd';
import {UpOutlined} from '@ant-design/icons';

const Panel = () => {
  const panel = () => {
    return (
      <Menu>
        <Menu.Item key="0">
          <a href="https://www.antgroup.com">설정</a>
        </Menu.Item>
        <Menu.Item key="1">
          <a href="https://www.aliyun.com"> 문제 해결 및 도움말</a>
        </Menu.Item>
      </Menu>
    );
  };
  return (
    <Dropdown overlay={panel} trigger={['click']}>
      <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
        <UpOutlined className="navigationObject" />
      </a>
    </Dropdown>
  );
};

export default Panel;
