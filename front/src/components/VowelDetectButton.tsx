import {Popover} from 'antd';
import React, {useEffect, useRef} from 'react';
import {Formant} from '../../utils/ImageMetaData';
import './vowelDetect.css';
import {SmileOutlined} from '@ant-design/icons';

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

const formants: Formant[] = [
  {
    label: 'A',
    array: [],
    Image: null,
  },
  {
    label: 'I',
    array: [],
    Image: null,
  },
  {
    label: 'U',
    array: [],
    Image: null,
  },
  {
    label: 'E',
    array: [],
    Image: null,
  },
  {
    label: 'O',
    array: [],
    Image: null,
  },
];

interface VowelInputProps {
  vowel: string;
  setVowels: (arg0: number[]) => void;
  smad: number[];
}

function VowelInput(props: VowelInputProps) {
  const doneClick = () => {
    console.log(props.smad);
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

function VowelDetect(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smad: number[] = [];

  const saveVowelDataToBrowser = () => {
    localStorage.setItem('formants', JSON.stringify(formants));
  };

  const loadVowelDataFromBrowserIfExist = () => {
    const tmp = localStorage.getItem('formants');
    if (tmp === null) return;
    const parsedFormants = JSON.parse(tmp);
    formants.forEach((content, index) => {
      content = parsedFormants[index];
    });
  };

  formants.forEach(value => {
    value.Image = new Image();
    value.Image.src = `./assets/spaceMain/vowel_avatar/${value.label}.png`;
  });

  useEffect(() => {
    loadVowelDataFromBrowserIfExist();
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');

    const canvas = canvasRef.current;
    if (!ctx) return;

    navigator.mediaDevices
      .getUserMedia({audio: true, video: false})
      .then(stream => {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        source.connect(analyser);
        console.log(audioContext.sampleRate);
        analyser.smoothingTimeConstant = 0.6;
        analyser.fftSize = 2048; //
        const byteFrequencyDataArray = new Uint8Array(
          analyser.frequencyBinCount / 3,
        );

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

          const candidates = formants.map(value => {
            let vowelsSelfDist = 0;
            const dot = value.array.reduce((acc, cur, idx) => {
              vowelsSelfDist += cur * cur;
              return acc + cur * smad[idx];
            }, 0);
            const smadSelfDist = smad.reduce((acc, cur) => {
              return acc + cur * cur;
            }, 0);
            const similarity =
              dot / (Math.sqrt(vowelsSelfDist) * Math.sqrt(smadSelfDist));
            return {
              vowel: value.label,
              similarity: similarity,
              image: value.Image,
              distPercent: smadSelfDist / vowelsSelfDist,
            };
          });

          candidates.sort((a, b) => b.similarity - a.similarity);
          ctx.font = '24px selif';
          if (
            candidates[0].similarity > 0.9 &&
            candidates[0].distPercent > 0.5
          ) {
            ctx.fillText(
              `${(candidates[0].similarity * 100).toFixed(1)}% "${
                candidates[0].vowel
              }" p : ${candidates[0].distPercent.toFixed(1)}`,
              550,
              50,
            );
          } else {
            ctx.fillText('None', 550, 50);
          }
          requestAnimationFrame(callback);
        };
        requestAnimationFrame(callback);
      })
      .catch(error => console.log(error));
  }, []);

  return (
    <div id="vowel-detect">
      <div className="vowel-explain">
        다음 모음을 발음하며 저장 버튼을 누르세요.
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
          width="310px"
          height="160px"
          className="vowel-wave-canvas"
          ref={canvasRef}
        ></canvas>
      </div>
    </div>
  );
}

function VowelDetectButton(): JSX.Element {
  return (
    <>
      <Popover trigger={['click']} content={<VowelDetect></VowelDetect>}>
        <SmileOutlined className="navbar_button" />
      </Popover>
    </>
  );
}

export default VowelDetectButton;
