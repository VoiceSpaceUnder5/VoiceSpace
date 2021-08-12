import { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { message, Button } from "antd";
import './home.css';

const Logo = () => {
  return <img id="logoImage" src="./assets/home/homeLogo.png" />;
};

const Hello = () => {
  return (
    <p id="hello">
      WELCOME
      <br />
      VOICE SPACE
    </p>
  );
};

const Descript = () => {
  return (
    <>
      무료로 친구들과 즐거운 대화를 나눠보세요.
      <br />
      VOICE SPACE는 피로하지 않은 원격 소통 서비스를 제공합니다.
      <br />
    </>
  );
};

const CreateRoom = () => {
  const onClick = () => {
    console.log("craete Room button clicked!");
  };
  return (
    <>
      <br />
      <Button id="button" shape="round" type="primary" onClick={onClick}>
        새로운 보이스 채팅
      </Button>
    </>
  );
};

interface EnterRoomProps {
  enterRoomButtonClick: () => void;
}

const EnterRoom = (props: EnterRoomProps) => {
  const info = () => {
    message.info("유효하지 않은 코드입니다");
  };
  const element = (
    <>
      <br />
      <Button id="button" onClick={props.enterRoomButtonClick}>
        참가하기
      </Button>
    </>
  );

  const [focus, setFocus] = useState(0);

  const onFocus = (e: any) => {
    setFocus(1);
  };

  const onBlur = (e: any) => {
    if (e.target.value === "") setFocus(0);
  };

  return (
    <div>
      <input
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder="코드 또는 링크 입력"
      />
      {focus ? element : null}
    </div>
  );
};

const MoreInfo = () => {
  return (
    <>
      <br />
      VOICE SPACE에 대해
      <a href="www.naver.com">자세히 알아보세요</a>
    </>
  );
};

const Home = (props: RouteComponentProps) => {
  const enterRoomClick = () => {
    props.history.push(
      "/space?roomId=honleeExample&nickname=honlee&avatarIdx=0"
    );
  };
  return (
    <div id="home">
      <Logo />
      <Hello />
      <Descript />
      <CreateRoom />
      <EnterRoom enterRoomButtonClick={enterRoomClick} />
      <MoreInfo />
    </div>
  );
};

export default Home;
