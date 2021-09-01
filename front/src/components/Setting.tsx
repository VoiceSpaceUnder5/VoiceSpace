import React, {useState} from 'react';
import {Menu, Dropdown} from 'antd';
import {LeftCircleFilled, RightCircleFilled} from '@ant-design/icons';
import '../pages/spacePage/space.css';
import {
  AvatarImageEnum,
  avatarImageMDs,
  AvatarPartImageEnum,
} from '../utils/ImageMetaData';
import MenuItem from 'antd/lib/menu/MenuItem';

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
          <div>마이크</div>
          <div className="mic_select_div">
            <select className="mic_select">
              <option value="one">1번마이크</option>
              <option value="two">2번마이크</option>
              <option value="three">3번마이크</option>
              <option value="etc">등등</option>
            </select>
            <img
              className="mic_select_img"
              src="./assets/home/homeLogo.png"
            ></img>
          </div>
          <div className="speaker_select_div">
            <div>스피커</div>
            <select className="speaker_select">
              <option value="earphone">이어폰</option>
              <option value="headphone">헤드폰</option>
              <option value="speaker">스피커</option>
              <option value="etc">등등</option>
            </select>
          </div>
          <div className="empty"></div>
        </div>
        <div className="profile_button">
          <button onClick={props.onClickConfirm}>변경</button>
        </div>
      </Menu.Item>
    </Menu>
  );
}

export default SettingDropDown;
