// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import {EventEmitter} from 'stream';

class mockRTCPeerConnection {
  addIceCandidate = jest.fn();
  addTrack = jest.fn();
  addTransceiver = jest.fn();
  close = jest.fn();
  createAnswer = jest.fn().mockReturnValue(Promise.resolve('sdpAnswerForTest'));
  createDataChannel = jest.fn();
  createOffer = jest.fn().mockReturnValue(Promise.resolve('sdpOfferForTest'));
  getConfiguration = jest.fn();
  getIdentityAssertion = jest.fn();
  getReceivers = jest.fn();
  getSenders = jest.fn();
  getStats = jest.fn();
  getTransceivers = jest.fn();
  removeTrack = jest.fn();
  restartIce = jest.fn();
  setConfiguration = jest.fn();
  setIdentityProvider = jest.fn();
  setLocalDescription = jest.fn();
  setRemoteDescription = jest.fn().mockReturnValue(Promise.resolve());
  addEventListener = jest.fn();
  removeEventListener = jest.fn();
}

class mockAnalyserNode {
  smoothingTimeConstant: number;
  fftSize: number;
  frequencyBinCount = 1000;
  getByteFrequencyData(arr: Uint8Array) {
    arr.forEach((val, idx) => {
      arr[idx] = 100;
    });
  }
}

class mockMediaStream {
  tracks = [
    {
      getSettings: () => {
        return {deviceId: 'default'};
      },
    },
  ];
  addTrack = track => {
    this.tracks.push(track);
  };
  getTracks = () => {
    return this.tracks;
  };
  getAudioTracks = () => {
    return this.tracks;
  };
}

class mockMediaStreamAudioSourceNode {
  connect = jest.fn();
  disconnect = jest.fn();
}

class mockAudioContext {
  createMediaStreamSource = jest
    .fn()
    .mockImplementation(() => new mockMediaStreamAudioSourceNode());
  createAnalyser = jest.fn().mockImplementation(() => new mockAnalyserNode());
}

global.RTCPeerConnection = mockRTCPeerConnection;
global.AudioContext = mockAudioContext;
global.MediaStream = mockMediaStream;
