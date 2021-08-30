import React, {useState} from 'react';
import {Button} from 'antd';

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

export default EnterRoom;
