import React from 'react';
import './App.css';
import Logo from './Logo'
import Hello from './Hello'
import Descript from './Descript'
import CreateRoom from './CreateRoom'
import EnterRoom from './EnterRoom'
import MoreInfo from './MoreInfo'

function App(): JSX.Element {
  return (
    <div id='App'>
      <Logo />
      <Hello />
      <Descript />
      <CreateRoom />
      <EnterRoom />
      <MoreInfo />
    </div>
  );
}

export default App;
