import React, {useEffect, useRef, useState} from 'react';
import {Menu, Dropdown, message, Switch, Slider} from 'antd';
import {DesktopOutlined} from '@ant-design/icons';
import {Rnd} from 'react-rnd';
import './screenShare.css';
import {SwitchChangeEventHandler} from 'antd/lib/switch';
import {HexColorPicker} from 'react-colorful';
import {DataDtoType, Peer, Vec2} from '../utils/RTCGameUtils';

interface ScreenViewerProps {
  socketID: string;
  stream: MediaStream;
  strokeColor: string;
  lineWidth: number;
  drawHelper: DrawHelper;
  setOtherSideDrawStartPos: (socketID: string, startPos: Vec2) => void;
  setOtherSideDraw: (
    socketID: string,
    toPos: Vec2,
    strokeColor: string,
    lineWidth: number,
  ) => void;
  setOtherSideClear: (socketID: string) => void;
}

interface ScreenShareData {
  peerId: string;
  stream: MediaStream;
  drawHelper: DrawHelper;
}

function getXYClampOneZero(
  bound: DOMRect,
  clientX: number,
  clientY: number,
): Vec2 {
  const width = bound.right - bound.left;
  const height = bound.bottom - bound.top;
  const x = clientX - bound.left;
  const y = clientY - bound.top;
  return {x: x / width, y: y / height};
}

class DrawHelper {
  private canvas: HTMLCanvasElement | null;
  private context: CanvasRenderingContext2D | null;
  private drawStartPos: Vec2;
  constructor() {
    this.canvas = null;
    this.context = null;
    this.drawStartPos = {x: 0, y: 0};
  }
  setUp(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    if (!this.context) console.error('can not create context in DrawHelper');
  }

  setDrawStartPos(pos: Vec2): void {
    this.drawStartPos = {...pos};
  }
  clear(): void {
    if (this.canvas && this.context)
      this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  drawLineAndSaveStartPos(
    toPos: Vec2,
    strokeColor: string,
    lineWidth: number,
  ): void {
    if (!this.canvas || !this.context) return;
    this.context.beginPath();
    this.context.moveTo(
      this.drawStartPos.x * this.canvas.width,
      this.drawStartPos.y * this.canvas.height,
    );
    this.context.lineTo(
      toPos.x * this.canvas.width,
      toPos.y * this.canvas.height,
    );
    this.context.strokeStyle = strokeColor;
    this.context.lineWidth = lineWidth;
    this.context.stroke();
    this.setDrawStartPos(toPos);
  }
}

function ScreenViewer(props: ScreenViewerProps): JSX.Element {
  // state
  const [isDragging, setIsDragging] = useState(true);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(
    props.stream.getTracks()[0].getSettings().aspectRatio
      ? // eslint-disable-next-line
        props.stream.getTracks()[0].getSettings().aspectRatio!
      : 16 / 9,
  );

  // canvasRef
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // values
  const headerHeight = 20;
  const originVideoHeight = 120;

  const videoRef = useRef<HTMLVideoElement>(null);
  const rndRef = useRef<Rnd>(null);

  const canvasWidth = 2000;
  const canvasHeight = 2000;

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = props.stream;
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    props.drawHelper.setUp(canvasRef.current);
  }, [canvasRef]);

  const drawToogleChagne: SwitchChangeEventHandler = (checked: boolean) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      if (checked)
        canvas.style.cursor = 'url(./assets/navigation/pencil.png) 4 20, auto';
      else canvas.style.cursor = 'move';
    }

    setIsDragging(!checked);
  };

  const clearClickHandler = () => {
    props.drawHelper.clear();
    props.setOtherSideClear(props.socketID);
  };

  const canvasMouseEventHandler: React.MouseEventHandler<HTMLCanvasElement> =
    event => {
      if (isDragging) return;
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      switch (event.type) {
        case 'mousedown': {
          setIsMouseDown(true);
          const startPos = getXYClampOneZero(
            canvas.getBoundingClientRect(),
            event.clientX,
            event.clientY,
          );
          props.drawHelper.setDrawStartPos(startPos);
          props.setOtherSideDrawStartPos(props.socketID, startPos);
          break;
        }
        case 'mousemove': {
          if (isMouseDown) {
            const context = canvas.getContext('2d');
            if (!context) return;
            const vec = getXYClampOneZero(
              canvas.getBoundingClientRect(),
              event.clientX,
              event.clientY,
            );
            props.drawHelper.drawLineAndSaveStartPos(
              vec,
              props.strokeColor,
              props.lineWidth,
            );
            props.setOtherSideDraw(
              props.socketID,
              vec,
              props.strokeColor,
              props.lineWidth,
            );
          }
          break;
        }
        case 'mouseup': {
          setIsMouseDown(false);
          break;
        }
        case 'mouseleave': {
          setIsMouseDown(false);
          break;
        }
        default: {
          console.error(
            `canvasMouseEventHandler called with wrong event type :${event.type}`,
          );
          break;
        }
      }
    };

  const onResize = () => {
    if (props.stream.getTracks()[0].getSettings().aspectRatio) {
      // eslint-disable-next-line
      setAspectRatio(props.stream.getTracks()[0].getSettings().aspectRatio!);
    }
  };

  const height = originVideoHeight + headerHeight;
  const width = originVideoHeight * aspectRatio;
  return (
    <div className="rndContainer">
      <Rnd
        onResize={onResize}
        disableDragging={!isDragging}
        className="rnd"
        minWidth={width}
        minHeight={height}
        ref={rndRef}
        lockAspectRatio={aspectRatio}
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
            <button
              style={{height: `${headerHeight - 1}px`}}
              onClick={clearClickHandler}
            >
              Clear
            </button>
          </div>
        </div>
        <video
          style={{
            top: 0,
            left: 0,
            width: '100%',
            height: `calc(100% - ${headerHeight}px)`,
          }}
          muted={false}
          autoPlay={true}
          ref={videoRef}
          controls={false}
        ></video>
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onMouseDown={canvasMouseEventHandler}
          onMouseMove={canvasMouseEventHandler}
          onMouseUp={canvasMouseEventHandler}
          onMouseLeave={canvasMouseEventHandler}
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
  socketID: string;
  addVideoTrack: (stream: MediaStream) => void;
  setTrackEventHandler: (
    trackEventHandler: (peerId: string, event: RTCTrackEvent) => void,
  ) => void;
  removeVideoTrack: () => void;
  setDataChannelEventHandler: (
    dataType: DataDtoType,
    // eslint-disable-next-line
    dataChannelEventHandler: (arg0: any, peer: Peer) => void,
  ) => void;
  setOtherSideDrawStartPos: (socketID: string, startPos: Vec2) => void;
  setOtherSideDraw: (
    socketID: string,
    toPos: Vec2,
    strokeColor: string,
    lineWidth: number,
  ) => void;
  setOtherSideClear: (socketID: string) => void;
}

function ScreenShare(props: ScreenShareProps): JSX.Element {
  const [screenShareDatas, setScreenShareDatas] = useState<ScreenShareData[]>(
    [],
  );
  const [isDisplayColorPicker, setIsDisplayColorPicker] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(1);
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
    const stream = await (navigator.mediaDevices as any).getDisplayMedia({
      audio: true,
      video: true,
    }); // 핸드폰일 경우 사용 불가.
    props.addVideoTrack(stream);
    setScreenShareDatas([
      {peerId: props.socketID, stream: stream, drawHelper: new DrawHelper()},
      ...screenShareDatas,
    ]);
  };

  const screenShareStopOnClick = () => {
    props.removeVideoTrack();
    setScreenShareDatas(before => {
      return before.filter(data => {
        return data.peerId !== props.socketID;
      });
    });
  };

  const trackEventHandler = (peerId: string, event: RTCTrackEvent) => {
    if (event.track.kind === 'video') {
      console.log('trackEventHandler', peerId);
      const stream = new MediaStream();
      stream.addTrack(event.track);
      setScreenShareDatas(before => {
        return [
          {
            peerId: peerId,
            stream: stream,
            drawHelper: new DrawHelper(),
          },
          ...before,
        ];
      });
    }
  };

  useEffect(() => {
    props.setTrackEventHandler(trackEventHandler);
    props.setDataChannelEventHandler(
      DataDtoType.SHARED_SCREEN_CLOSE,
      peerId => {
        setScreenShareDatas(before => {
          return before.filter(data => {
            return data.peerId !== peerId;
          });
        });
      },
    );
    props.setDataChannelEventHandler(
      DataDtoType.SHARED_SCREEN_DRAW_START,
      data => {
        setScreenShareDatas(screenDatas => {
          const screenShareData = screenDatas.find(ssd => {
            return ssd.peerId === data.socketID;
          });
          if (screenShareData) {
            screenShareData.drawHelper.setDrawStartPos(data.startPos);
          }
          return screenDatas;
        });
      },
    );
    props.setDataChannelEventHandler(
      DataDtoType.SHARED_SCREEN_DRAWING,
      data => {
        setScreenShareDatas(screenDatas => {
          const screenShareData = screenDatas.find(ssd => {
            return ssd.peerId === data.socketID;
          });
          if (screenShareData) {
            screenShareData.drawHelper.drawLineAndSaveStartPos(
              data.toPos,
              data.strokeColor,
              data.lineWidth,
            );
          }
          return screenDatas;
        });
      },
    );
    props.setDataChannelEventHandler(DataDtoType.SHARED_SCREEN_CLEAR, data => {
      setScreenShareDatas(screenDatas => {
        const screenShareData = screenDatas.find(ssd => {
          return ssd.peerId === data.socketID;
        });
        if (screenShareData) {
          screenShareData.drawHelper.clear();
        }
        return screenDatas;
      });
    });
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
                <div style={{background: 'white', borderRadius: '4%'}}>
                  <HexColorPicker
                    color={color}
                    onChange={setColor}
                  ></HexColorPicker>
                  <Slider
                    min={1}
                    max={10}
                    value={lineWidth}
                    onChange={setLineWidth}
                  ></Slider>
                </div>
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
            socketID={screenShareData.peerId}
            stream={screenShareData.stream}
            strokeColor={color}
            lineWidth={lineWidth}
            drawHelper={screenShareData.drawHelper}
            setOtherSideDraw={props.setOtherSideDraw}
            setOtherSideDrawStartPos={props.setOtherSideDrawStartPos}
            setOtherSideClear={props.setOtherSideClear}
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
