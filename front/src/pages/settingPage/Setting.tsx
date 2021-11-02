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
  audioStreamHelper: AudioStreamHelper;
  isLoading: boolean;
}

interface SoundControllProps {
  audioStreamHelper: AudioStreamHelper;
  isLoading: boolean;
}

function SoundControll(props: SoundControllProps): JSX.Element {
  const [micInfos, setMicInfos] = useState<MediaDeviceInfo[]>([]);
  const [speakerInfos, setSpeakerInfos] = useState<MediaDeviceInfo[]>([]);

  const getInfos = useCallback(async () => {
    setMicInfos(await props.audioStreamHelper.getMicDevices());
    setSpeakerInfos(await props.audioStreamHelper.getSpeakerDevices());
  }, []);

  const onSpeakerChange = (speakerId: string) => {
    props.audioStreamHelper.setSpeakerDeviceId(speakerId);
  };

  const onMicChange = (micId: string) => {
    props.audioStreamHelper.setMicDeviceId(micId);
  };

  useEffect(() => {
    getInfos();
  }, [props.isLoading]);

  return (
    <div className="soundControllMainDiv">
      <div className="soundControllSelectDiv">
        <img
          style={{width: '20%', height: 32}}
          src="./assets/navigation/speaker.png"
        ></img>
        <Select
          loading={props.isLoading}
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
          loading={props.isLoading}
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
  const byteFrequencyDataArray = useMemo(() => {
    return new Uint8Array(16);
  }, []);

  let aniNumber = 0;

  const micChangeCallback = useCallback(async newStream => {
    const avHelper = new AudioVisualizerHelper(newStream);
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
    }
  }, []);

  useEffect(() => {
    props.audioStreamHelper.addOnMicChange(micChangeCallback);
    return () => {
      props.audioStreamHelper.removeOnMicChange(micChangeCallback);
      cancelAnimationFrame(aniNumber);
    };
  }, []);

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
  const [isLoading, setIsLoading] = useState(true);
  const [isListenMyMic, setIsListenMyMic] = useState(false);
  const [nickname, setNickname] = useState(nicknameDefaultValue);
  const [avatarIdx, setAvatarIdx] = useState<AvatarImageEnum>(
    AvatarImageEnum.BUNNY,
  );

  //ref
  const testAudioRef = useRef<HTMLAudioElement>(null);
  const avatarImgRef = useRef<HTMLImageElement>(null);

  // memo
  const audioStreamHelper = useMemo(() => {
    return new AudioStreamHelper(setIsLoading);
  }, []);

  // functions
  const reloadDeviceInfoClick = () => {
    audioStreamHelper.loadInitDeviceSetting();
  };

  const enterClick = () => {
    props.history.push(
      `/space?roomId=${query.roomId}&avatarIdx=${avatarIdx}&nickname=${nickname}`,
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

  const changeTestAudioStream = useCallback((newStream: MediaStream) => {
    console.log('changeTestAudioStream', newStream);
    if (testAudioRef.current) {
      const oldStream = testAudioRef.current.srcObject;
      if (oldStream) {
        (oldStream as MediaStream).getTracks().forEach(track => track.stop());
      }
      testAudioRef.current.srcObject = newStream;
    }
  }, []);
  const changeTestAudioSinkId = useCallback((newSpeakerId: string) => {
    if (testAudioRef.current && audioStreamHelper.isSpeakerChangeable) {
      (testAudioRef.current as any).setSinkId(newSpeakerId);
    }
  }, []);
  useEffect(() => {
    audioStreamHelper.addOnMicChange(changeTestAudioStream);
    audioStreamHelper.addOnSpeakerChange(changeTestAudioSinkId);
    return () => {
      audioStreamHelper.removeOnMicChange(changeTestAudioStream);
      audioStreamHelper.removeOnSpeakerChange(changeTestAudioSinkId);
    };
  }, []);

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
              <SoundControll
                audioStreamHelper={audioStreamHelper}
                isLoading={isLoading}
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
              <AudioVisualizer
                audioStreamHelper={audioStreamHelper}
                isLoading={isLoading}
              ></AudioVisualizer>
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
