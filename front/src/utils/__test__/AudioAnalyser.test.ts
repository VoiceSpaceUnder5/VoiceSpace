import {AvatarPartImageEnum} from '../ImageMetaData';
import {AudioAnalyser} from '../RTCGameUtils';

const mockedStream: any = [];

describe('AudioAnalyser Test', () => {
  test('getAvatarFaceDtoByAudioAnalysis 호출시 정상적으로 AvatarFaceDto 가 리턴되어야 함', () => {
    const audioAnalyser = new AudioAnalyser(mockedStream, 2, 30, 50);
    const result = audioAnalyser.getAvatarFaceDtoByAudioAnalysis();
    expect(result.avatarFaceScale).toBe(1 + 50);
    expect(result.avatarFace).toBe(AvatarPartImageEnum.FACE_SPEAK_SMILE);
  });

  test('getAvatarFaceDtoByAudioAnalysis 호출시 정상적으로 AvatarFaceDto 가 리턴되어야 함', () => {
    const audioAnalyser = new AudioAnalyser(mockedStream, 5, 300, 500);
    const result = audioAnalyser.getAvatarFaceDtoByAudioAnalysis();
    expect(result.avatarFaceScale).toBe(1 + 20);
    expect(result.avatarFace).toBe(AvatarPartImageEnum.FACE_MUTE);
  });

  test('getAvatarFaceDtoByAudioAnalysis 호출시 정상적으로 AvatarFaceDto 가 리턴되어야 함', () => {
    const audioAnalyser = new AudioAnalyser(mockedStream, 2, 50, 500);
    const result = audioAnalyser.getAvatarFaceDtoByAudioAnalysis();
    expect(result.avatarFaceScale).toBe(1 + 50);
    expect(result.avatarFace).toBe(AvatarPartImageEnum.FACE_SPEAK);
  });
});
