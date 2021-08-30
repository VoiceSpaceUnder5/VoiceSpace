import React, {useState, useContext} from 'react';
import {AudioOutlined, AudioMutedOutlined} from '@ant-design/icons';
import PeerManager from '../utils/RTCGameUtils';

interface MicOnOffProps {
  peerManager: PeerManager;
}

function MicOnOff(props: MicOnOffProps): JSX.Element {
  const [mic, setMic] = useState(true);
  const onClick = () => {
    // props.myMicToggle(!mic);
    props.peerManager.localStream.getAudioTracks()[0].enabled = !mic;
    console.log(props.peerManager.me.nickname);
    setMic(!mic);
  };
  return (
    <div>
      {mic ? (
        <AudioOutlined className="navbar_button" onClick={onClick} />
      ) : (
        <AudioMutedOutlined className="navbar_button" onClick={onClick} />
      )}
    </div>
  );
}

export default MicOnOff;
