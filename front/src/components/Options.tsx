import React, {useState, useEffect} from 'react';
import {Dropdown} from 'antd';
import SettingDropDown from './Setting';

interface OptionsProps {
  changeEachAudio: (deviceId: string) => void;
  changeInputStream: (stream: MediaStream) => void;
  seletedOutputDevice: string;
  seletedInputDevice: string;
  onClickOption: () => void;
}

function Options(props: OptionsProps): JSX.Element {
  const [visible, setVisible] = useState(false);
  const [seletedOutputDevice, setSelectOutputDevice] = useState(
    props.seletedOutputDevice,
  );
  const [seletedInputDevice, setSelectInputDevice] = useState(
    props.seletedInputDevice,
  );
  const onClickPrevious = () => {
    setVisible(!visible);
  };
  const onClickConfirm = () => {
    // 마이크 관련 세팅.
    setVisible(true);
  };
  const onESCKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setVisible(false);
    }
  };
  useEffect(() => {
    window.addEventListener('keydown', onESCKeyDown);
    return () => {
      window.removeEventListener('keydown', onESCKeyDown);
    };
  }, []);
  return (
    <Dropdown
      placement={'topCenter'}
      visible={visible}
      onVisibleChange={onClickPrevious}
      overlay={SettingDropDown({
        onClickConfirm: onClickConfirm,
        changeEachAudio: props.changeEachAudio,
        changeInputStream: props.changeInputStream,
        setSelectOutputDevice: setSelectOutputDevice,
        seletedOutputDevice: seletedOutputDevice,
        setSelectInputDevice: setSelectInputDevice,
        seletedInputDevice: seletedInputDevice,
      })}
      trigger={['click']}
    >
      <a className="ant_dropdown_link" onClick={e => e.preventDefault()}>
        옵션
      </a>
    </Dropdown>
  );
}

export default Options;
