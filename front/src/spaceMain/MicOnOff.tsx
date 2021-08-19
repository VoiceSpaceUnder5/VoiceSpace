import React, {useState, useContext} from 'react';
import {AudioOutlined, AudioMutedOutlined} from '@ant-design/icons';
import GlobalContext from './GlobalContext';

const MicOnOff = () => {
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
    <AudioOutlined className="navigationObject" onClick={onClick} />
  ) : (
    <AudioMutedOutlined className="navigationObject" onClick={onClick} />
  );
};

export default MicOnOff;
