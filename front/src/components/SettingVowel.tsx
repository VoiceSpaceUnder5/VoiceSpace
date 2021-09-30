import React from 'react'

interface SettingVowelProps {
	smad: number[] = [];
}

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

export default function SettingVowel(props: SettingVowelProps) {
	navigator.mediaDevices
	  .getUserMedia({ audio: true, video: false })
	  .then((stream) => {
		const audioContext = new AudioContext();
		const source = audioContext.createMediaStreamSource(stream);
		const analyser = audioContext.createAnalyser();
		source.connect(analyser);
		console.log(audioContext.sampleRate);
		analyser.smoothingTimeConstant = 0.6;
		analyser.fftSize = 2048; //
		const byteFrequencyDataArray = new Uint8Array(
		  analyser.frequencyBinCount / 3
		);

		const callback = () => {
		  analyser.getByteFrequencyData(byteFrequencyDataArray);

		  const sma = getMonvingAverage(16);
		  props.smad.length = 0;
		  byteFrequencyDataArray.forEach((value) => {
			props.smad.push(sma(value));
		  });

		  props.smad.forEach((value, idx) => {
			ctx.beginPath();
			ctx.moveTo(idx, canvas.clientHeight);
			ctx.lineTo(idx, canvas.clientHeight - value);
			ctx.stroke();
		  });

		  const candidates = formants.map((value) => {
			let vowelsSelfDist = 0;
			const dot = value.array.reduce((acc, cur, idx) => {
			  vowelsSelfDist += cur * cur;
			  return acc + cur * props.smad[idx];
			}, 0);
			const smadSelfDist = props.smad.reduce((acc, cur) => {
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
		  ctx.font = "24px selif";
		  if (
			candidates[0].similarity > 0.9 &&
			candidates[0].distPercent > 0.5
		  ) {
			ctx.fillText(
			  `${(candidates[0].similarity * 100).toFixed(1)}% "${
				candidates[0].vowel
			  }" p : ${candidates[0].distPercent.toFixed(1)}`,
			  550,
			  50
			);
			lastImage = candidates[0].image;
		  } else {
			ctx.fillText("None", 550, 50);
		  }
		  if (lastImage && candidates[0].distPercent > 0.3) {
			ctx.drawImage(lastImage, 300, 0);
		  }
		  requestAnimationFrame(callback);
		};
		requestAnimationFrame(callback);
	  })
	  .catch((error) => console.log(error));
  }, []);
}