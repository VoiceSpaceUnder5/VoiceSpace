import React, {useEffect, useRef, useState} from 'react';
import {Menu, Dropdown} from 'antd';
import {DesktopOutlined} from '@ant-design/icons';
import {Rnd} from 'react-rnd';
import '../pages/spacePage/space.css';

interface ScreenViewerProps {
  stream: MediaStream;
}

interface ScreenShareData {
  peerId: string;
  stream: MediaStream;
}

function ScreenViewer(props: ScreenViewerProps): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = props.stream;
  }, []);

  const aspectRatio = props.stream
    .getVideoTracks()[0]
    .getSettings().aspectRatio;

  const height = 90;
  const width = aspectRatio ? 90 * aspectRatio : 160;
  return (
    <div style={{position: 'absolute', left: 20, top: 20}}>
      <Rnd
        lockAspectRatio={true}
        style={{zIndex: 999, padding: 0, border: '2px solid white'}}
        default={{
          x: 0,
          y: 0,
          width: width,
          height: height,
        }}
      >
        <video
          style={{
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
          autoPlay={true}
          ref={videoRef}
          controls={false}
        ></video>
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
            key={screenShareData.stream.id}
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
