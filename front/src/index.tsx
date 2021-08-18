import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'antd/dist/antd.css';
import Home from './home/home';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter, Route} from 'react-router-dom';
import SpaceMain from './spaceMain/spaceMain';
import GlobalContext from './spaceMain/GlobalContext';

const Router = () => {
  return (
    <div>
      <Route path="/" exact component={Home} />
      <GlobalContext.Provider
        value={{
          peerManager: undefined,
          initialInfo: [0, ''],
        }}
      >
        <Route path="/space" component={SpaceMain} />
      </GlobalContext.Provider>
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Router></Router>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
