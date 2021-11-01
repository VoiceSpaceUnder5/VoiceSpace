// navigator.meidaDevices 아래에 우리가 호출하는 모든 메소드를 추상화 하고,
// device 변경에 대한 모든 것을 컨트롤하고,
// audioStream 에 대한 모든 실제 출력 엘리멘트 컨트롤을 대신한다.

export default class AudioStreamHelper {
  private onLocalAudioStreams: Set<(newLocalAudioStream: MediaStream) => void>;
  private _speakerDeviceId: string;
  private _micDeivceId: string;
  private _isSpeakerChangeable: boolean;

  constructor() {
    this._speakerDeviceId = 'default';
    this._micDeivceId = 'undefined';
    this.onLocalAudioStreams = new Set();
    this._isSpeakerChangeable = false;
    navigator.mediaDevices.ondevicechange = async () => {
      await this.getDefaultDevice();
      await this.loadLocalAudioStream();
    };
  }

  onDeviceChange(cb: (() => void) | null) {
    navigator.mediaDevices.ondevicechange = async () => {
      await this.getDefaultDevice();
      await this.loadLocalAudioStream();
      if (cb) cb();
    };
  }

  async getDefaultDevice() {
    this._isSpeakerChangeable = false;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true,
    });
    this._micDeivceId = stream.getAudioTracks()[0].getSettings().deviceId!;
    const testAudio = document.createElement('audio');
    testAudio.muted = true;
    testAudio.srcObject = stream;
    if ((testAudio as any).setSinkId) {
      this._isSpeakerChangeable = true;
    }
    if ((testAudio as any).sinkId) {
      if ((testAudio as any).sinkId === '') this._speakerDeviceId = 'default';
      else this._speakerDeviceId = (testAudio as any).sinkId;
    }
  }

  get isSpeakerChangeable() {
    return this._isSpeakerChangeable;
  }

  getSpeakerDeviceId() {
    return this._speakerDeviceId;
  }

  async setSpeakerDeviceId(speakerDeviceId: string) {
    const isValid = await this.deviceIdValidCheck(
      'audiooutput',
      speakerDeviceId,
    );
    if (isValid) this._speakerDeviceId = speakerDeviceId;
    else throw `${speakerDeviceId} is not connected device`;
  }

  getMicDeviceId(): string {
    return this._micDeivceId;
  }

  async setMicDeviceId(micDeviceId: string) {
    const isValid = await this.deviceIdValidCheck('audioinput', micDeviceId);
    if (isValid) {
      // micDeviceId 가 바뀌면, 다시 loadLocalAudioStream 을 호출해준다.
      this._micDeivceId = micDeviceId;
      this.loadLocalAudioStream();
    } else throw `${micDeviceId} is not connected device`;
  }

  private async deviceIdValidCheck(kind: MediaDeviceKind, micDeviceId: string) {
    const micDeviceList = await this.getDevices(kind);
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
  private async loadLocalAudioStream() {
    const audioStream = await this.getLocalAudioStream();
    this.onLocalAudioStreams.forEach(cb => {
      cb(audioStream);
    });
  }

  addOnLocalAudioStream(
    onLocalAudioStream: (newLocalAudioStream: MediaStream) => void,
  ): void {
    this.onLocalAudioStreams.add(onLocalAudioStream);
  }

  removeOnLocalAudioStream(
    onLocalAudioStream: (newLocalAudioStream: MediaStream) => void,
  ): void {
    this.onLocalAudioStreams.delete(onLocalAudioStream);
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
    this.onLocalAudioStreams = new Set();
    this._speakerDeviceId = 'undefined';
    this._micDeivceId = 'undefined';
    this._isSpeakerChangeable = false;
  }
}
