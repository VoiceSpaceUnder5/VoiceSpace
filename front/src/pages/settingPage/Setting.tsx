import React, {useEffect, useRef, useState} from 'react';
import {RouteComponentProps} from 'react-router-dom';
import {Button, Select, message, Switch} from 'antd';
import {LeftCircleFilled, RightCircleFilled} from '@ant-design/icons';
import './setting.css';
import {
  AvatarImageEnum,
  avatarImageMDs,
  AvatarPartImageEnum,
} from '../../utils/ImageMetaData';

const qs = require('query-string');
const {Option} = Select;

interface SettingQuery {
  roomId: string;
  isNew: boolean;
}

interface AudioVisualizerProps {
  audioStream: MediaStream;
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
    <div className="soundControllMainDiv">
      <div className="soundControllSelectDiv">
        <img
          style={{width: '20%', height: 32}}
          src="./assets/navigation/speaker.png"
        ></img>
        <Select
          className="soundControllSelect"
          onChange={onSpeakerChange}
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
      <div className="soundControllSelectDiv">
        <img
          className="soundControllSelectLogoImg"
          src="./assets/navigation/mic.png"
          style={{width: '20%', height: 32}}
        ></img>
        <Select
          className="soundControllSelect"
          onChange={onMicChange}
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

function AudioVisualizer(props: AudioVisualizerProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (!context) return;
      context.fillStyle = '#325932';
      // make analyser with stream
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(props.audioStream);
      const analyser = audioContext.createAnalyser();
      analyser.smoothingTimeConstant = 0.85;
      analyser.fftSize = 32;
      source.connect(analyser);
      // for audio Analysis
      const byteFrequencyDataArray = new Uint8Array(analyser.frequencyBinCount);

      const canvas = canvasRef.current;
      const widthStep = canvasRef.current.width / analyser.frequencyBinCount;
      const animationLoop = () => {
        analyser.getByteFrequencyData(byteFrequencyDataArray);
        context.clearRect(0, 0, canvas.width, canvas.height);
        byteFrequencyDataArray.forEach((value, idx) => {
          context.fillRect(
            widthStep * idx,
            canvas.height,
            widthStep,
            -value / 2,
          );
        });
        requestAnimationFrame(animationLoop);
      };
      requestAnimationFrame(animationLoop);
    }
  }, [props.audioStream]);

  return <canvas className="settingAudioVisualizer" ref={canvasRef}></canvas>;
}

function Setting(props: RouteComponentProps): JSX.Element {
  // values
  const query = qs.parse(props.location.search) as SettingQuery;
  const settingWindowWidth = 400;
  const settingWindowHeight = 400;
  const avatarIdxMax = AvatarImageEnum.WHITE_RABBIT;
  const avatarIdxMin = AvatarImageEnum.WHITE_RABBIT;

  //states
  const [deviceInfos, setDeviceInfos] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicDeviceID, setSelectedMicDeviceID] = useState('default');
  const [selectedSpeakerDeviceID, setSelectedSpeakerDeviceID] =
    useState('default');
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isListenMyMic, setIsListenMyMic] = useState(false);
  const [nickname, setNickname] = useState('익명의 토끼');
  const [avatarIdx, setAvatarIdx] = useState<AvatarImageEnum>(
    AvatarImageEnum.WHITE_RABBIT,
  );

  //ref
  const testAudioRef = useRef<HTMLAudioElement>(null);
  const avatarImgRef = useRef<HTMLImageElement>(null);

  // functions
  const getAudioStreamFromDeviceID = (
    deviceID: string,
  ): Promise<MediaStream> => {
    return navigator.mediaDevices.getUserMedia({audio: {deviceId: deviceID}});
  };

  const getDeviceInfos = (): Promise<MediaDeviceInfo[]> => {
    return navigator.mediaDevices.enumerateDevices();
  };

  const setSelectedMicDeviceAndSetAudioStream = (deviceID: string) => {
    setIsLoading(true);
    getAudioStreamFromDeviceID(deviceID)
      .then(audioStream => {
        setSelectedMicDeviceID(deviceID);
        setAudioStream(audioStream);
      })
      .catch(() => {
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
      // eslint-disable-next-line
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
    props.history.push(
      `/space?roomId=${query.roomId}&avatarIdx=${avatarIdx}&nickname=${nickname}&speakerDeviceID=${selectedSpeakerDeviceID}&micDeviceID=${selectedMicDeviceID}`,
    );
  };

  const nickNameOnInput: React.ChangeEventHandler<HTMLInputElement> = e => {
    setNickname(e.target.value);
  };

  const changeAvatarImgWithIdx = (avatarIdx: AvatarImageEnum) => {
    const src =
      avatarImageMDs[avatarIdx].avatarMDInfos[AvatarPartImageEnum.FACE_MUTE]
        .src;
    if (avatarImgRef.current) {
      avatarImgRef.current.src = src;
    }
  };

  const avatarImgLeftOnClick = () => {
    let nextAvatarIdx = avatarIdx - 1;
    if (nextAvatarIdx < avatarIdxMin) nextAvatarIdx = avatarIdxMax;
    changeAvatarImgWithIdx(nextAvatarIdx);
    setAvatarIdx(nextAvatarIdx);
  };

  const avatarImgRightOnClick = () => {
    let nextAvatarIdx = avatarIdx + 1;
    if (nextAvatarIdx > avatarIdxMax) nextAvatarIdx = avatarIdxMin;
    changeAvatarImgWithIdx(nextAvatarIdx);
    setAvatarIdx(nextAvatarIdx);
  };

  // useEffects
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
      .catch(() => {
        message.error(
          '음향 장치를 가져오는데 실패하였습니다. 장치 연결상태나 권한을 확인해 주세요.',
        );
      });
  }, []);

  useEffect(() => {
    if (testAudioRef.current) {
      testAudioRef.current.srcObject = audioStream;
    }
  }, [audioStream]);

  useEffect(() => {
    if (testAudioRef.current) {
      const audio = testAudioRef.current;
      // eslint-disable-next-line
      (audio as any).setSinkId(selectedSpeakerDeviceID);
    }
  }, [selectedSpeakerDeviceID]);

  return (
    <>
      <div className="settingMainDiv">
        <div
          className="settingAvatarAndSoundOuterDiv"
          style={{
            width: settingWindowWidth,
            height: settingWindowHeight,
          }}
        >
          <div className="settingAvatarAndSoundinnerDiv">
            <div className="settingAvatarMainDiv">
              <div className="settingAvatarinnerDiv">
                <input
                  value={nickname}
                  onChange={nickNameOnInput}
                  className="settingAvatarNameInput"
                ></input>
                <img
                  ref={avatarImgRef}
                  className="settingAvatarImg"
                  src={
                    avatarImageMDs[AvatarImageEnum.WHITE_RABBIT].avatarMDInfos[
                      AvatarPartImageEnum.FACE_MUTE
                    ].src
                  }
                ></img>
                <div className="settingAvatarButtonContainerDiv">
                  <button
                    className="settingAvatarButton"
                    onClick={avatarImgLeftOnClick}
                  >
                    <LeftCircleFilled></LeftCircleFilled>
                  </button>
                  <button
                    className="settingAvatarButton"
                    onClick={avatarImgRightOnClick}
                  >
                    <RightCircleFilled></RightCircleFilled>
                  </button>
                </div>
              </div>
            </div>
            <div className="soundControllContainerDiv">
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
                className="soundControllReloadButton"
                onClick={reloadDeviceInfoClick}
                shape="round"
                loading={isLoading}
              >
                장치 재검색
              </Button>
              <Switch
                className="soundControllMuteSwitch"
                checkedChildren="내 소리 듣는 중"
                unCheckedChildren="내 소리 안 듣는 중"
                defaultChecked={false}
                onChange={setIsListenMyMic}
              ></Switch>
              {audioStream ? (
                <AudioVisualizer audioStream={audioStream}></AudioVisualizer>
              ) : null}
            </div>
          </div>
          <div className="enterButtonContainerDiv">
            <Button
              className="enterButton"
              onClick={enterClick}
              shape="round"
              loading={isLoading}
            >
              입장하기
            </Button>
          </div>
        </div>
      </div>
      <audio ref={testAudioRef} autoPlay={true} muted={!isListenMyMic}></audio>
    </>
  );
}

export default Setting;
