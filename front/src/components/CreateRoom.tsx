import React from 'react';
import {Button} from 'antd';

interface CreateRoomProps {
  createRoomButtonClick: () => void;
}

function CreateRoom(props: CreateRoomProps): JSX.Element {
  return (
    <div>
      <br />
      <Button
        id="button"
        shape="round"
        type="primary"
        onClick={props.createRoomButtonClick}
      >
        새로운 음성 미팅 시작하기
      </Button>
    </div>
  );
}

export default CreateRoom;
