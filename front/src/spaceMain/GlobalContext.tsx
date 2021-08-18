import {createContext} from 'react';
import PeerManager from './RTCGameUtils';

interface ContextType {
  peerManager: PeerManager | undefined;
}

const GlobalContext = createContext<ContextType>({peerManager: undefined});

export default GlobalContext;
