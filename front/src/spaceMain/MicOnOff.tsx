import React, {useState, useContext} from 'react';
import {AudioOutlined, AudioMutedOutlined} from '@ant-design/icons';
import GlobalContext from './GlobalContext';

function MicOnOff(): JSX.Element {
  const globalContext = useContext(GlobalContext);
  const [mic, setMic] = useState(true);
  const onClick = () => {
    // props.myMicToggle(!mic);
    if (globalContext.peerManager !== undefined) {
      globalContext.peerManager.localStream.getAudioTracks()[0].enabled = !mic;
      console.log(globalContext.peerManager.me.nickname);
    }
    setMic(!mic);
  };
  return mic ? (
    <AudioOutlined className="navbar_button" onClick={onClick} />
  ) : (
    <AudioMutedOutlined className="navbar_button" onClick={onClick} />
  );
}

export default MicOnOff;
