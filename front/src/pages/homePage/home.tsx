import React from 'react';
import {RouteComponentProps} from 'react-router-dom';
import {message} from 'antd';
import {v4 as uuidV4} from 'uuid';
import './home.css';
import Welcome from '../../components/Welcome';
import Descript from '../../components/Descript';
import CreateRoom from '../../components/CreateRoom';
import EnterRoom from '../../components/EnterRoom';
import MoreInfo from '../../components/MoreInfo';

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
        <Welcome
          logoImageSrc="./assets/home/homeLogo.png"
          logoImageOnload={() => {
            console.log('logoImageOnload called');
          }}
        />
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
