import {Popover} from 'antd';
import React, {useEffect, useRef, useState} from 'react';
import {Formant} from '../utils/pixiUtils/metaData/ImageMetaData';
import './vowelDetect.css';
import {SmileOutlined} from '@ant-design/icons';
import {isMobile} from '../utils/AgentCheck';

function getMonvingAverage(period: number) {
  const arr: number[] = [];
  let sum = 0;
  return (value: number) => {
    sum += value;
    arr.push(value);
    if (arr.length >= period) {
      sum -= arr[0];
      arr.shift();
    }
    if (arr.length < period / 2) return 0;
    return sum / arr.length;
  };
}

export const formants: Formant[] = [
  {
    label: 'A',
    array: [],
  },
  {
    label: 'I',
    array: [],
  },
  {
    label: 'U',
    array: [],
  },
  {
    label: 'E',
    array: [],
  },
  {
    label: 'O',
    array: [],
  },
];

interface VowelDetectButtonProps {
  stream: MediaStream;
}

interface VowelInputProps {
  vowel: string;
  setVowels: (arg0: number[]) => void;
  smad: number[];
}

function VowelInput(props: VowelInputProps) {
  const doneClick = () => {
    props.setVowels([...props.smad]);
  };

  return (
    <>
      <pre>
        {props.vowel + ' '}
        <button className="save-button" onClick={doneClick}>
          저장
        </button>
      </pre>
    </>
  );
}

const smad: number[] = [];
function VowelDetect(props: VowelDetectButtonProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const saveVowelDataToBrowser = () => {
    localStorage.setItem('formants', JSON.stringify(formants));
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');

    const canvas = canvasRef.current;
    if (!ctx) return;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(props.stream);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.smoothingTimeConstant = 0.6;
    analyser.fftSize = 2048; //
    const byteFrequencyDataArray = new Uint8Array(
      analyser.frequencyBinCount / 3,
    );

    let aniNumber = 0;
    const callback = () => {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      analyser.getByteFrequencyData(byteFrequencyDataArray);

      const sma = getMonvingAverage(16);
      smad.length = 0;
      byteFrequencyDataArray.forEach(value => {
        smad.push(sma(value));
      });

      smad.forEach((value, idx) => {
        ctx.beginPath();
        ctx.moveTo(idx, canvas.clientHeight);
        ctx.lineTo(idx, canvas.clientHeight - value);
        ctx.stroke();
      });
      aniNumber = requestAnimationFrame(callback);
    };
    aniNumber = requestAnimationFrame(callback);
    return () => {
      cancelAnimationFrame(aniNumber);
    };
  }, [props.stream]);
  let canvasSize = '250px';
  // mobile 환경 캐치
  if (isMobile()) {
    canvasSize = '130px';
  }

  return (
    <div id="vowel-detect">
      <div className="vowel-explain">
        다음 모음을 발음하며 <br />
        저장 버튼을 누르세요.
      </div>
      <div className="vowel-button-and-detect">
        <div className="vowel-button-set">
          {formants.map((value, idx) => {
            const setVowels = (arg0: number[]) => {
              formants[idx].array = arg0;
              saveVowelDataToBrowser();
            };
            return (
              <VowelInput
                key={idx}
                vowel={value.label}
                setVowels={setVowels}
                smad={smad}
              ></VowelInput>
            );
          })}
        </div>
        <canvas
          width={canvasSize}
          height="160px"
          className="vowel-wave-canvas"
          ref={canvasRef}
        ></canvas>
      </div>
    </div>
  );
}

function VowelDetectButton(props: VowelDetectButtonProps): JSX.Element {
  const [visible, setVisible] = useState(false);

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
    <>
      <Popover
        placement={'topRight'}
        visible={visible}
        onVisibleChange={setVisible}
        trigger={['click']}
        content={<VowelDetect {...props}></VowelDetect>}
      >
        <a>
          <SmileOutlined className="navbar_button" />
        </a>
      </Popover>
    </>
  );
}

export default VowelDetectButton;
