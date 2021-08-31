import React from 'react';
import {RouteComponentProps} from 'react-router-dom';
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
    props.history.push(`/space?roomId=${uuidV4()}&isNew=true`);
  };

  const aOnClick = () => {
    window.open('https://www.naver.com');
  };

  return (
    <div className="home">
      <div className="top">
        <Welcome logoImageSrc="./assets/home/homeLogo.png" />
      </div>
      <div className="bottom">
        <Descript
          divInnerText={'무료로 친구들과 즐거운 대화를 나눠보세요.'}
          brInnerText={
            'VOICE SPACE는 피로하지 않은 원격 소통 서비스를 제공합니다.'
          }
        />
        <CreateRoom createRoomButtonClick={createRoomClick} />
        <EnterRoom
          buttonText={'참가하기'}
          inputPlaceHolder={'코드(RoomId)를 입력해주세요.'}
          enterRoomButtonClick={enterRoomClick}
        />
        <MoreInfo
          aOnClick={aOnClick}
          brInnerText={'VOICE SPACE에 대해'}
          aInnerText={' 자세히 알아보세요'}
        />
      </div>
    </div>
  );
}

export default Home;
