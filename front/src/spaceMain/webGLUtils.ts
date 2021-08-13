import ImageInfoProvider, { ImageInfo } from "./ImageInfos";
import { IPlayer } from "./RTCGameUtils";
import { Vec2 } from "./RTCGameUtils";

const m3 = require("m3.js");

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
  source: string
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
  fragmentShaderSource: string
) => {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );
  if (!vertexShader || !fragmentShader) return;
  return createProgram(gl, vertexShader, fragmentShader);
};

const createProgram = (
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) => {
  const program = gl.createProgram();
  if (!program) {
    console.error("createProgram error");
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
  data: Float32Array
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
    background: ImageInfo
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
  camera: Camera;

  //value
  divHeightOffsetY: number;
  volumeDivideValue: number;
  SpeakThrashHold: number;
  SpeakMouseThrashHold: number;

  //Matrix
  projectionMatrix: number[];
  cameraMatrix: number[];
  imageMatrix: number[];

  constructor(
    gl: WebGLRenderingContext,
    projectionWidth: number,
    projectionHeight: number,
    camera: Camera
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
    //Matrix
    this.projectionMatrix = [];
    this.cameraMatrix = [];
    this.imageMatrix = [];

    const program = createProgramFromSource(this.gl, vs, fs);
    if (!program) {
      return;
    }
    gl.useProgram(program);
    // for png
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    const dataArray = [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1];
    setAttributeData(gl, program, "a_position", new Float32Array(dataArray));
    setAttributeData(gl, program, "a_texcoord", new Float32Array(dataArray));

    const matrixLocation = gl.getUniformLocation(program, "u_matrix");
    if (!matrixLocation) {
      console.error("getUniformLocation u_matrix Error");
      return;
    }
    this.applyMatrixLocation = matrixLocation;
  }

  getWorldPositionFromScreenPosition(screenX: number, screenY: number): Vec2 {
    let x =
      this.camera.centerPosX +
      (screenX - this.camera.originWidth / 2) / this.camera.scale;
    let y =
      this.camera.centerPosY +
      (screenY - this.camera.originHeight / 2) / this.camera.scale;

    return {
      x: x,
      y: y,
    };
  }

  getMy4VertexWorldPosition(
    imageInfoProvider: ImageInfoProvider,
    me: IPlayer,
    scale: number = 1
  ): Vec2[] {
    const result: Vec2[] = [];

    const originVertex = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ];
    const targetImageInfo = imageInfoProvider.animals[me.idx].imageInfos[1];

    this.updateImageMatrixFromDrawInfo({
      tex: null,
      width: targetImageInfo.width,
      height: targetImageInfo.height,
      centerPosX: me.centerPos.x,
      centerPosY: me.centerPos.y,
      scale: scale,
      rotateRadian: me.rotateRadian,
      centerPositionPixelOffsetX: targetImageInfo.centerPositionPixelOffsetX,
      centerPositionPixelOffsetY: targetImageInfo.centerPositionPixelOffsetY,
    });
    originVertex.forEach((arr) => {
      const posX =
        this.imageMatrix[0] * arr[0] +
        this.imageMatrix[3] * arr[1] +
        this.imageMatrix[6];
      const posY =
        this.imageMatrix[1] * arr[0] +
        this.imageMatrix[4] * arr[1] +
        this.imageMatrix[7];
      result.push({
        x: posX,
        y: posY,
      });
    });
    return result;
  }

  updateProjectionMatrix() {
    this.projectionMatrix = m3.projection(
      this.projectionWidth,
      this.projectionHeight
    );
  }

  updateCameraMatrix() {
    this.cameraMatrix = m3.identity();
    this.cameraMatrix = m3.identity();
    this.cameraMatrix = m3.translate(
      this.cameraMatrix,
      this.camera.centerPosX - this.camera.width / 2,
      this.camera.centerPosY - this.camera.height / 2
    ); // 2d 이동
    this.cameraMatrix = m3.scale(
      this.cameraMatrix,
      1 / this.camera.scale,
      1 / this.camera.scale
    );
    this.cameraMatrix = m3.inverse(this.cameraMatrix);
  }

  updateImageMatrixFromDrawInfo(drawImageInfo: DrawInfo) {
    this.imageMatrix = m3.identity();
    this.imageMatrix = m3.translate(
      this.imageMatrix,
      drawImageInfo.centerPosX - drawImageInfo.width / 2,
      drawImageInfo.centerPosY - drawImageInfo.height / 2
    ); // 2d 이동
    this.imageMatrix = m3.translate(
      this.imageMatrix,
      drawImageInfo.width / 2,
      drawImageInfo.height / 2
    );

    this.imageMatrix = m3.rotate(this.imageMatrix, drawImageInfo.rotateRadian); // rotate
    this.imageMatrix = m3.translate(
      this.imageMatrix,
      drawImageInfo.centerPositionPixelOffsetX,
      drawImageInfo.centerPositionPixelOffsetY
    );

    this.imageMatrix = m3.scale(
      this.imageMatrix,
      drawImageInfo.scale,
      drawImageInfo.scale
    ); // 중앙점을 기준으로 스케일값 만큼 스케일

    this.imageMatrix = m3.translate(
      this.imageMatrix,
      -drawImageInfo.width / 2,
      -drawImageInfo.height / 2
    );
    this.imageMatrix = m3.scale(
      this.imageMatrix,
      drawImageInfo.width,
      drawImageInfo.height
    ); // 원래 크기로 스케일
  }

  drawArray() {
    this.gl.uniformMatrix3fv(
      this.applyMatrixLocation,
      false,
      m3.multiply(
        m3.multiply(this.projectionMatrix, this.cameraMatrix),
        this.imageMatrix
      )
    );
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }

  drawImage(drawImageInfo: DrawInfo) {
    this.gl.bindTexture(this.gl.TEXTURE_2D, drawImageInfo.tex);
    this.updateProjectionMatrix();
    this.updateCameraMatrix();
    this.updateImageMatrixFromDrawInfo(drawImageInfo);
    this.drawArray();
  }

  makeAnimalImageInfoFromImageInfoProviderAndPlayer(
    imageInfoProvider: ImageInfoProvider,
    animalPartIndex: number,
    player: IPlayer,
    isFace: boolean = true
  ): DrawInfo {
    return {
      tex:
        imageInfoProvider.animals[player.idx].imageInfos[animalPartIndex].tex,
      width:
        imageInfoProvider.animals[player.idx].imageInfos[animalPartIndex].width,
      height:
        imageInfoProvider.animals[player.idx].imageInfos[animalPartIndex]
          .height,
      centerPosX: player.centerPos.x,
      centerPosY: player.centerPos.y,
      scale: isFace ? 1 + player.volume / this.volumeDivideValue : 1,
      rotateRadian: player.rotateRadian,
      centerPositionPixelOffsetX:
        imageInfoProvider.animals[player.idx].imageInfos[animalPartIndex]
          .centerPositionPixelOffsetX,
      centerPositionPixelOffsetY:
        imageInfoProvider.animals[player.idx].imageInfos[animalPartIndex]
          .centerPositionPixelOffsetY,
    };
  }

  drawAnimal(
    imageInfoProvider: ImageInfoProvider,
    player: IPlayer,
    div: HTMLDivElement
  ) {
    let divWidth = this.projectionWidth;
    let divHeight = this.projectionHeight;
    let faceIdx = 1;

    if (this.SpeakThrashHold < player.volume) {
      faceIdx = 2;
      if (this.SpeakMouseThrashHold < player.volume) faceIdx = 3;
    }
    const drawIdxs = [0, faceIdx];
    drawIdxs.forEach((i) => {
      // tail part start
      this.gl.bindTexture(
        this.gl.TEXTURE_2D,
        imageInfoProvider.animals[player.idx].imageInfos[i].tex
      );

      this.updateProjectionMatrix();
      this.updateCameraMatrix();
      this.updateImageMatrixFromDrawInfo(
        this.makeAnimalImageInfoFromImageInfoProviderAndPlayer(
          imageInfoProvider,
          i,
          player,
          i === faceIdx
        )
      );

      this.drawArray();
      const temp = [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
      ];

      const multipiedMat = m3.multiply(
        this.projectionMatrix,
        m3.multiply(this.cameraMatrix, this.imageMatrix)
      );

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

    div.style.left = Math.floor(divWidth) - div.clientWidth / 2 + "px";
    div.style.top = Math.floor(divHeight) + this.divHeightOffsetY + "px";
  }
}

export default GLHelper;
