import React, {useState} from 'react';
import {Menu, Dropdown} from 'antd';
import {EllipsisOutlined} from '@ant-design/icons';
import SettingDropDown from './Setting';

interface OptionDropDownProps {
  onClickSetting: () => void;
}

interface OptionsProps {
  changeEachAudio: (deviceId: string) => void;
  changeInputStream: (stream: MediaStream) => void;
  seletedOutputDevice: string;
  seletedInputDevice: string;
}

// interface SettingDropDownProps {
//   onClickPrevious: () => void;
// }

function OptionDropDown(props: OptionDropDownProps) {
  return (
    <Menu>
      <Menu.Item key="0" disabled={false}>
        <a className="setting-button" onClick={props.onClickSetting}>
          설정
        </a>
      </Menu.Item>
      <Menu.Item key="1">
        <a
          rel="noreferrer"
          href="https://github.com/VoiceSpaceUnder5/VoiceSpace/issues"
          target="_blank"
        >
          {' '}
          문제 해결 및 도움말
        </a>
      </Menu.Item>
    </Menu>
  );
}

function Options(props: OptionsProps): JSX.Element {
  const [depth, setDepth] = useState(0);
  const [visible, setVisible] = useState(false);
  const [seletedOutputDevice, setSelectOutputDevice] = useState(
    props.seletedOutputDevice,
  );
  const [seletedInputDevice, setSelectInputDevice] = useState(
    props.seletedInputDevice,
  );
  const onClickSetting = () => {
    setVisible(true);
    setDepth(1);
  };
  const onClickPrevious = () => {
    setVisible(!visible);
    setTimeout(() => {
      setDepth(0);
    }, 300);
  };
  const onClickConfirm = () => {
    // 마이크 관련 세팅.
    setVisible(true);
    setDepth(0);
  };
  return (
    <Dropdown
      visible={visible}
      onVisibleChange={onClickPrevious}
      overlay={
        depth === 0
          ? OptionDropDown({onClickSetting: onClickSetting})
          : SettingDropDown({
              onClickConfirm: onClickConfirm,
              changeEachAudio: props.changeEachAudio,
              changeInputStream: props.changeInputStream,
              setSelectOutputDevice: setSelectOutputDevice,
              seletedOutputDevice: seletedOutputDevice,
              setSelectInputDevice: setSelectInputDevice,
              seletedInputDevice: seletedInputDevice,
            })
      }
      trigger={['click']}
    >
      <a className="ant_dropdown_link" onClick={e => e.preventDefault()}>
        <EllipsisOutlined className="navbar_button" />
      </a>
    </Dropdown>
  );
}

export default Options;
