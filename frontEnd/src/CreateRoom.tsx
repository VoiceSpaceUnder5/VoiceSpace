import { react } from "@babel/types";
import { Button } from 'antd';

function CreateRoom() {
    const onClick = () => {
        console.log('button clicked');
    }
    return (
		<>
		<br />
      <Button id='button' shape='round' type='primary' onClick={onClick} >새로운 보이스 채팅</Button>
	  </>
    );
  }

export default CreateRoom;