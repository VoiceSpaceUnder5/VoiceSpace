import React, {useState, useEffect} from 'react';
// import {} from '../utils/RTCGameUtils';

// HTMLMediaElement.setSinkId(sinkId).then(function() { ... })

// 1. 원하는 디바이스로 세팅하려면 HTMLMediaElement.setSinkId(sinkId).then(function() { ... })
// 2. 다바이스 리스트를 가져오려면 navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError); 여기서 gotDevices 함수에 매개변수로 리스트가 들어간다.

// 2번에서 리스트를 받아서 -> select 컴포넌트를 렌더링 하고, 그리고 셀렉트안에있는 옵션을 선택을 하면 해당 디바이스로 setSinkId 를 호출한다.

interface SelectDeviceOptionProps {
  deviceInfos: MediaDeviceInfo[] | null;
  changeEachAudio: (deviceId: string) => void;
  changeInputStream: (stream: MediaStream) => void;
  setSelectOutputDevice: React.Dispatch<React.SetStateAction<string>>;
  seletedOutputDevice: string;
  setSelectInputDevice: React.Dispatch<React.SetStateAction<string>>;
  seletedInputDevice: string;
}

interface SelectDeviceProps {
  changeEachAudio: (deviceId: string) => void;
  changeInputStream: (stream: MediaStream) => void;
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
    // eslint-disable-next-line
    props.setSelectOutputDevice(deviceId);
    props.changeEachAudio(deviceId);
  };
  const onChangeInput: React.ReactEventHandler<HTMLSelectElement> = event => {
    const selectedOption = event.target as HTMLOptionElement;
    const deviceId = selectedOption.value;
    props.setSelectInputDevice(deviceId);
    navigator.mediaDevices
      .getUserMedia({video: false, audio: {deviceId: deviceId}})
      .then(stream => {
        console.log(`onChangeInput 안에 input 스트림`);
        props.changeInputStream(stream);
      });
  };
  if (!props.deviceInfos) {
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
                return (
                  <option
                    key={deviceInfo.deviceId}
                    value={deviceInfo.deviceId}
                    selected
                  >
                    {deviceInfo.label}
                  </option>
                );
              } else {
                return (
                  <option key={deviceInfo.deviceId} value={deviceInfo.deviceId}>
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
                  <option
                    key={deviceInfo.deviceId}
                    value={deviceInfo.deviceId}
                    selected
                  >
                    {deviceInfo.label}
                  </option>
                );
              } else {
                return (
                  <option key={deviceInfo.deviceId} value={deviceInfo.deviceId}>
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
  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((deviceInfos: MediaDeviceInfo[]) => {
        setDeviceList(deviceInfos);
      })
      .catch(handleError);
  }, []);

  return (
    <>
      {deviceList ? (
        <SelectOption
          deviceInfos={deviceList}
          changeEachAudio={props.changeEachAudio}
          changeInputStream={props.changeInputStream}
          setSelectOutputDevice={props.setSelectOutputDevice}
          seletedOutputDevice={props.seletedOutputDevice}
          setSelectInputDevice={props.setSelectInputDevice}
          seletedInputDevice={props.seletedInputDevice}
        ></SelectOption>
      ) : (
        <div>loading...</div>
      )}
    </>
  );
}

function handleError() {
  console.error('deviceInfos를 못가지고 옴.');
}
