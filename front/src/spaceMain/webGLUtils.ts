import ImageInfoProvider, {ImageInfo, ImageInfoEnum} from './ImageInfos';
import {IPlayer} from './RTCGameUtils';

const m3 = require('m3.js');

const vs = `
	attribute vec2 a_texcoord;
	varying vec2 v_texcoord;

	attribute vec2 a_position;
	uniform mat3 u_matrix;
	void main() {
	  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
	  //gl_Position = vec4( (vec3(a_position, 1).xy * u_matrix), 0, 1);
	  v_texcoord = a_texcoord;
	}
`;

const fs = `
	precision mediump float;
	varying vec2 v_texcoord;
	uniform sampler2D u_texture;

	void main() {
	// 	if (v_texcoord.x < 0.0 ||
	// 		v_texcoord.y < 0.0 ||
	// 		v_texcoord.x > 1.0 ||
	// 		v_texcoord.y > 1.0) {
	// 	  discard;
	// 	}
	    gl_FragColor = texture2D(u_texture, v_texcoord);
	}
`;

export const resizeCanvasToDisplaySize = (canvas: HTMLCanvasElement) => {
  // 브라우저가 캔버스를 표시하고 있는 크기를 CSS 픽셀 단위로 얻어옵니다.
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  // 캔버스와 크기가 다른지 확인합니다.
  const needResize =
    canvas.width !== displayWidth || canvas.height !== displayHeight;

  if (needResize) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
  return needResize;
};

const createShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) => {
  const shader = gl.createShader(type);
  if (!shader) {
    console.error(`createShader Error : ${source}`);
    return;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
};

export const createProgramFromSource = (
  gl: WebGLRenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string,
) => {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  );
  if (!vertexShader || !fragmentShader) return;
  return createProgram(gl, vertexShader, fragmentShader);
};

const createProgram = (
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
) => {
  const program = gl.createProgram();
  if (!program) {
    console.error('createProgram error');
    return;
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) return program;
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
};

const setAttributeData = (
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  attributeName: string,
  data: Float32Array,
) => {
  const loc = gl.getAttribLocation(program, attributeName);
  if (loc < 0) {
    console.error(`getAttribLocation error : ${attributeName}`);
    return;
  }
  // position buffer 생성, 연결, 데이터 전송, attribute 에 전송
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
};

export interface DrawInfo {
  tex: WebGLTexture | null;
  width: number;
  height: number;
  centerPosX: number;
  centerPosY: number;
  scale: number;
  rotateRadian: number;
  centerPositionPixelOffsetX: number;
  centerPositionPixelOffsetY: number;
}

export class Camera implements DrawInfo {
  tex: WebGLTexture | null;
  width: number;
  height: number;
  centerPosX: number;
  centerPosY: number;
  scale: number;
  rotateRadian: number;
  centerPositionPixelOffsetX: number;
  centerPositionPixelOffsetY: number;
  background: ImageInfo;
  originWidth: number;
  originHeight: number;
  constructor(
    width: number,
    height: number,
    centerPosX: number,
    centerPosY: number,
    scale: number,
    rotateRadian: number,
    background: ImageInfo,
  ) {
    this.tex = null;
    this.width = width;
    this.height = height;
    this.centerPosX = centerPosX;
    this.centerPosY = centerPosY;
    this.centerPositionPixelOffsetX = 0;
    this.centerPositionPixelOffsetY = 0;
    this.scale = scale;
    this.rotateRadian = rotateRadian;
    this.background = background;
    this.originWidth = width;
    this.originHeight = height;
  }

  upScale(value: number) {
    const oldScale = this.scale;
    const oldWidth = this.width;
    const oldHeight = this.height;

    this.scale += value;
    this.width = this.originWidth / this.scale;
    this.height = this.originHeight / this.scale;
    if (
      this.centerPosX + this.width / 2 > this.background.width ||
      this.centerPosX < this.width / 2 ||
      this.centerPosY + this.height / 2 > this.background.height ||
      this.centerPosY < this.height / 2
    ) {
      this.scale = oldScale;
      this.width = oldWidth;
      this.height = oldHeight;
    }
  }

  updateCenterPosFromPlayer(player: IPlayer) {
    const oldCenterPosX = this.centerPosX;
    const oldCenterPosY = this.centerPosY;
    this.centerPosX = player.centerPos.x;
    this.centerPosY = player.centerPos.y;
    if (
      this.centerPosX < this.width / 2 ||
      this.centerPosX + this.width / 2 > this.background.width
    ) {
      this.centerPosX = oldCenterPosX;
    }
    if (
      this.centerPosY < this.height / 2 ||
      this.centerPosY + this.height / 2 > this.background.height
    ) {
      this.centerPosY = oldCenterPosY;
    }
  }
}

class GLHelper {
  gl: WebGLRenderingContext;
  applyMatrixLocation: WebGLUniformLocation | null;
  projectionWidth: number;
  projectionHeight: number;
  camera: DrawInfo;

  //value
  divHeightOffsetY: number;
  volumeDivideValue: number;
  SpeakThrashHold: number;
  SpeakMouseThrashHold: number;

  constructor(
    gl: WebGLRenderingContext,
    projectionWidth: number,
    projectionHeight: number,
    camera: DrawInfo,
  ) {
    this.gl = gl;
    this.applyMatrixLocation = null;
    this.projectionWidth = projectionWidth;
    this.projectionHeight = projectionHeight;
    this.camera = camera;
    //value
    this.divHeightOffsetY = -20;
    this.volumeDivideValue = 250;
    this.SpeakThrashHold = 30;
    this.SpeakMouseThrashHold = 50;
    //
    const program = createProgramFromSource(this.gl, vs, fs);
    if (!program) {
      return;
    }
    gl.useProgram(program);
    // for png
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    const dataArray = [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1];
    setAttributeData(gl, program, 'a_position', new Float32Array(dataArray));
    setAttributeData(gl, program, 'a_texcoord', new Float32Array(dataArray));

    const matrixLocation = gl.getUniformLocation(program, 'u_matrix');
    if (!matrixLocation) {
      console.error('getUniformLocation u_matrix Error');
      return;
    }
    this.applyMatrixLocation = matrixLocation;
  }

  drawImage(drawImageInfo: DrawInfo) {
    this.gl.bindTexture(this.gl.TEXTURE_2D, drawImageInfo.tex);

    let projectionMat = m3.projection(
      this.projectionWidth,
      this.projectionHeight,
    );

    let cameraMat = m3.identity();
    cameraMat = m3.identity();
    cameraMat = m3.translate(
      cameraMat,
      this.camera.centerPosX - this.camera.width / 2,
      this.camera.centerPosY - this.camera.height / 2,
    ); // 2d 이동
    cameraMat = m3.scale(
      cameraMat,
      1 / this.camera.scale,
      1 / this.camera.scale,
    );
    cameraMat = m3.inverse(cameraMat);

    let imageMat = m3.identity();
    imageMat = m3.translate(
      imageMat,
      drawImageInfo.centerPosX - drawImageInfo.width / 2,
      drawImageInfo.centerPosY - drawImageInfo.height / 2,
    ); // 2d 이동
    imageMat = m3.translate(
      imageMat,
      drawImageInfo.width / 2,
      drawImageInfo.height / 2,
    );

    imageMat = m3.rotate(imageMat, drawImageInfo.rotateRadian); // rotate
    imageMat = m3.translate(
      imageMat,
      drawImageInfo.centerPositionPixelOffsetX,
      drawImageInfo.centerPositionPixelOffsetY,
    );

    imageMat = m3.scale(imageMat, drawImageInfo.scale, drawImageInfo.scale); // 중앙점을 기준으로 스케일값 만큼 스케일

    imageMat = m3.translate(
      imageMat,
      -drawImageInfo.width / 2,
      -drawImageInfo.height / 2,
    );
    imageMat = m3.scale(imageMat, drawImageInfo.width, drawImageInfo.height); // 원래 크기로 스케일

    this.gl.uniformMatrix3fv(
      this.applyMatrixLocation,
      false,
      m3.multiply(m3.multiply(projectionMat, cameraMat), imageMat),
    );
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }

  drawAnimal(
    imageInfoProvider: ImageInfoProvider,
    player: IPlayer,
    div: HTMLDivElement,
  ) {
    let divWidth = this.projectionWidth;
    let divHeight = this.projectionHeight;
    let faceIdx = 1; // Mute 얼굴

    if (this.SpeakThrashHold < player.volume) {
      faceIdx = 2; // 말하는 얼굴
      if (this.SpeakMouseThrashHold < player.volume) faceIdx = 3;
    }
    const drawIdxs = [0, faceIdx]; // 0은 몸통
    drawIdxs.forEach(i => {
      // tail part start
      this.gl.bindTexture(
        this.gl.TEXTURE_2D,
        imageInfoProvider.animals[player.idx].imageInfos[i].tex,
      );

      let projectionMat = m3.projection(
        this.projectionWidth,
        this.projectionHeight,
      );

      let cameraMat = m3.identity();
      cameraMat = m3.translate(
        cameraMat,
        this.camera.centerPosX - this.camera.width / 2,
        this.camera.centerPosY - this.camera.height / 2,
      ); // 2d 이동
      cameraMat = m3.scale(
        cameraMat,
        1 / this.camera.scale,
        1 / this.camera.scale,
      );
      cameraMat = m3.inverse(cameraMat);

      // 위치에 맞게 동물 이동 및 회전
      let imageMat = m3.identity();
      imageMat = m3.translate(
        imageMat,
        player.centerPos.x -
          imageInfoProvider.animals[player.idx].imageInfos[i].width / 2,
        player.centerPos.y -
          imageInfoProvider.animals[player.idx].imageInfos[i].height / 2,
      ); // 2d 이동
      imageMat = m3.translate(
        imageMat,
        imageInfoProvider.animals[player.idx].imageInfos[i].width / 2,
        imageInfoProvider.animals[player.idx].imageInfos[i].height / 2,
      );

      imageMat = m3.rotate(imageMat, player.rotateRadian); // rotate
      imageMat = m3.translate(
        imageMat,
        imageInfoProvider.animals[player.idx].imageInfos[i]
          .centerPositionPixelOffsetX,
        imageInfoProvider.animals[player.idx].imageInfos[i]
          .centerPositionPixelOffsetY,
      );

      // 얼굴이면 볼륨 반영
      if (i === faceIdx) {
        imageMat = m3.scale(
          imageMat,
          1 + player.volume / 200,
          1 + player.volume / 200,
        ); // 중앙점을 기준으로 스케일값 만큼 스케일
      }

      imageMat = m3.translate(
        imageMat,
        -imageInfoProvider.animals[player.idx].imageInfos[i].width / 2,
        -imageInfoProvider.animals[player.idx].imageInfos[i].height / 2,
      );
      imageMat = m3.scale(
        imageMat,
        imageInfoProvider.animals[player.idx].imageInfos[i].width,
        imageInfoProvider.animals[player.idx].imageInfos[i].height,
      ); // 원래 크기로 스케일

      const multipiedMat = m3.multiply(
        m3.multiply(projectionMat, cameraMat),
        imageMat,
      );

      this.gl.uniformMatrix3fv(this.applyMatrixLocation, false, multipiedMat);
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

      const temp = [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
      ];
      for (let j = 0; j < temp.length; j++) {
        const clipspace = m3.transformPoint(multipiedMat, temp[j]);
        const pixelY = (clipspace[1] * -0.5 + 0.5) * this.projectionHeight;
        divHeight = Math.min(divHeight, pixelY);
      }

      const clipspace = m3.transformPoint(multipiedMat, [0.5, 0.5]);
      const pixelX = (clipspace[0] * 0.5 + 0.5) * this.projectionWidth;
      divWidth = pixelX;
    });
    if (divHeight + this.divHeightOffsetY < 0)
      divHeight = -this.divHeightOffsetY;
    if (divHeight > this.projectionHeight)
      divHeight = this.projectionHeight - div.clientHeight;
    if (divWidth - div.clientWidth / 2 < 0) divWidth = div.clientWidth / 2;
    if (divWidth + div.clientWidth / 2 > this.projectionWidth)
      divWidth = this.projectionWidth - div.clientWidth / 2;

    div.style.left = Math.floor(divWidth) - div.clientWidth / 2 + 'px';
    div.style.top = Math.floor(divHeight) + this.divHeightOffsetY + 'px';
  }
}

export default GLHelper;
