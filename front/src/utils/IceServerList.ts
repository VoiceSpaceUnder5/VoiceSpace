export const iceConfig: RTCConfiguration = {
  iceServers: [
    {urls: 'stun:stun.ekiga.net'},
    {urls: 'stun:stun.schlund.de'},
    {urls: 'stun:stun.l.google.com:19302'},
    {urls: 'stun:stun1.l.google.com:19302'},
    {urls: 'stun:stun2.l.google.com:19302'},
    {urls: 'stun:stun3.l.google.com:19302'},
    {urls: 'stun:stun4.l.google.com:19302'},
    {urls: 'stun:stun.voipbuster.com'},
    {urls: 'stun:stun.voipstunt.com'},
    {urls: 'stun:stun.xten.com'},
    {
      urls: 'turn:numb.viagenie.ca',
      credential: 'muazkh',
      username: 'webrtc@live.com',
    },
  ],
  iceTransportPolicy: 'all', //참조 : https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration/iceTransportPolicy
};
