import React, { useState } from "react";
import { RouteComponentProps, StaticRouterProps, withRouter } from "react-router-dom";
import 'antd/dist/antd.css';
import './spaceMain.css'
import { Menu, Dropdown, message, Button } from 'antd';
import { AudioOutlined, AudioMutedOutlined, EllipsisOutlined, UpOutlined, DesktopOutlined, LogoutOutlined, LeftCircleFilled, RightCircleFilled } from '@ant-design/icons';

// const Panel = () => {
//   // const [ onMessage, setOnMessage] = useState(false)
//   const onClickLink = () => {
//     // 복사 시켜줘야한다. 성공했는지 못했는지는 분기해주자.
//     message.success('복사 성공!')
//   }
//   const onClickUsers = () => {
//     // setUsers(true)
//     console.log('user!!')
//   }
//   const onClickMessage = () => {
//     console.log('message!!!')
//   }
//   return (
//     <Menu>
//     <Menu.Item key="0">
//       <button onClick={onClickLink}>참여 링크 복사</button>
//     </Menu.Item>
//     <Menu.Item key="1">
//       <button onClick={onClickUsers}>사용자</button>
//       {/* { onUsers ? console.log('버튼 클릭 됨') : console.log('ㄴㄴ') } */}
//     </Menu.Item> 
//     <Menu.Item key="3">
//     <button onClick={onClickMessage}>메시지</button>
//     </Menu.Item>
//   </Menu>
//   )
// }

const Navigation = (props: RouteComponentProps) => {
  const [ onUsers, setOnUsers ] = useState(true);
  const [ onMessage, setOnMessage] = useState(false)

  const profile = () => {
    // const [ profile, setProfile ] = useState(false);
  
    // const onClick = () => {
    //   setProfile(true);
    // }
    const changeImage = () => {
      return (
        './assets/spaceMain/animal/brownHorseFaceMute.png'
      );
    }
  
    const changeProfile = () => {
      console.log('프로필이 변경되었습니다.');
    }
    return (
      <Menu className='profile'>
        <span style={{fontSize: '20px', fontWeight: 'bold'}}>프로필 설정</span>
        <div style={{fontSize: '15px', fontWeight: 'bold'}}>
          이름
          <div><input style={{width: '100%'}}/></div>
        </div>
        <div className='avatar'>
          <div style={{fontSize: '15px', fontWeight: 'bold'}}>아바타</div>
          <button><LeftCircleFilled /></button>
          <img
            src='./assets/spaceMain/animal/brownHorseFaceMute.png'
            style={{borderRadius: '70%', width:'70%', height:'70%'}}></img>
          <button><RightCircleFilled /></button>
        </div>
        <Button type="primary" shape="round" style={{width: '100%'}} onClick={changeProfile}>
            변경
          </Button>
      </Menu>
    )
  }

  const MicOnOff = () => {
    const [ mic, setMic ] = useState(true);
  
    const onClick = () => {
        setMic(!mic);
    }
    return (
      mic ?
      <AudioOutlined className="navigationObject" onClick={onClick}/> :
      <AudioMutedOutlined className="navigationObject" onClick={onClick}/> 
    );
  }

  const panel = () => {
    const onClickLink = () => {
      // 복사 시켜줘야한다. 성공했는지 못했는지는 분기해주자.
      message.success('복사 성공!')
    }
    const onClickUsers = () => {
      console.log('user!!')
    }
    const onClickMessage = () => {
      console.log('message!!!')
    }
    return (
      <Menu>
        <Menu.Item key="0">
          <button onClick={onClickLink}>참여 링크 복사</button>
        </Menu.Item>
        <Menu.Item key="1">
          <button onClick={onClickUsers}>사용자</button>
        </Menu.Item>
        <Menu.Item key="3">
        <button onClick={onClickMessage}>메시지</button>
        </Menu.Item>
      </Menu>
    )
  }

  const screenshare = (
    <Menu>
      <Menu.Item key="0">
        <a href="https://www.antgroup.com"> 전체 화면</a>
      </Menu.Item>
      <Menu.Item key="1">
        <a href="https://www.aliyun.com"> 창</a>
      </Menu.Item>
    </Menu>
  );

  const exit = () => {
    props.history.push(
      "/"
    );
  };

  const options = (
    <Menu>
      <Menu.Item key="0">
        <a href="https://www.antgroup.com">설정</a>
      </Menu.Item>
      <Menu.Item key="1">
        <a href="https://www.aliyun.com"> 문제 해결 및 도움말</a>
      </Menu.Item>
    </Menu>
  );

  return (
    <div id='footer'>
      <Dropdown overlay={profile} trigger={['click']}>
        <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
          <span className="navigationObject">Kilee</span>
        </a>
      </Dropdown>
      <span className='footerCenter'>
        <div style={{display: 'inline'}}></div>
        <MicOnOff />
        <Dropdown overlay={screenshare} trigger={['click']}>
          <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
            <DesktopOutlined className="navigationObject"/>
          </a>
        </Dropdown>
        <Dropdown overlay={options} trigger={['click']}>
          <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
            <EllipsisOutlined className="navigationObject" style = {{transform: 'rotate(90deg)'}}/>
          </a>
        </Dropdown>
        <LogoutOutlined className="navigationObject" onClick={exit}/>
      </span>
      <Dropdown overlay={panel} trigger={['click']}>
        <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
          <UpOutlined className="navigationObject"/>
        </a>
      </Dropdown>
    </div>
  )
}

export default Navigation;