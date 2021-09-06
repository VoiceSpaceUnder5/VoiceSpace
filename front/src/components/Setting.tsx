import React from 'react';
import {Menu} from 'antd';
import '../pages/spacePage/space.css';

export interface SettingProps {
  onClickConfirm: () => void;
}
// 옵션에다가 기계를 넣어줘야합니다.
function SettingDropDown(props: SettingProps): JSX.Element {
  return (
    <Menu className="setting_dropdown_menu">
      <Menu.Item className="setting_menu_item_title" key="0" disabled={false}>
        <div className="setting_title">설정</div>
      </Menu.Item>
      <Menu.Divider></Menu.Divider>
      <Menu.Item className="setting_menu_item_content" key="1">
        <div>
          <div className="audio_title">오디오 설정</div>
          <div>입력</div>
          <div className="mic_select_div">
            <select className="mic_select">
              <option value="default_mic">기본값_내장마이크</option>
              <option value="airpod_pro_mic">airpod_pro mic</option>
              <option value="headphone_mic">headphone mic</option>
            </select>
            <img
              className="mic_select_img"
              src="./assets/navigation/mic.png"
            ></img>
          </div>
          <div>출력</div>
          <div className="speaker_select_div">
            <select className="speaker_select">
              <option value="default_speaker">기본값-내장스피커</option>
              <option value="airpod_pro">airpod-pro</option>
              <option value="headphone">headphone</option>
            </select>
            <img
              className="speaker_select_img"
              src="./assets/navigation/speaker.png"
            ></img>
          </div>
        </div>
        <div className="profile_button">
          <button onClick={props.onClickConfirm}>변경</button>
        </div>
      </Menu.Item>
    </Menu>
  );
}

export default SettingDropDown;
