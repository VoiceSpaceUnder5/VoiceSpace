// navigator.meidaDevices 아래에 우리가 호출하는 모든 메소드를 추상화 하고,
// device 변경에 대한 모든 것을 컨트롤하고,
// audioStream 에 대한 모든 실제 출력 엘리멘트 컨트롤을 대신한다.

import {message} from 'antd';

export default class AudioStreamHelper {
  private micChangeCallbacks: Set<(newLocalAudioStream: MediaStream) => void>;
  private speakerChangeCallbacks: Set<(newSpeakerId: string) => void>;
  private _speakerDeviceId: string;
  private _micDeivceId: string;
  private _isSpeakerChangeable: boolean;
  private setIsLoading: ((isLoading: boolean) => void) | undefined;

  constructor(setIsLoading?: (isLoading: boolean) => void) {
    this._speakerDeviceId = '';
    this._micDeivceId = '';
    this.micChangeCallbacks = new Set();
    this.speakerChangeCallbacks = new Set();
    this._isSpeakerChangeable = this.checkSpeakerChangeable();
    this.setIsLoading = setIsLoading;
    this.getAuthAndLoadInit();
    navigator.mediaDevices.ondevicechange = () => {
      message.info(
        '마이크, 스피커 하드웨어 변경이 감지되었습니다. 세팅이 디폴트 값으로 변경됩니다.',
      );
      this.loadInitDeviceSetting();
    };
  }

  private checkSpeakerChangeable(): boolean {
    const tempAudio = document.createElement('audio');
    if ((tempAudio as any).setSinkId) return true;
    return false;
  }

  private setLoading(isLoading: boolean) {
    if (this.setIsLoading) {
      this.setIsLoading(isLoading);
    }
  }

  private async getAuthAndLoadInit() {
    this.setLoading(true);
    await navigator.mediaDevices.getUserMedia({video: false, audio: true});
    await this.loadInitDeviceSetting();
    this.setLoading(false);
  }

  async loadInitDeviceSetting() {
    this.setLoading(true);
    const micDeviceList = await this.getMicDevices();
    const speakerDeivceList = await this.getSpeakerDevices();
    if (micDeviceList.length === 0) {
      throw new Error('can not find micDeivce at all!');
    } else {
      await this.setMicDeviceId(micDeviceList[0].deviceId);
    }
    if (!this._isSpeakerChangeable) {
      await this.setSpeakerDeviceId('not supported');
    } else {
      if (this._isSpeakerChangeable && speakerDeivceList.length === 0) {
        throw new Error('can not find speakerDeivce at all!');
      } else {
        await this.setSpeakerDeviceId(speakerDeivceList[0].deviceId);
      }
    }
    this.setLoading(false);
  }

  get isSpeakerChangeable() {
    return this._isSpeakerChangeable;
  }

  getSpeakerDeviceId() {
    return this._speakerDeviceId;
  }

  async setSpeakerDeviceId(speakerDeviceId: string) {
    this.setLoading(true);
    const isValid = await this.deviceIdValidCheck(
      'audiooutput',
      speakerDeviceId,
    );
    if (isValid) {
      this._speakerDeviceId = speakerDeviceId;
      this.fireSpeakerChangeCallback(speakerDeviceId);
    } else throw `${speakerDeviceId} is not connected device`;
    this.setLoading(false);
  }

  getMicDeviceId(): string {
    return this._micDeivceId;
  }

  async setMicDeviceId(micDeviceId: string) {
    this.setLoading(true);
    const isValid = await this.deviceIdValidCheck('audioinput', micDeviceId);
    if (isValid) {
      // micDeviceId 가 바뀌면, 다시 loadLocalAudioStream 을 호출해준다.
      this._micDeivceId = micDeviceId;
      this.fireMicChangeCallback();
    } else throw `${micDeviceId} is not connected device`;
    this.setLoading(false);
  }

  private async deviceIdValidCheck(kind: MediaDeviceKind, micDeviceId: string) {
    this.setLoading(true);
    const micDeviceList = await this.getDevices(kind);
    this.setLoading(false);
    if (
      micDeviceList.filter(mdi => {
        return mdi.deviceId === micDeviceId;
      })
    )
      return true;
    return false;
  }

  // 호출 시 .getUserMeida 를 호출 하여 resolve 시 this.localAudioStream 을 교체하고,
  // 해당 localAudioStream 으로 onLocalAudioStreams 에 있는 모든 콜백을 호출함.
  private async fireMicChangeCallback() {
    this.setLoading(true);
    const audioStream = await this.getLocalAudioStream();
    this.micChangeCallbacks.forEach(cb => {
      cb(audioStream);
    });
    this.setLoading(false);
  }

  private fireSpeakerChangeCallback(nextSpeakerId: string) {
    this.setLoading(true);
    this.speakerChangeCallbacks.forEach(cb => {
      cb(nextSpeakerId);
    });
    this.setLoading(false);
  }

  addOnMicChange(onMicChange: (newAudioStream: MediaStream) => void): void {
    this.micChangeCallbacks.add(onMicChange);
  }

  removeOnMicChange(onMicChange: (newAudioStream: MediaStream) => void): void {
    this.micChangeCallbacks.delete(onMicChange);
  }

  addOnSpeakerChange(onSpeakerChange: (newSpeakerId: string) => void): void {
    this.speakerChangeCallbacks.add(onSpeakerChange);
  }

  removeOnSpeakerChange(onSpeakerChange: (newSpeakerId: string) => void): void {
    this.speakerChangeCallbacks.delete(onSpeakerChange);
  }

  async getLocalAudioStream(): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({
      audio: {deviceId: this._micDeivceId},
      video: false,
    });
  }

  // 들어온 kind 값을 가진 MediaDeviceInfo 배열을 리턴
  private async getDevices(kind: MediaDeviceKind): Promise<MediaDeviceInfo[]> {
    return navigator.mediaDevices
      .enumerateDevices()
      .then(mediaDeviceInfos => {
        return mediaDeviceInfos.filter(mid => {
          return mid.kind === kind;
        });
      })
      .catch(() => {
        throw new Error('navigator.mediaDevices.enumerateDevices() Fail!');
      });
  }

  async getMicDevices(): Promise<MediaDeviceInfo[]> {
    return this.getDevices('audioinput');
  }

  async getSpeakerDevices(): Promise<MediaDeviceInfo[]> {
    return this.getDevices('audiooutput');
  }

  clear() {
    navigator.mediaDevices.ondevicechange = null;
    this.setIsLoading = undefined;
    this.micChangeCallbacks.clear();
    this.speakerChangeCallbacks.clear();
  }
}
