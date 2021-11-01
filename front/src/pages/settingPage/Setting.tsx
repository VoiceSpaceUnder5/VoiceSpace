import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {RouteComponentProps} from 'react-router-dom';
import {Button, Select, message, Switch} from 'antd';
import {LeftCircleFilled, RightCircleFilled} from '@ant-design/icons';
import './setting.css';
import {
  AvatarImageEnum,
  AvatarImageEnumMax,
  AvatarImageEnumMin,
  avatarImageMDs,
} from '../../utils/pixiUtils/metaData/ImageMetaData';
import AudioStreamHelper from '../../utils/AudioStreamHelper';

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
  audioStreamHelper: AudioStreamHelper;
}

function SoundControll(props: SoundControllProps): JSX.Element {
  const [micInfos, setMicInfos] = useState<MediaDeviceInfo[]>([]);
  const [speakerInfos, setSpeakerInfos] = useState<MediaDeviceInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getInfos = useCallback(async () => {
    setIsLoading(true);
    setMicInfos(await props.audioStreamHelper.getMicDevices());
    setSpeakerInfos(await props.audioStreamHelper.getSpeakerDevices());
    setIsLoading(false);
  }, []);

  const onSpeakerChange = async (speakerId: string) => {
    setIsLoading(true);
    await props.audioStreamHelper.setSpeakerDeviceId(speakerId);
    setIsLoading(false);
  };

  const onMicChange = async (micId: string) => {
    setIsLoading(true);
    await props.audioStreamHelper.setMicDeviceId(micId);
    setIsLoading(false);
  };

  useEffect(() => {
    getInfos();
    props.audioStreamHelper.onDeviceChange = getInfos;
  }, []);

  return (
    <div className="soundControllMainDiv">
      <div className="soundControllSelectDiv">
        <img
          style={{width: '20%', height: 32}}
          src="./assets/navigation/speaker.png"
        ></img>
        <Select
          loading={isLoading}
          disabled={!props.audioStreamHelper.isSpeakerChangeable}
          className="soundControllSelect"
          onChange={onSpeakerChange}
          value={props.audioStreamHelper.getSpeakerDeviceId()}
        >
          {speakerInfos.map(deviceInfo => {
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
          loading={isLoading}
          className="soundControllSelect"
          onChange={onMicChange}
          value={props.audioStreamHelper.getMicDeviceId()}
        >
          {micInfos.map(deviceInfo => {
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

class AudioVisualizerHelper {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private source: MediaStreamAudioSourceNode;
  constructor(audioStream: MediaStream) {
    this.audioContext = new AudioContext();
    this.analyser = this.createAnalserAndSetting();

    this.source = this.audioContext.createMediaStreamSource(audioStream);
    this.source.connect(this.analyser);
  }
  private createAnalserAndSetting() {
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.smoothingTimeConstant = 0.85;
    this.analyser.fftSize = 32;
    return this.analyser;
  }
  setStream(audioStream: MediaStream): void {
    this.source.disconnect();
    this.createAnalserAndSetting();
    this.source = this.audioContext.createMediaStreamSource(audioStream);
    this.source.connect(this.analyser);
  }
  getByteFreqData(byteArray: Uint8Array): void {
    this.analyser.getByteFrequencyData(byteArray);
  }
}

function AudioVisualizer(props: AudioVisualizerProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const avHelper = useMemo(() => {
    return new AudioVisualizerHelper(props.audioStream);
  }, []);
  const byteFrequencyDataArray = useMemo(() => {
    return new Uint8Array(16);
  }, []);

  let aniNumber = 0;
  useEffect(() => {
    avHelper.setStream(props.audioStream);
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (!context) {
        message.error('can not create 2d canvas context');
        return;
      }
      context.fillStyle = '#325932';
      // make analyser with stream
      const canvas = canvasRef.current;
      const widthStep = canvasRef.current.width / 16;
      const animationLoop = () => {
        avHelper.getByteFreqData(byteFrequencyDataArray);
        context.clearRect(0, 0, canvas.width, canvas.height);
        byteFrequencyDataArray.forEach((value, idx) => {
          context.fillRect(
            widthStep * idx,
            canvas.height,
            widthStep,
            -value / 2,
          );
        });
        aniNumber = requestAnimationFrame(animationLoop);
      };
      aniNumber = requestAnimationFrame(animationLoop);
      return () => {
        cancelAnimationFrame(aniNumber);
      };
    }
  }, [props.audioStream]);

  return <canvas className="settingAudioVisualizer" ref={canvasRef}></canvas>;
}

export const nicknameDefaultValue = '익명의 토끼';

function Setting(props: RouteComponentProps): JSX.Element {
  // values
  const query = qs.parse(props.location.search) as SettingQuery;
  const settingWindowWidth = 400;
  const settingWindowHeight = 400;
  const avatarIdxMax = AvatarImageEnumMax;
  const avatarIdxMin = AvatarImageEnumMin;

  //states
  const [deviceInfos, setDeviceInfos] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicDeviceID, setSelectedMicDeviceID] = useState('default');
  const [selectedSpeakerDeviceID, setSelectedSpeakerDeviceID] =
    useState('default');
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isListenMyMic, setIsListenMyMic] = useState(false);
  const [nickname, setNickname] = useState(nicknameDefaultValue);
  const [avatarIdx, setAvatarIdx] = useState<AvatarImageEnum>(
    AvatarImageEnum.BUNNY,
  );
  const [isSpeakerChangeable, setIsSpeakerChangeable] = useState(true);
  const [audioStreamHelper, setAudioStreamHelper] =
    useState<AudioStreamHelper | null>(null);

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
        setSelectedMicDeviceAndSetAudioStream('default');
        if (isSpeakerChangeable) {
          setSelectedSpeakerDeviceID('default');
          setSelectedSpeakerDeviceWithTest('default');
        }
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
    if (e.target.value.length <= 10) {
      setNickname(e.target.value);
    }
  };

  const changeAvatarImgWithIdx = (avatarIdx: AvatarImageEnum) => {
    const src = avatarImageMDs[avatarIdx].avatarProfileSrc;

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
    const temp = async () => {
      const ash = new AudioStreamHelper();
      await ash.getDefaultDevice();
      setAudioStreamHelper(ash);
    };
    temp();
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
    return () => {
      if (testAudioRef.current) {
        testAudioRef.current.srcObject = null;
      }
    };
  }, [audioStream]);

  useEffect(() => {
    if (testAudioRef.current) {
      // eslint-disable-next-line
      const audio = testAudioRef.current as any;
      if (audio.setSinkId) {
        audio.setSinkId(selectedSpeakerDeviceID);
      } else {
        setIsSpeakerChangeable(false);
      }
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
                  src={avatarImageMDs[AvatarImageEnum.BUNNY].avatarProfileSrc}
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
              {audioStreamHelper ? (
                <SoundControll
                  audioStreamHelper={audioStreamHelper}
                ></SoundControll>
              ) : null}

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
