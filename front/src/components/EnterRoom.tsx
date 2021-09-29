import React, {useState} from 'react';
import {Button} from 'antd';

interface EnterRoomProps {
  inputPlaceHolder: string;
  buttonText: string;
  enterRoomButtonClick: (arg0: string) => void;
}

function EnterRoom(props: EnterRoomProps): JSX.Element {
  const [roomId, setRoomId] = useState('');
  const element: JSX.Element = (
    <>
      <br />
      <Button id="button" onClick={() => props.enterRoomButtonClick(roomId)}>
        {props.buttonText}
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
      <form onSubmit={() => props.enterRoomButtonClick(roomId)}>
        <input
          className="input"
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={props.inputPlaceHolder} //코드(RoomId)를 입력해주세요.
          value={roomId}
          onChange={inputOnchange}
        />
        {focus ? element : null}
      </form>
    </div>
  );
}

export default EnterRoom;
