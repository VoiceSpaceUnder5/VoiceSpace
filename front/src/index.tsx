import React from 'react'; //test 주석
import ReactDOM from 'react-dom';
import './index.css';
import 'antd/dist/antd.css';
import Home from './pages/homePage/Home';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter, Route} from 'react-router-dom';
import Space from './pages/spacePage/Space';
import Setting from './pages/settingPage/Setting';

//아이폰에서 vh가 하단 툴바영엮까지 포함하는 부분 해결하기 위해, 실제 innerHeight로 vh를 업데이트 해주자.
const vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

window.addEventListener('resize', () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
});

function Router() {
  return (
    <>
      <Route path="/" exact component={Home} />
      <Route path="/space" component={Space} />
      <Route path="/setting" component={Setting} />
    </>
  );
}

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
