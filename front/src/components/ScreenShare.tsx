import React, {useEffect, useRef, useState} from 'react';
import {Menu, Dropdown, message, Switch, Slider} from 'antd';
import {DesktopOutlined, EditOutlined, ClearOutlined} from '@ant-design/icons';
import {Rnd} from 'react-rnd';
import './screenShare.css';
import {SwitchChangeEventHandler} from 'antd/lib/switch';
import {HexColorPicker} from 'react-colorful';
import {DataDtoType, Peer, Vec2} from '../utils/RTCGameUtils';

interface ScreenViewerProps {
  nickname: string;
  mySocketID: string;
  sharedSocketID: string;
  stream: MediaStream;
  strokeColor: string;
  lineWidth: number;
  drawHelper: DrawHelper;
  posX: number;
  posY: number;
  forceUpdateCnt: number;
  setOtherSideDrawStartPos: (
    fromSocketID: string,
    toSocketID: string,
    startPos: Vec2,
  ) => void;
  setOtherSideDraw: (
    fromSocketID: string,
    toSocketID: string,
    toPos: Vec2,
    strokeColor: string,
    lineWidth: number,
  ) => void;
  setOtherSideClear: (fromSocketID: string, toSocketID: string) => void;
}

interface ScreenShareData {
  peerId: string;
  stream: MediaStream;
  drawHelper: DrawHelper;
  posX: number;
  posY: number;
  forceUpdateCnt: number;
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
  private drawStartPositions: Map<string, Vec2>;
  constructor() {
    this.canvas = null;
    this.context = null;
    this.drawStartPositions = new Map();
  }
  setUp(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    if (!this.context) console.error('can not create context in DrawHelper');
  }

  setDrawStartPos(pos: Vec2, socketID: string): void {
    this.drawStartPositions.set(socketID, {...pos});
  }
  clear(): void {
    if (this.canvas && this.context)
      this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  drawLineAndSaveStartPos(
    toPos: Vec2,
    strokeColor: string,
    lineWidth: number,
    socketID: string,
  ): void {
    if (
      !this.canvas ||
      !this.context ||
      !this.drawStartPositions.has(socketID)
    ) {
      return;
    }
    // eslint-disable-next-line
    const drawStartPos = this.drawStartPositions.get(socketID)!;

    this.context.beginPath();
    this.context.moveTo(
      drawStartPos.x * this.canvas.width,
      drawStartPos.y * this.canvas.height,
    );
    this.context.lineTo(
      toPos.x * this.canvas.width,
      toPos.y * this.canvas.height,
    );
    this.context.strokeStyle = strokeColor;
    this.context.lineWidth = lineWidth;
    this.context.stroke();
    this.setDrawStartPos(toPos, socketID);
  }
}

let ScreenViewerMaxZIndex = 999;
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
  const [rndZIndex, setRndZIndex] = useState(ScreenViewerMaxZIndex);

  // canvasRef
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // values
  const headerHeight = 20;
  const originVideoHeight = 120;

  const videoRef = useRef<HTMLVideoElement>(null);
  const rndRef = useRef<Rnd>(null);

  const canvasWidth = 2000;
  const canvasHeight = 2000;

  const height = originVideoHeight + headerHeight;
  const width = originVideoHeight * aspectRatio;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = props.stream;
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    props.drawHelper.setUp(canvasRef.current);
  }, [canvasRef]);

  useEffect(() => {
    rndRef.current?.updatePosition({x: props.posX, y: props.posY});
    rndRef.current?.updateSize({
      width: width,
      height: height,
    });
  }, [props.forceUpdateCnt]);

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
    props.setOtherSideClear(props.mySocketID, props.sharedSocketID);
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
          props.drawHelper.setDrawStartPos(startPos, props.mySocketID);
          props.setOtherSideDrawStartPos(
            props.mySocketID,
            props.sharedSocketID,
            startPos,
          );

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
              props.mySocketID,
            );
            props.setOtherSideDraw(
              props.mySocketID,
              props.sharedSocketID,
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
    setRndZIndex(++ScreenViewerMaxZIndex);
  };

  const onMouseDown = () => {
    setRndZIndex(++ScreenViewerMaxZIndex);
    console.log('onMouseDown');
  };
  return (
    <Rnd
      style={{
        zIndex: rndZIndex,
        height: height,
      }}
      bounds={'body'}
      onResize={onResize}
      onMouseDown={onMouseDown}
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
          paddingBottom: 1,
          background: 'white',
          fontSize: `${headerHeight / 2}px`,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div>{`${props.nickname}`}</div>
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
            }}
          ></Switch>
          <button
            style={{margin: 0, padding: 0, height: `${headerHeight - 1}px`}}
          >
            <EditOutlined />
          </button>
          <button
            style={{height: `${headerHeight - 1}px`}}
            onClick={clearClickHandler}
          >
            <ClearOutlined></ClearOutlined>
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
  setOtherSideDrawStartPos: (
    fromSocketID: string,
    toSocketID: string,
    startPos: Vec2,
  ) => void;
  setOtherSideDraw: (
    fromSocketID: string,
    toSocketID: string,
    toPos: Vec2,
    strokeColor: string,
    lineWidth: number,
  ) => void;
  setOtherSideClear: (fromSocketID: string, toSocketID: string) => void;
  getNickNameFromSocketID: (socketID: string) => string;
}

function addVideoTrackEndedEventIfExist(
  stream: MediaStream,
  onended: (this: MediaStreamTrack, ev: Event) => void,
) {
  if (stream.getVideoTracks() && stream.getVideoTracks()[0]) {
    stream.getVideoTracks()[0].onended = onended;
  }
}

function ScreenShare(props: ScreenShareProps): JSX.Element {
  const [screenShareDatas, setScreenShareDatas] = useState<ScreenShareData[]>(
    [],
  );
  const [isDisplayColorPicker, setIsDisplayColorPicker] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const [isVisible, setIsVisible] = useState(false);

  const screenShareOnClick = async () => {
    setIsVisible(false);
    if (
      screenShareDatas.find(data => {
        return data.peerId === props.socketID;
      })
    ) {
      message.info(
        '이미 공유중인 화면이 존재합니다. 정지 후 다시 선택해주세요!',
      );
      return;
    }
    try {
      // eslint-disable-next-line
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        audio: true,
        video: true,
      }); // 핸드폰일 경우 사용 불가.
      addVideoTrackEndedEventIfExist(stream, screenShareStopOnClick);
      props.addVideoTrack(stream);
      setScreenShareDatas([
        ...screenShareDatas,
        {
          peerId: props.socketID,
          stream: stream,
          drawHelper: new DrawHelper(),
          posX: 0,
          posY: 0,
          forceUpdateCnt: 0,
        },
      ]);
    } catch (error) {
      message.error(
        '스크린을 선택하지 않으셨거나, 스크린 공유 권한이 없습니다.',
      );
    }
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
    if (event.streams[0]) {
      setScreenShareDatas(before => {
        const alreadyExist = before.find(data => {
          return data.stream.id === event.streams[0].id;
        });
        if (alreadyExist) return before;
        else
          return [
            ...before,
            {
              peerId: peerId,
              stream: event.streams[0],
              drawHelper: new DrawHelper(),
              posX: 0,
              posY: 0,
              forceUpdateCnt: 0,
            },
          ];
      });
    } else if (event.track.kind === 'video') {
      setScreenShareDatas(before => {
        const stream = new MediaStream();
        stream.addTrack(event.track);
        return [
          ...before,
          {
            peerId: peerId,
            stream: stream,
            drawHelper: new DrawHelper(),
            posX: 0,
            posY: 0,
            forceUpdateCnt: 0,
          },
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
            return ssd.peerId === data.toSocketID;
          });
          if (screenShareData) {
            screenShareData.drawHelper.setDrawStartPos(
              data.startPos,
              data.fromSocketID,
            );
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
            return ssd.peerId === data.toSocketID;
          });
          if (screenShareData) {
            screenShareData.drawHelper.drawLineAndSaveStartPos(
              data.toPos,
              data.strokeColor,
              data.lineWidth,
              data.fromSocketID,
            );
          }
          return screenDatas;
        });
      },
    );
    props.setDataChannelEventHandler(DataDtoType.SHARED_SCREEN_CLEAR, data => {
      setScreenShareDatas(screenDatas => {
        const screenShareData = screenDatas.find(ssd => {
          return ssd.peerId === data.toSocketID;
        });
        if (screenShareData) {
          screenShareData.drawHelper.clear();
        }
        return screenDatas;
      });
    });
  }, []);
  const sortSharedScreenOnClick = () => {
    const bodyWidth = document.body.clientWidth;
    const offsetX = 250;
    const offsetY = 150;
    const columnsPerRow = Math.floor(bodyWidth / offsetX);
    setScreenShareDatas(before => {
      const newScreenSharedData = [...before];
      newScreenSharedData.forEach((data, idx) => {
        const rowCnt = Math.floor(idx / columnsPerRow);
        const colCnt = idx % columnsPerRow;
        data.posX = colCnt * offsetX;
        data.posY = rowCnt * offsetY;
        data.forceUpdateCnt = data.forceUpdateCnt + 1;
      });
      return newScreenSharedData;
    });
  };
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
            <a role="button" onClick={sortSharedScreenOnClick}>
              공유화면 정렬
            </a>
          </Menu.Item>
          <Menu.Item key="3">
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
                onClick={e => {
                  e.preventDefault();
                  setIsVisible(false);
                }}
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
      <div className="rndContainer">
        {screenShareDatas.map(screenShareData => {
          return (
            <ScreenViewer
              key={screenShareData.peerId}
              nickname={props.getNickNameFromSocketID(screenShareData.peerId)}
              mySocketID={props.socketID}
              sharedSocketID={screenShareData.peerId}
              stream={screenShareData.stream}
              strokeColor={color}
              lineWidth={lineWidth}
              drawHelper={screenShareData.drawHelper}
              posX={screenShareData.posX}
              posY={screenShareData.posY}
              forceUpdateCnt={screenShareData.forceUpdateCnt}
              setOtherSideDraw={props.setOtherSideDraw}
              setOtherSideDrawStartPos={props.setOtherSideDrawStartPos}
              setOtherSideClear={props.setOtherSideClear}
            ></ScreenViewer>
          );
        })}
      </div>
      <Dropdown
        overlay={screenshare}
        trigger={['click']}
        visible={isVisible}
        onVisibleChange={setIsVisible}
      >
        <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
          <DesktopOutlined className="navbar_button" />
        </a>
      </Dropdown>
    </>
  );
}

export default ScreenShare;
