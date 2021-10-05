import React, {useEffect, useRef, useState} from 'react';
import {Formant} from '../utils/ImageMetaData';

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
  const [isShow, setIsShow] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const resetClick = () => {
    props.setVowels([]);
  };
  const doneClick = () => {
    console.log(props.smad);
    props.setVowels([...props.smad]);
  };
  const showClick = () => {
    setIsShow(!isShow);
  };
  // useEffect(() => {
  //   if (canvasRef.current && isShow) {
  //     const canvas = canvasRef.current;
  //     const ctx = canvas.getContext('2d');
  //     if (!ctx) return;
  //     const animationCb = () => {
  //       formants.forEach(value => {
  //         if (value.label === props.vowel) {
  //           value.array.forEach((val, idx) => {
  //             ctx.beginPath();
  //             ctx.moveTo(idx, canvas.clientHeight);
  //             ctx.lineTo(idx, canvas.clientHeight - val);
  //             ctx.stroke();
  //           });
  //         }
  //       });
  //       requestAnimationFrame(animationCb);
  //     };
  //     requestAnimationFrame(animationCb);
  //   }
  // });

  return (
    <>
      {isShow ? (
        <canvas
          style={{border: '1px solid black', zIndex: 20}}
          width={500}
          height={190}
          ref={canvasRef}
        ></canvas>
      ) : null}
      <div>
        {props.vowel}
        <button onClick={resetClick}>reset</button>
        <button onClick={doneClick}>done</button>
        <button onClick={showClick}>show</button>
      </div>
    </>
  );
}
let lastImage: HTMLImageElement | null = null;

interface VowelDetectProps {
  onClick: () => void;
}

function VowelDetect(props: VowelDetectProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smad: number[] = [];

  const onClick = () => {
    console.log(formants);
    if (localStorage.getItem('formants') === null) {
      // 세팅 창을 띄운다.
      // const frequencyDomains: any[] = [];
      // formants.forEach(formant => {
      //   frequencyDomains.push(formants);
      // });
      localStorage.setItem('formants', JSON.stringify(formants));
      console.log('no localStorage data!!');
    } else {
      const tmp = localStorage.getItem('formants');
      if (tmp === null) return;
      const parsedFormants = JSON.parse(tmp);
      formants.forEach((content, index) => {
        content = parsedFormants[index];
      });
    }
    props.onClick();
  };

  formants.forEach(value => {
    value.Image = new Image();
    value.Image.src = `./assets/vowel/${value.label}.png`;
  });

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
            lastImage = candidates[0].image;
          } else {
            ctx.fillText('None', 550, 50);
          }
          if (lastImage && candidates[0].distPercent > 0.3) {
            ctx.drawImage(lastImage, 300, 0);
          }
          requestAnimationFrame(callback);
        };
        requestAnimationFrame(callback);
      })
      .catch(error => console.log(error));
  }, []);

  return (
    <div className="vowel-detect">
      {formants.map((value, idx) => {
        const setVowels = (arg0: number[]) => {
          formants[idx].array = arg0;
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
      <canvas
        style={{border: '1px solid black', zIndex: 20}}
        width={400}
        height={300}
        ref={canvasRef}
      ></canvas>
      <button onClick={onClick}>확인</button>
    </div>
  );
}

function VowelDetectButton(): JSX.Element {
  const [voiceDetectSettingOn, setVoiceSettingOn] = useState(false);
  useEffect(() => {
    if (localStorage.getItem('formants') === null) setVoiceSettingOn(true);
  }, []);
  const onVowelDetectClick = () => {
    setVoiceSettingOn(!voiceDetectSettingOn);
  };
  return (
    <>
      <button onClick={onVowelDetectClick}>x</button>
      {voiceDetectSettingOn === true ? (
        <VowelDetect onClick={onVowelDetectClick} />
      ) : null}
    </>
  );
}

export default VowelDetectButton;
