import React, {useEffect, useRef, useState} from 'react';
import {Menu, Dropdown, message, Switch, Button} from 'antd';
import {DesktopOutlined} from '@ant-design/icons';
import {Rnd} from 'react-rnd';
import '../pages/spacePage/space.css';
import {SwitchChangeEventHandler} from 'antd/lib/switch';

interface ScreenViewerProps {
  stream: MediaStream;
}

interface ScreenShareData {
  peerId: string;
  stream: MediaStream;
}

function ScreenViewer(props: ScreenViewerProps): JSX.Element {
  // values
  const headerHeight = 20;
  const originVideoHeight = 120;
  const originAspectRatio = 16 / 9;

  const videoRef = useRef<HTMLVideoElement>(null);
  const rndRef = useRef<Rnd>(null);
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = props.stream;
  }, []);

  const aspectRatio = props.stream
    .getVideoTracks()[0]
    .getSettings().aspectRatio;

  const drawToogleChagne: SwitchChangeEventHandler = () => {
    // if (rndRef.current) {
    //   console.log(rndRef.current.draggable);
    // }
  };
  const height = originVideoHeight + headerHeight;
  const width = aspectRatio
    ? originVideoHeight * aspectRatio
    : originVideoHeight * originAspectRatio;
  return (
    <div style={{position: 'absolute', left: 20, top: 20}}>
      <Rnd
        minWidth={width}
        minHeight={height}
        ref={rndRef}
        lockAspectRatio={aspectRatio ? aspectRatio : originAspectRatio}
        lockAspectRatioExtraHeight={headerHeight + 1}
        style={{zIndex: 999, padding: 0, margin: 0, border: '2px solid white'}}
        default={{
          x: 0,
          y: 0,
          width: width,
          height: height,
        }}
      >
        <p
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
              paddingRight: `${headerHeight / 2}px`,
              paddingLeft: `${headerHeight / 2}px`,
            }}
          >
            <Switch
              checkedChildren={'Stop'}
              unCheckedChildren={'Draw'}
              onChange={drawToogleChagne}
              style={{
                left: 0,
                top: 0,
                height: `${headerHeight - 1}px`,
                marginRight: `${headerHeight / 4}px`,
                padding: 0,
              }}
            ></Switch>
            <Button
              style={{
                margin: 0,
                padding: 0,
                minWidth: `${headerHeight * 0.9}px`,
                height: `${headerHeight * 0.9}px`,
                width: `${headerHeight * 0.9}px`,
                fontSize: `${headerHeight / 4}px`,
              }}
              shape="circle"
            >
              X
            </Button>
          </div>
        </p>
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
          onClick={() => {
            console.log('canvas clicked!');
          }}
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
  const screenShareOnClick = async () => {
    if (
      screenShareDatas.find(data => {
        return data.peerId === '';
      })
    ) {
      message.info(
        '이미 공유중인 화면이 존재합니다. 중지후 다시 선택해주세요!',
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
