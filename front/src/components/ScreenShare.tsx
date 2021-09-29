import React, {useEffect, useRef, useState} from 'react';
import {Menu, Dropdown, message, Switch} from 'antd';
import {DesktopOutlined} from '@ant-design/icons';
import {Rnd} from 'react-rnd';
import './screenShare.css';
import {SwitchChangeEventHandler} from 'antd/lib/switch';
import {HexColorPicker} from 'react-colorful';

interface ScreenViewerProps {
  stream: MediaStream;
}

interface ScreenShareData {
  peerId: string;
  stream: MediaStream;
}

function ScreenViewer(props: ScreenViewerProps): JSX.Element {
  // state
  const [isDragging, setIsDragging] = useState(true);

  // values
  const headerHeight = 20;
  const originVideoHeight = 120;
  const originAspectRatio = 16 / 9;

  const videoRef = useRef<HTMLVideoElement>(null);
  const rndRef = useRef<Rnd>(null);
  const aspectRatio = props.stream.getTracks()[0].getSettings().aspectRatio;

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = props.stream;
  }, []);

  const drawToogleChagne: SwitchChangeEventHandler = (checked: boolean) => {
    setIsDragging(!checked);
  };
  const height = originVideoHeight + headerHeight;
  const width = aspectRatio
    ? originVideoHeight * aspectRatio
    : originVideoHeight * originAspectRatio;
  return (
    <div className="rndContainer">
      <Rnd
        disableDragging={!isDragging}
        className="rnd"
        minWidth={width}
        minHeight={height}
        ref={rndRef}
        lockAspectRatio={aspectRatio ? aspectRatio : originAspectRatio}
        lockAspectRatioExtraHeight={headerHeight + 1}
        default={{
          x: 0,
          y: 0,
          width: width,
          height: height,
        }}
      >
        <div
          style={{
            width: '100%',
            height: `${headerHeight}px`,
            margin: 0,
            padding: 0,
            background: 'white',
            fontSize: `${headerHeight / 2}px`,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div>Shared Screen</div>
          <div
            style={{
              margin: 0,
              paddingRight: `${2}px`,
              paddingLeft: `${headerHeight / 2}px`,
              paddingTop: 0,
              paddingBottom: 0,
            }}
          >
            <Switch
              checkedChildren={'Stop'}
              unCheckedChildren={'Draw'}
              onChange={drawToogleChagne}
              style={{
                left: 0,
                top: -headerHeight / 10,
                height: `${headerHeight - 1}px`,
                padding: 0,
              }}
            ></Switch>
            <button style={{height: `${headerHeight - 1}px`}}>Clear</button>
          </div>
        </div>
        <video
          style={{
            top: 0,
            left: 0,
            width: '100%',
            height: `calc(100% - ${headerHeight}px)`,
          }}
          autoPlay={true}
          ref={videoRef}
          controls={false}
        ></video>
        <canvas
          style={{
            top: '20px',
            left: 0,
            width: '100%',
            height: `calc(100% - ${headerHeight}px)`,
            position: 'absolute',
          }}
        ></canvas>
      </Rnd>
    </div>
  );
}

interface ScreenShareProps {
  addVideoTrack: (stream: MediaStream) => void;
  setTrackEventHandler: (
    trackEventHandler: (peerId: string, event: RTCTrackEvent | null) => void,
  ) => void;
  removeVideoTrack: () => void;
}

function ScreenShare(props: ScreenShareProps): JSX.Element {
  const [screenShareDatas, setScreenShareDatas] = useState<ScreenShareData[]>(
    [],
  );
  const [isDisplayColorPicker, setIsDisplayColorPicker] = useState(false);
  const [color, setColor] = useState('#000000');
  const screenShareOnClick = async () => {
    if (
      screenShareDatas.find(data => {
        return data.peerId === '';
      })
    ) {
      message.info(
        '이미 공유중인 화면이 존재합니다. 중지 후 다시 선택해주세요!',
      );
      return;
    }
    // eslint-disable-next-line
    const stream = await (navigator.mediaDevices as any).getDisplayMedia(); // 핸드폰일 경우 사용 불가.
    props.addVideoTrack(stream);
    setScreenShareDatas([{peerId: '', stream: stream}, ...screenShareDatas]);
  };

  const screenShareStopOnClick = () => {
    props.removeVideoTrack();
    setScreenShareDatas(before => {
      return before.filter(data => {
        return data.peerId !== '';
      });
    });
  };

  const trackEventHandler = (peerId: string, event: RTCTrackEvent | null) => {
    if (event) {
      if (event.track.kind === 'video') {
        const stream = new MediaStream();
        stream.addTrack(event.track);
        setScreenShareDatas(before => {
          return [
            {
              peerId: peerId,
              stream: stream,
            },
            ...before,
          ];
        });
      }
    } else {
      setScreenShareDatas(before => {
        return before.filter(data => {
          return data.peerId !== peerId;
        });
      });
    }
  };

  useEffect(() => {
    props.setTrackEventHandler(trackEventHandler);
  }, []);
  const screenshare = () => {
    return (
      <>
        <Menu>
          <Menu.Item key="0">
            <a role="button" onClick={screenShareOnClick}>
              화면 공유
            </a>
          </Menu.Item>
          <Menu.Item key="1">
            <a role="button" onClick={screenShareStopOnClick}>
              정지
            </a>
          </Menu.Item>
          <Menu.Item key="2">
            <Dropdown
              visible={isDisplayColorPicker}
              onVisibleChange={() => {
                setIsDisplayColorPicker(!isDisplayColorPicker);
              }}
              overlay={
                <>
                  <HexColorPicker
                    color={color}
                    onChange={setColor}
                  ></HexColorPicker>
                  <div>Hello</div>
                </>
              }
              trigger={['click']}
            >
              <a
                onClick={e => e.preventDefault()}
                className="ant_dropdown_link"
              >
                그리기 색상,굵기 선택
              </a>
            </Dropdown>
          </Menu.Item>
        </Menu>
      </>
    );
  };
  return (
    <>
      {screenShareDatas.map(screenShareData => {
        return (
          <ScreenViewer
            key={screenShareData.peerId}
            stream={screenShareData.stream}
          ></ScreenViewer>
        );
      })}
      <Dropdown overlay={screenshare} trigger={['click']}>
        <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
          <DesktopOutlined className="navbar_button" />
        </a>
      </Dropdown>
    </>
  );
}

export default ScreenShare;
