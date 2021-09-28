import React from 'react';
import {Menu} from 'antd';
import '../pages/spacePage/space.css';
import SelectDevice from './SelectDevice';

export interface SettingProps {
  onClickConfirm: () => void;
  changeEachAudio: (deviceId: string) => void;
  changeInputStream: (stream: MediaStream) => void;
  setSelectOutputDevice: React.Dispatch<React.SetStateAction<string>>;
  seletedOutputDevice: string;
  setSelectInputDevice: React.Dispatch<React.SetStateAction<string>>;
  seletedInputDevice: string;
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
          <SelectDevice
            changeEachAudio={props.changeEachAudio}
            changeInputStream={props.changeInputStream}
            setSelectOutputDevice={props.setSelectOutputDevice}
            seletedOutputDevice={props.seletedOutputDevice}
            setSelectInputDevice={props.setSelectInputDevice}
            seletedInputDevice={props.seletedInputDevice}
          ></SelectDevice>
        </div>
        <div className="profile_button">
          <button onClick={props.onClickConfirm}>변경</button>
        </div>
      </Menu.Item>
    </Menu>
  );
}

export default SettingDropDown;
