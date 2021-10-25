// navigator.meidaDevices 아래에 우리가 호출하는 모든 메소드를 추상화 하고,
// device 변경에 대한 모든 것을 컨트롤하고,
// audioStream 에 대한 모든 실제 출력 엘리멘트 컨트롤을 대신한다.
interface AudioContainer {
  elementContainer: HTMLDivElement | null;
  audios: Map<string, AudioAndStream>;
}

interface AudioAndStream {
  audio: HTMLAudioElement;
  stream: MediaStream;
}

export default class AudioStreamHelper {
  private static localAudioStream: MediaStream | null = null;
  private static onLocalAudioStreams: Set<
    (newLocalAudioStream: MediaStream) => void
  > = new Set();
  private static _speakerDeviceId = 'default';
  private static _micDeivceId = 'default';
  private static audioContainer: AudioContainer = {
    elementContainer: null,
    audios: new Map(),
  };
  private static testAudio: HTMLAudioElement = document.createElement('audio');

  static get speakerDeviceId(): string {
    return this._speakerDeviceId;
  }
  static set speakerDeviceId(speakerDeviceId: string) {
    this._speakerDeviceId = speakerDeviceId;
    this.audioContainer.audios.forEach(audioAndStream => {
      const audio = audioAndStream.audio;
      this.changeSpeakerIdIfCan(audio, this._speakerDeviceId);
    });
  }

  static get micDeviceId(): string {
    return this._micDeivceId;
  }

  static set micDeviceId(micDeviceId: string) {
    // micDeviceId 가 바뀌면, 다시 loadLocalAudioStream 을 호출해준다.
    this._micDeivceId = micDeviceId;
    this.loadLocalAudioStream();
  }

  // 호출 시 .getUserMeida 를 호출 하여 resolve 시 this.localAudioStream 을 교체하고,
  // 해당 localAudioStream 으로 onLocalAudioStreams 에 있는 모든 콜백을 호출함.
  private static loadLocalAudioStream(
    onceCB: (arg0: MediaStream) => void = () => {
      return;
    },
  ): void {
    navigator.mediaDevices
      .getUserMedia({video: false, audio: {deviceId: this._micDeivceId}})
      .then((localAudioStream: MediaStream) => {
        onceCB(localAudioStream);
        this.localAudioStream = localAudioStream;
        this.onLocalAudioStreams.forEach(cb => {
          cb(localAudioStream);
        });
      })
      .catch(() => {
        throw new Error('navigator.mediaDevices.getUserMedia Fail');
      });
  }

  static addOnLocalAudioStream(
    onLocalAudioStream: (newLocalAudioStream: MediaStream) => void,
  ): void {
    this.onLocalAudioStreams.add(onLocalAudioStream);
  }

  static removeOnLocalAudioStream(
    onLocalAudioStream: (newLocalAudioStream: MediaStream) => void,
  ): void {
    this.onLocalAudioStreams.delete(onLocalAudioStream);
  }

  // 우선 onLocalAudioStreams 에 콜백을 집어 넣은 후,
  // 현재 localAudioStream 을 가지고 있는 상태라면 들어온 콜백을 그대로 호출,
  // 가지고 있지 않은 상태라면 loadLocalAudioStream 을 호출한다.
  static getLocalAudioStreamAndAddCB(
    onLocalAudioStream: (newLocalAudioStream: MediaStream) => void,
  ): void {
    this.addOnLocalAudioStream(onLocalAudioStream);
    if (this.localAudioStream) {
      onLocalAudioStream(this.localAudioStream);
    } else {
      this.loadLocalAudioStream();
    }
  }

  static getLocalAudioStream(
    onLocalAudioStream: (newLocalAudioStream: MediaStream) => void,
  ): void {
    this.loadLocalAudioStream(onLocalAudioStream);
  }

  // 들어온 kind 값을 가진 MediaDeviceInfo 중에, default 와 겹치는 것을 제외하고 리턴해줌.
  private static async getDevices(
    kind: MediaDeviceKind,
  ): Promise<MediaDeviceInfo[]> {
    return navigator.mediaDevices
      .enumerateDevices()
      .then(mediaDeviceInfos => {
        // mediaDeviceInfos 에서, default 와 라벨이 겹치는 것 하나만 제외하고 inputDevices 그대로 리턴해줌.
        const kindFiltered = mediaDeviceInfos.filter(mid => {
          return mid.kind === kind;
        });

        const defaultDevice = kindFiltered.filter(mdi => {
          return mdi.deviceId.indexOf('default');
        });
        return kindFiltered
          .filter(mdi => {
            return mdi.label.indexOf(defaultDevice[0].label);
          })
          .filter(mid => {
            return mid.kind === kind;
          });
      })
      .catch(() => {
        throw new Error('navigator.mediaDevices.enumerateDevices() Fail!');
      });
  }

  static async getMicDevices(): Promise<MediaDeviceInfo[]> {
    return this.getDevices('audioinput');
  }

  static async getSpeakerDevices(): Promise<MediaDeviceInfo[]> {
    return this.getDevices('audiooutput');
  }

  private static initAudioContainerIfNotInited(): void {
    if (!this.audioContainer.elementContainer) {
      this.audioContainer.elementContainer = document.createElement('div');
      this.audioContainer.elementContainer.className = 'css 적용할 것';
    }
  }

  private static addDefaultValueToAudiosIfNotHas(Id: string): void {
    if (!this.audioContainer.audios.has(Id)) {
      const audio = document.createElement('audio');
      audio.autoplay = true;
      audio.hidden = true;
      const stream = new MediaStream();
      audio.srcObject = stream;
      this.audioContainer.audios.set(Id, {audio: audio, stream: stream});
    }
  }

  private static changeSpeakerIdIfCan(
    audio: HTMLAudioElement,
    speakerDeviceId: string,
  ): void {
    if ((audio as any).setSinkId) {
      (audio as any).setSinkId(speakerDeviceId);
    }
  }

  static addAudioTrack(Id: string, track: MediaStreamTrack): void {
    this.initAudioContainerIfNotInited();
    this.addDefaultValueToAudiosIfNotHas(Id);
    // eslint-disable-next-line
    const audio = this.audioContainer.audios.get(Id)!.audio;
    // eslint-disable-next-line
    const stream = this.audioContainer.audios.get(Id)!.stream;
    // 새로운 스트림을 만듦
    const newStream = new MediaStream();
    stream.getTracks().forEach(oldTrack => {
      newStream.addTrack(oldTrack);
    });
    newStream.addTrack(track);
    // 기존 데이터 교체
    audio.srcObject = newStream;
    this.audioContainer.audios.get(Id)!.stream = newStream;
  }

  static removeAllAudioTrack(Id: string): void {
    this.audioContainer.audios.delete(Id);
    this.addDefaultValueToAudiosIfNotHas(Id);
  }

  static isSpeakerChangeable(): boolean {
    if ((this.testAudio as any).setSinkId) {
      return true;
    }
    return false;
  }

  static async tryAuth(): Promise<boolean> {
    return navigator.mediaDevices
      .getUserMedia({video: false, audio: true})
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  }

  static clear() {
    this.localAudioStream = null;
    this.onLocalAudioStreams.clear();
    this._micDeivceId = 'default';
    this._speakerDeviceId = 'default';
    this.audioContainer = {
      elementContainer: null,
      audios: new Map(),
    };
  }
}
