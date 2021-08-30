import {createContext} from 'react';
import PeerManager from './RTCGameUtils';
import {Camera} from './webGLUtils';

interface ContextType {
  peerManager: PeerManager | undefined;
  camera: Camera | undefined;
  initialInfo: [number, string];
}

const GlobalContext = createContext<ContextType>({
  peerManager: undefined,
  camera: undefined,
  initialInfo: [0, ''],
});

export default GlobalContext;
