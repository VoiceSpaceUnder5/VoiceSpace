import React from 'react';
import {Menu} from 'antd';
import {LeftCircleFilled} from '@ant-design/icons';

export interface MessageProps {
  onClickPrevious: () => void;
}

export function Message(props: MessageProps): JSX.Element {
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
