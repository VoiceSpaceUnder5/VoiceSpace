import React, {useState, useEffect, useRef} from 'react';
// import {} from '../utils/RTCGameUtils';

// HTMLMediaElement.setSinkId(sinkId).then(function() { ... })

// 1. 원하는 디바이스로 세팅하려면 HTMLMediaElement.setSinkId(sinkId).then(function() { ... })
// 2. 다바이스 리스트를 가져오려면 navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError); 여기서 gotDevices 함수에 매개변수로 리스트가 들어간다.

// 2번에서 리스트를 받아서 -> select 컴포넌트를 렌더링 하고, 그리고 셀렉트안에있는 옵션을 선택을 하면 해당 디바이스로 setSinkId 를 호출한다.

interface SelectDeviceOptionProps {
  audio: HTMLAudioElement | null;
  deviceInfos: MediaDeviceInfo[] | null;
  ChangeEachAudio: (deviceId: string) => void;
  setSelectOutputDevice: React.Dispatch<React.SetStateAction<string>>;
  seletedOutputDevice: string;
  setSelectInputDevice: React.Dispatch<React.SetStateAction<string>>;
  seletedInputDevice: string;
}

interface SelectDeviceProps {
  ChangeEachAudio: (deviceId: string) => void;
  setSelectOutputDevice: React.Dispatch<React.SetStateAction<string>>;
  seletedOutputDevice: string;
  setSelectInputDevice: React.Dispatch<React.SetStateAction<string>>;
  seletedInputDevice: string;
}

// audioElement에 소리를
function SelectOption(props: SelectDeviceOptionProps): JSX.Element {
  const onChangeOutput: React.ReactEventHandler<HTMLSelectElement> = event => {
    const selectedOption = event.target as HTMLOptionElement;
    const deviceId = selectedOption.value;
    const audio = props.audio as any;
    props.setSelectOutputDevice(deviceId);
    if (audio) {
      audio.setSinkId(deviceId);
      props.ChangeEachAudio(deviceId);
    }
  };
  const onChangeInput: React.ReactEventHandler<HTMLSelectElement> = event => {
    const selectedOption = event.target as HTMLOptionElement;
    const deviceId = selectedOption.value;
    props.setSelectInputDevice(deviceId);
    navigator.mediaDevices
      .getUserMedia({video: false, audio: {deviceId: deviceId}})
      .then(stream => {
        if (props) {
          if (props.audio) {
            props.audio.srcObject = stream;
          }
        }
      });
  };
  if (!props.deviceInfos) {
    console.log('deviceInfos가 없다');
    return <></>;
  }
  return (
    <>
      <div>출력</div>
      <div className="speaker_select_div">
        <select className="speaker_select" onChange={onChangeOutput}>
          {props.deviceInfos.map(deviceInfo => {
            if (deviceInfo.kind === 'audiooutput') {
              // 선택한 deviceInfo이면 selected
              if (props.seletedOutputDevice === deviceInfo.deviceId) {
                console.log(`selected!! ${props.seletedOutputDevice}`);
                return (
                  <option value={deviceInfo.deviceId} selected>
                    {deviceInfo.label}
                  </option>
                );
              } else {
                console.log(`not selected!! ${props.seletedOutputDevice}`);
                return (
                  <option value={deviceInfo.deviceId}>
                    {deviceInfo.label}
                  </option>
                );
              }
            } else {
              return;
            }
          })}
        </select>
        <img
          className="speaker_select_img"
          src="./assets/navigation/speaker.png"
        ></img>
      </div>
      <div>입력</div>
      <div className="mic_select_div">
        <select className="mic_select" onChange={onChangeInput}>
          {props.deviceInfos.map(deviceInfo => {
            if (deviceInfo.kind === 'audioinput') {
              // 선택한 deviceInfo이면 selected
              if (props.seletedInputDevice === deviceInfo.deviceId) {
                return (
                  <option value={deviceInfo.deviceId} selected>
                    {deviceInfo.label}
                  </option>
                );
              } else {
                return (
                  <option value={deviceInfo.deviceId}>
                    {deviceInfo.label}
                  </option>
                );
              }
            } else {
              return;
            }
          })}
        </select>
        <img className="mic_select_img" src="./assets/navigation/mic.png"></img>
      </div>
    </>
  );
}

export default function SelectDevice(props: SelectDeviceProps): JSX.Element {
  const [deviceList, setDeviceList] = useState<MediaDeviceInfo[] | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((deviceInfos: MediaDeviceInfo[]) => {
        setDeviceList(deviceInfos);
      })
      .catch(handleError);

    navigator.mediaDevices
      .getUserMedia({video: false, audio: true})
      .then(stream => {
        if (audioRef.current) {
          audioRef.current.srcObject = stream;
        }
      });
  }, []);

  return (
    <>
      {deviceList && audioRef.current ? (
        <SelectOption
          audio={audioRef.current}
          deviceInfos={deviceList}
          ChangeEachAudio={props.ChangeEachAudio}
          setSelectOutputDevice={props.setSelectOutputDevice}
          seletedOutputDevice={props.seletedOutputDevice}
          setSelectInputDevice={props.setSelectInputDevice}
          seletedInputDevice={props.seletedInputDevice}
        ></SelectOption>
      ) : (
        <div>loading...</div>
      )}
      <audio ref={audioRef} autoPlay></audio>
    </>
  );
}

function handleError() {
  console.error('deviceInfos를 못가지고 옴.');
}
