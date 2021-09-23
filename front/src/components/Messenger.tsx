import React, {FormEvent} from 'react';
import {Menu} from 'antd';
import {LeftCircleFilled} from '@ant-design/icons';

export interface MessengerProps {
  onClickPrevious: () => void;
  message: string;
  onMessageInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: (e: FormEvent) => void;
}

export function Messenger(props: MessengerProps): JSX.Element {
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
      <Menu.Item key="1">
        <form onSubmit={props.onSendMessage}>
          <input
            type="text"
            placeholder="메시지를 입력하세요"
            onChange={props.onMessageInput}
            value={props.message}
          />
          <button>전송</button>
        </form>
      </Menu.Item>
    </Menu>
  );
}
