import React, {useState} from 'react';
import {RouteComponentProps} from 'react-router-dom';
import {message, Button} from 'antd';
import {v4 as uuidV4} from 'uuid';
import './home.css';

function Welcome(): JSX.Element {
  return (
    <>
      <img className="logoImage" src="./assets/home/homeLogo.png" />
      <div className="welcome">
        WELCOME
        <br />
        VOICE SPACE
      </div>
    </>
  );
}

function Descript(): JSX.Element {
  return (
    <>
      무료로 친구들과 즐거운 대화를 나눠보세요.
      <br />
      VOICE SPACE는 피로하지 않은 원격 소통 서비스를 제공합니다.
      <br />
    </>
  );
}

interface CreateRoomProps {
  createRoomButtonClick: () => void;
}

function CreateRoom(props: CreateRoomProps) {
  return (
    <div>
      <br />
      <Button
        id="button"
        shape="round"
        type="primary"
        onClick={props.createRoomButtonClick}
      >
        새로운 보이스 채팅
      </Button>
    </div>
  );
}

interface EnterRoomProps {
  enterRoomButtonClick: (arg0: string) => void;
}

function EnterRoom(props: EnterRoomProps): JSX.Element {
  const [roomId, setRoomId] = useState('');

  // const info = () => {
  //   message.info('유효하지 않은 코드입니다');
  // };
  const element: JSX.Element = (
    <>
      <br />
      <Button id="button" onClick={() => props.enterRoomButtonClick(roomId)}>
        참가하기
      </Button>
    </>
  );

  const [focus, setFocus] = useState(0);

  const onFocus = () => {
    setFocus(1);
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '') setFocus(0);
  };

  const inputOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomId(e.target.value);
  };

  return (
    <div>
      또는
      <br />
      <input
        className="input"
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder="코드(RoomId)를 입력해주세요."
        value={roomId}
        onChange={inputOnchange}
      />
      {focus ? element : null}
    </div>
  );
}

function MoreInfo(): JSX.Element {
  return (
    <>
      <br />
      VOICE SPACE에 대해
      <a href="www.naver.com"> 자세히 알아보세요</a>
    </>
  );
}

function Home(props: RouteComponentProps): JSX.Element {
  const enterRoomClick = (roomId: string) => {
    props.history.push(`/space?roomId=${roomId}`);
  };

  const createRoomClick = () => {
    message.info(
      '새로운 음성채팅방에 입장하셨습니다. 주소를 복사하여 친구들을 초대해 보세요!',
    );
    props.history.push(`/space?roomId=${uuidV4()}`);
  };

  return (
    <div className="home">
      <div className="top">
        <Welcome />
      </div>
      <div className="bottom">
        <Descript />
        <CreateRoom createRoomButtonClick={createRoomClick} />
        <EnterRoom enterRoomButtonClick={enterRoomClick} />
        <MoreInfo />
      </div>
    </div>
  );
}

export default Home;
