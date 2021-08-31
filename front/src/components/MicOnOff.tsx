import React, {useState} from 'react';
import {AudioOutlined, AudioMutedOutlined} from '@ant-design/icons';

export interface MicOnOffProps {
  setIsMicOn: (arg0: boolean) => void;
}

function MicOnOff(props: MicOnOffProps): JSX.Element {
  const [mic, setMic] = useState(true);
  const onClick = () => {
    setMic(!mic);
    props.setIsMicOn(!mic);
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
