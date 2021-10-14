import React, {useState, useRef, useEffect} from 'react';
import {Popover} from 'antd';
import {CloseCircleFilled, MessageOutlined} from '@ant-design/icons';
import {DataDto, DataDtoType} from '../utils/RTCGameUtils';
import {ProfileDropdownOnOff} from './Navigation';

export interface Message {
  type: string;
  nickname: string;
  data: string;
}

export interface MessengerProps {
  getMyNickname: () => string;
  sendMessage: (message: string) => void;
  setDataChannelEventHandler: (
    arg0: DataDtoType,
    // eslint-disable-next-line
    arg1: (data: any) => void,
  ) => void;
  profileDropdownOnOff: ProfileDropdownOnOff;
}

export default function Messenger(props: MessengerProps): JSX.Element {
  const [isScrollBottom, setIsScrollBottom] = useState(true);
  const [isTalkerIsMe, setIsTalkerIsMe] = useState(false);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [messageArray, setMessageArray] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (!props || !scrollRef || !scrollRef.current) {
      return;
    }
    const scroll =
      scrollRef.current.scrollHeight - scrollRef.current.clientHeight;
    scrollRef.current.scrollTo(0, scroll);
  };
  useEffect(() => {
    if (isScrollBottom) {
      scrollToBottom();
    } else if (isTalkerIsMe) {
      scrollToBottom();
    }
    setIsTalkerIsMe(false);
  }, [messageArray]);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onMessageInput(e);
  };
  const handleScroll: React.UIEventHandler<HTMLDivElement> = e => {
    const target = e.target as HTMLDivElement;
    if (target.scrollHeight - target.scrollTop === target.clientHeight) {
      setIsScrollBottom(true);
    } else {
      setIsScrollBottom(false);
    }
  };

  const onClickClose = () => {
    setVisible(false);
  };
  const onMessageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const onSubmit = (e: React.FormEvent) => {
    setIsTalkerIsMe(true);
    onSendMessage(e);
  };
  const onSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const data: DataDto = {
      type: DataDtoType.CHAT_MESSAGE,
      data: {
        nickname: props.getMyNickname(),
        data: message,
      },
    };
    props.sendMessage(JSON.stringify(data));
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

  const onKeyDown = (e: KeyboardEvent) => {
    if (props.profileDropdownOnOff.on === false) {
      if (e.key === 'Enter') {
        setVisible(true);
      } else if (e.key === 'Escape') {
        onClickClose();
      }
    }
  };

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [visible]);

  useEffect(() => {
    props.setDataChannelEventHandler(
      DataDtoType.CHAT_MESSAGE,
      onMessageCallback,
    );
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);
  const result = (
    <div className="message_popup">
      <div className="message_title">
        <div style={{fontSize: '15px'}}>메시지</div>
        <div>
          <CloseCircleFilled
            style={{marginLeft: '10px'}}
            onClick={onClickClose}
          />
        </div>
      </div>
      <div>
        <div className="message_array" ref={scrollRef} onScroll={handleScroll}>
          {messageArray?.map((message, index) => {
            return (
              <div className="message" key={index}>
                {message}
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <form onSubmit={onSubmit}>
          <input
            ref={inputRef}
            className="message_input"
            type="text"
            placeholder="메시지를 입력하세요"
            required
            onChange={onChange}
            value={message}
          />
          <button className="message_input_button">전송</button>
        </form>
      </div>
    </div>
  );
  return (
    <Popover visible={visible} content={result} trigger={'click'}>
      <MessageOutlined
        onClick={() => {
          setVisible(true);
        }}
      />
    </Popover>
  );
}
