import {createContext} from 'react';
import PeerManager from './RTCGameUtils';

interface ContextType {
  peerManager: PeerManager | undefined;
  initialInfo: [number, string];
}

const GlobalContext = createContext<ContextType>({
  peerManager: undefined,
  initialInfo: [0, ''],
});

export default GlobalContext;
