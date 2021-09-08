// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

class mockRTCPeerConnection {}

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

class mockMediaStreamAudioSourceNode {
  connect = jest.fn();
}

class mockAudioContext {
  createMediaStreamSource = jest
    .fn()
    .mockImplementation(() => new mockMediaStreamAudioSourceNode());
  createAnalyser = jest.fn().mockImplementation(() => new mockAnalyserNode());
}

global.RTCPeerConnection = mockRTCPeerConnection;
global.AudioContext = mockAudioContext;
