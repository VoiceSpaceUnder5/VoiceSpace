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

interface SoundControllProps {
  micDeviceInfos: MediaDeviceInfo[];
  speakerDeviceInfos: MediaDeviceInfo[];
  audioRef: React.RefObject<HTMLAudioElement>;
}

function SoundControll(props: SoundControllProps): JSX.Element {
  const setForceRerender = useState(0)[1];

  const forUpdate = () => {
    setForceRerender(before => {
      return before + 1;
    });
  };

  const speakerDeviceIdChange = (speakerId: string) => {
    AudioStreamHelper.speakerDeviceId = speakerId;
    if (AudioStreamHelper.isSpeakerChangeable() && props.audioRef.current) {
      (props.audioRef.current as any).setSinkId(speakerId);
    }
    forUpdate();
  };
  const micDeivceIdChagne = (micId: string) => {
    AudioStreamHelper.micDeviceId = micId;
    forUpdate();
  };

  return (
    <div className="soundControllMainDiv">
      <div className="soundControllSelectDiv">
        <img
          style={{width: '20%', height: 32}}
          src="./assets/navigation/speaker.png"
        ></img>
        <Select
          disabled={!AudioStreamHelper.isSpeakerChangeable()}
          className="soundControllSelect"
          onChange={speakerDeviceIdChange}
          value={AudioStreamHelper.speakerDeviceId}
        >
          {props.speakerDeviceInfos.map(device => {
            return (
              <Option key={device.deviceId} value={device.deviceId}>
                {device.label}
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
          onChange={micDeivceIdChagne}
          value={AudioStreamHelper.micDeviceId}
        >
          {props.micDeviceInfos.map(device => {
            return (
              <Option key={device.deviceId} value={device.deviceId}>
                {device.label}
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

function AudioVisualizer(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const byteFrequencyDataArray = useMemo(() => {
    return new Uint8Array(16);
  }, []);
  let aniNumber = 0;

  const callback = useCallback((localAudioStream: MediaStream): void => {
    const avHelper = new AudioVisualizerHelper(localAudioStream);
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
    AudioStreamHelper.getLocalAudioStreamAndAddCB(callback);
    return () => {
      cancelAnimationFrame(aniNumber);
      AudioStreamHelper.removeOnLocalAudioStream(callback);
    };
  });

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
  const [micDeviceInfos, setMicDeviceInfos] = useState<MediaDeviceInfo[]>([]);
  const [speakerDeviceInfos, setSpeakerDeviceInfos] = useState<
    MediaDeviceInfo[]
  >([]);

  //ref
  const avatarImgRef = useRef<HTMLImageElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const reloadDeviceInfoClick = () => {
    setIsLoading(true);
    reloadDeviceInfos();
  };

  const reloadDeviceInfos = async () => {
    const isAuth = await AudioStreamHelper.tryAuth();
    if (isAuth) {
      setIsLoading(false);
      AudioStreamHelper.speakerDeviceId = 'default';
      AudioStreamHelper.micDeviceId = 'default';
      const getAudioStreamCallBack = async () => {
        const micInfos = await AudioStreamHelper.getMicDevices();
        const speakerInfos = await AudioStreamHelper.getSpeakerDevices();
        setMicDeviceInfos(micInfos);
        setSpeakerDeviceInfos(speakerInfos);
        if (AudioStreamHelper.isSpeakerChangeable() && audioRef.current) {
          (audioRef.current as any).setSinkId('default');
        }
      };
      AudioStreamHelper.getLocalAudioStream(getAudioStreamCallBack);
    }
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

  const callback = useCallback((localAudioStream: MediaStream) => {
    if (!audioRef.current) return;
    audioRef.current.srcObject = localAudioStream;
  }, []);

  useEffect(() => {
    reloadDeviceInfos();
    AudioStreamHelper.addOnLocalAudioStream(callback);
    return () => {
      AudioStreamHelper.removeOnLocalAudioStream(callback);
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isListenMyMic;
  }, [isListenMyMic]);

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
                micDeviceInfos={micDeviceInfos}
                speakerDeviceInfos={speakerDeviceInfos}
                audioRef={audioRef}
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
              <AudioVisualizer></AudioVisualizer>
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
      <audio ref={audioRef} muted={true} autoPlay={true}></audio>
    </>
  );
}

export default Setting;
