import React, {useEffect, useRef, useState} from 'react';
import {RouteComponentProps} from 'react-router-dom';
import {Button, Select, message} from 'antd';
import {LeftCircleFilled, RightCircleFilled} from '@ant-design/icons';
const qs = require('query-string');
const {Option} = Select;

interface SettingQuery {
  roomId: string;
  isNew: boolean;
}

interface SoundControllProps {
  deviceInfos: MediaDeviceInfo[];
  selectedMicDeviceID: string;
  selectedSpeakerDeviceID: string;
  setSelectedMicDeviceAndSetAudioStream: (deviceID: string) => void;
  setSelectedSpeakerDeviceWithTest: (deviceID: string) => void;
}

function SoundControll(props: SoundControllProps): JSX.Element {
  const onSpeakerChange = (deviceID: string) => {
    props.setSelectedSpeakerDeviceWithTest(deviceID);
  };

  const onMicChange = (deviceID: string) => {
    props.setSelectedMicDeviceAndSetAudioStream(deviceID);
  };

  return (
    <div
      style={{
        border: '3px solid #325932',
        borderRadius: '3%',
        borderColor: '#325932',
        width: '100%',
        height: '100%',
        padding: '3%',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '15%',
          margin: '1%',
        }}
      >
        <img
          src="./assets/navigation/speaker.png"
          style={{width: '20%', height: 32}}
        ></img>
        <Select
          onChange={onSpeakerChange}
          style={{width: '80%'}}
          value={props.selectedSpeakerDeviceID}
        >
          {props.deviceInfos
            .filter(deviceInfo => {
              return deviceInfo.kind === 'audiooutput';
            })
            .map(deviceInfo => {
              return (
                <Option key={deviceInfo.deviceId} value={deviceInfo.deviceId}>
                  {deviceInfo.label}
                </Option>
              );
            })}
        </Select>
      </div>
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '15%',
          margin: '1%',
        }}
      >
        <img
          src="./assets/navigation/mic.png"
          style={{width: '20%', height: 32}}
        ></img>
        <Select
          onChange={onMicChange}
          style={{width: '80%'}}
          value={props.selectedMicDeviceID}
        >
          {props.deviceInfos
            .filter(deviceInfo => {
              return deviceInfo.kind === 'audioinput';
            })
            .map(deviceInfo => {
              return (
                <Option key={deviceInfo.deviceId} value={deviceInfo.deviceId}>
                  {deviceInfo.label}
                </Option>
              );
            })}
        </Select>
      </div>
    </div>
  );
}

function Setting(props: RouteComponentProps): JSX.Element {
  // values
  const query = qs.parse(props.location.search) as SettingQuery;
  const settingWindowWidth = 400;
  const settingWindowHeight = 400;

  //states
  const [deviceInfos, setDeviceInfos] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicDeviceID, setSelectedMicDeviceID] = useState('default');
  const [selectedSpeakerDeviceID, setSelectedSpeakerDeviceID] =
    useState('default');
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  //ref
  const testAudioRef = useRef<HTMLAudioElement>(null);

  const getAudioStreamFromDeviceID = (
    deviceID: string,
  ): Promise<MediaStream> => {
    return navigator.mediaDevices.getUserMedia({audio: {deviceId: 'default'}});
  };

  const getDeviceInfos = (): Promise<MediaDeviceInfo[]> => {
    return navigator.mediaDevices.enumerateDevices();
  };

  useEffect(() => {
    getAudioStreamFromDeviceID('default')
      .then(audioStream => {
        setAudioStream(audioStream);
        return getDeviceInfos();
      })
      .then(deviceInfos => {
        setDeviceInfos(deviceInfos);
        setIsLoading(false);
      })
      .catch(error => {
        message.error(
          '음향 장치를 가져오는데 실패하였습니다. 장치 연결상태나 권한을 확인해 주세요.',
        );
      });
  }, []);

  const setSelectedMicDeviceAndSetAudioStream = (deviceID: string) => {
    setIsLoading(true);
    getAudioStreamFromDeviceID(deviceID)
      .then(audioStream => {
        setSelectedMicDeviceID(deviceID);
      })
      .catch(error => {
        message.error(
          '해당 장치 설정에 실패하였습니다. 장치 연결 상태를 확인하여 주세요.',
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const setSelectedSpeakerDeviceWithTest = (deviceID: string) => {
    setIsLoading(true);
    try {
      if (!testAudioRef.current) {
        throw 'testAudioRef is not found';
      }
      const audio = testAudioRef.current;
      (audio as any)
        .setSinkId(deviceID)
        .then(() => {
          setSelectedSpeakerDeviceID(deviceID);
        })
        .catch(() => {
          message.error(
            '해당 장치 설정에 실패하였습니다. 장치 연결 상태를 확인하여 주세요.',
          );
        });
    } catch (error) {
      console.error(error);
      message.error(
        '해당 장치 설정에 실패하였습니다. 장치 연결 상태를 확인하여 주세요.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const reloadDeviceInfoClick = () => {
    setIsLoading(true);
    getDeviceInfos()
      .then(deviceInfos => {
        setDeviceInfos(deviceInfos);
        setSelectedMicDeviceID('default');
        setSelectedSpeakerDeviceID('default');
        setSelectedMicDeviceAndSetAudioStream('default');
        setSelectedSpeakerDeviceWithTest('default');
      })
      .catch(() => {
        message.error(
          '장치를 재검색 하는데 실패하였습니다. 장치 연결 상태를 확인하여 주세요.',
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const enterClick = () => {
    console.log(selectedSpeakerDeviceID, selectedMicDeviceID);
  };

  return (
    <>
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          display: 'flex',
        }}
      >
        <div
          style={{
            borderRadius: '3%',
            position: 'absolute',
            width: settingWindowWidth,
            height: settingWindowHeight,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            backgroundColor: '#7D965E',
            margin: 'auto',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '80%',
              display: 'flex',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: '50%',
                height: '100%',
                padding: '3%',
              }}
            >
              <div
                style={{
                  border: '3px solid #325932',
                  borderRadius: '3%',
                  borderColor: '#325932',
                  width: '100%',
                  height: '100%',
                }}
              >
                <div
                  style={{
                    textAlign: 'center',
                    position: 'absolute',
                    top: '15%',
                    left: '50%',
                    transform: 'translate(-50%,-50%)',
                    fontSize: '150%',
                  }}
                >
                  익명의 곰
                </div>
                <img
                  src="./assets/spaceMain/avatar/brownBearFaceMute.png"
                  style={{
                    position: 'absolute',
                    width: '70%',
                    height: '50%',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%,-50%)',
                  }}
                ></img>
                <div
                  style={{
                    textAlign: 'center',
                    position: 'absolute',
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '80%',
                    height: '10%',
                    top: '85%',
                    left: '50%',
                    transform: 'translate(-50%,-50%)',
                  }}
                >
                  <button
                    style={{
                      borderRadius: '7px',
                      borderColor: '#325932',
                      backgroundColor: '#689F38',
                    }}
                  >
                    <LeftCircleFilled></LeftCircleFilled>
                  </button>
                  <input
                    style={{
                      width: '70%',
                      borderRadius: '7px',
                      borderColor: '#325932',
                    }}
                  ></input>
                  <button
                    style={{
                      borderRadius: '7px',
                      borderColor: '#325932',
                      backgroundColor: '#689F38',
                    }}
                  >
                    <RightCircleFilled></RightCircleFilled>
                  </button>
                </div>
              </div>
            </div>
            <div
              style={{
                position: 'absolute',
                left: '50%',
                width: '50%',
                height: '100%',
                padding: '3%',
              }}
            >
              <SoundControll
                deviceInfos={deviceInfos}
                selectedMicDeviceID={selectedMicDeviceID}
                selectedSpeakerDeviceID={selectedSpeakerDeviceID}
                setSelectedMicDeviceAndSetAudioStream={
                  setSelectedMicDeviceAndSetAudioStream
                }
                setSelectedSpeakerDeviceWithTest={
                  setSelectedSpeakerDeviceWithTest
                }
              ></SoundControll>
              <Button
                onClick={reloadDeviceInfoClick}
                shape="round"
                loading={isLoading}
                style={{
                  position: 'absolute',
                  width: '70%',
                  height: '10%',
                  top: '40%',
                  left: '50%',
                  transform: 'translate(-50%,-50%)',
                  backgroundColor: '#53150D',
                  color: 'white',
                }}
              >
                장치 재검색
              </Button>
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              top: '80%',
              width: '100%',
              height: '20%',
            }}
          >
            <Button
              onClick={enterClick}
              shape="round"
              loading={isLoading}
              style={{
                position: 'absolute',
                width: '50%',
                height: '50%',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%,-50%)',
                backgroundColor: '#53150D',
                color: 'white',
              }}
            >
              입장하기
            </Button>
          </div>
        </div>
      </div>
      <audio ref={testAudioRef} autoPlay={false} muted={true}></audio>
    </>
  );
}

export default Setting;
