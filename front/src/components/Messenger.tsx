import React, {FormEvent, MutableRefObject} from 'react';
import {Menu} from 'antd';
import {LeftCircleFilled, CloseCircleFilled} from '@ant-design/icons';

export interface Message {
  type: string;
  nickname: string;
  data: string;
}

export interface MessengerProps {
  inputRef: MutableRefObject<HTMLInputElement | null>;
  messageArray: string[] | undefined;
  onClickPrevious: () => void;
  message: string;
  onMessageInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: (e: FormEvent) => void;
  onClickClose: () => void;
}

export function Messenger(props: MessengerProps): JSX.Element {
  return (
    <Menu className="message_drop_down">
      <Menu.Item key="0">
        <div className="message_title">
          <div>메시지</div>
          <div>
            <LeftCircleFilled onClick={props.onClickPrevious} />
            <CloseCircleFilled
              style={{marginLeft: '10px'}}
              onClick={props.onClickClose}
            />
          </div>
        </div>
      </Menu.Item>
      <Menu.Divider></Menu.Divider>
      <Menu.Item key="1">
        <div className="message_array">
          {props.messageArray?.map((message, index) => {
            return (
              <div className="message" key={index}>
                {message}
              </div>
            );
          })}
        </div>
      </Menu.Item>
      <Menu.Item key="2">
        <form onSubmit={props.onSendMessage}>
          <input
            ref={props.inputRef}
            className="message_input"
            type="text"
            placeholder="메시지를 입력하세요"
            required
            onChange={props.onMessageInput}
            value={props.message}
          />
          <button className="message_input_button">전송</button>
        </form>
      </Menu.Item>
    </Menu>
  );
}
