import ImageInfoProvider from './ImageInfoProvider';
import {Size, ImageInfo, AvatarPartImageEnum} from './ImageMetaData';
import {IPlayer} from './RTCGameUtils';
import {Vec2} from './RTCGameUtils';
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
	uniform float u_transparency;

	void main() {
	// 	if (v_texcoord.x < 0.0 ||
	// 		v_texcoord.y < 0.0 ||
	// 		v_texcoord.x > 1.0 ||
	// 		v_texcoord.y > 1.0) {
	// 	  discard;
	// 	}
		if (texture2D(u_texture, v_texcoord).a > 0.0) {
			gl_FragColor = vec4(texture2D(u_texture, v_texcoord).rgb, u_transparency);
		} else {
			gl_FragColor = texture2D(u_texture, v_texcoord);
		}
	}
`;

export const resizeCanvasToDisplaySize = (
  canvas: HTMLCanvasElement,
): boolean => {
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
): WebGLProgram | undefined => {
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

export const isInRect = (
  rectCenterPos: Vec2,
  rectSize: Size,
  pointPos: Vec2,
): boolean => {
  if (
    pointPos.x >= rectCenterPos.x - rectSize.width / 2 &&
    pointPos.x <= rectCenterPos.x + rectSize.width / 2 &&
    pointPos.y >= rectCenterPos.y - rectSize.height / 2 &&
    pointPos.y <= rectCenterPos.y + rectSize.height / 2
  )
    return true;
  return false;
};

// export interface ImageInfo {
// 	centerPosPixelOffset: Vec2;
// 	tex: WebGLTexture;
// 	size: Size;
// 	centerPos: Vec2;
//   }
export interface DrawInfo extends ImageInfo {
  scale: number;
  rotateRadian: number;
}

export class Camera {
  size: Size;
  originSize: Size;
  centerPos: Vec2;
  scale: number;
  readonly limitSize: Size;
  constructor(size: Size, centerPos: Vec2, limitSize: Size) {
    this.size = size;
    this.originSize = {...size};
    this.centerPos = centerPos;
    this.scale = 1;
    this.limitSize = limitSize;
  }

  upScaleByPinch(value: number): void {
    const oldScale = this.scale;
    const oldSize = {...this.size};

    this.scale = value;
    this.size.width = this.originSize.width / this.scale;
    this.size.height = this.originSize.height / this.scale;
    if (
      this.centerPos.x + this.size.width / 2 > this.limitSize.width ||
      this.centerPos.x < this.size.width / 2 ||
      this.centerPos.y + this.size.height / 2 > this.limitSize.height ||
      this.centerPos.y < this.size.height / 2
    ) {
      this.scale = oldScale;
      this.size = {...oldSize};
    }
  }

  upScaleByKeyBoard(value: number): void {
    const oldScale = this.scale;
    const oldSize = {...this.size};

    this.scale += value;
    this.size.width = this.originSize.width / this.scale;
    this.size.height = this.originSize.height / this.scale;
    if (
      this.centerPos.x + this.size.width / 2 > this.limitSize.width ||
      this.centerPos.x < this.size.width / 2 ||
      this.centerPos.y + this.size.height / 2 > this.limitSize.height ||
      this.centerPos.y < this.size.height / 2
    ) {
      this.scale = oldScale;
      this.size = {...oldSize};
    }
  }

  updateCenterPosFromPlayer(player: IPlayer): void {
    const oldCenterPos = {...this.centerPos};
    this.centerPos = {...player.centerPos};
    if (
      this.centerPos.x < this.size.width / 2 ||
      this.centerPos.x + this.size.width / 2 > this.limitSize.width
    ) {
      this.centerPos.x = oldCenterPos.x;
    }
    if (
      this.centerPos.y < this.size.height / 2 ||
      this.centerPos.y + this.size.height / 2 > this.limitSize.height
    ) {
      this.centerPos.y = oldCenterPos.y;
    }
  }
}

class GLHelper {
  gl: WebGLRenderingContext;
  applyShapeMatrixLocation: WebGLUniformLocation | null;
  applyTransparencyLocation: WebGLUniformLocation | null;
  camera: Camera;

  //value
  divHeightOffsetY: number;
  volumeDivideValue: number;
  SpeakThrashHold: number;
  SpeakMouseThrashHold: number;

  //Matrix, value for draw
  projectionMatrix: number[];
  cameraMatrix: number[];
  imageMatrix: number[];
  transparency: number;

  constructor(gl: WebGLRenderingContext, camera: Camera) {
    this.gl = gl;
    this.applyShapeMatrixLocation = null;
    this.applyTransparencyLocation = null;
    this.camera = camera;
    //value
    this.divHeightOffsetY = -20;
    this.volumeDivideValue = 250;
    this.SpeakThrashHold = 30;
    this.SpeakMouseThrashHold = 50;
    //Matrix, value for draw
    this.projectionMatrix = [];
    this.cameraMatrix = [];
    this.imageMatrix = [];
    this.transparency = 1.0;

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

    const shapeMatrixLocation = gl.getUniformLocation(program, 'u_matrix');
    if (!shapeMatrixLocation) {
      console.error('getUniformLocation u_matrix Error');
      return;
    }
    this.applyShapeMatrixLocation = shapeMatrixLocation;

    const transparencyLocation = gl.getUniformLocation(
      program,
      'u_transparency',
    );
    if (!transparencyLocation) {
      console.error('getUniformLocation u_transparencyLocation Error');
      return;
    }
    this.applyTransparencyLocation = transparencyLocation;
  }

  getWorldPositionFromScreenPosition(screenPos: Vec2): Vec2 {
    return {
      x:
        this.camera.centerPos.x +
        (screenPos.x - this.camera.originSize.width / 2) / this.camera.scale,
      y:
        this.camera.centerPos.y +
        (screenPos.y - this.camera.originSize.height / 2) / this.camera.scale,
    };
  }

  getMy4VertexWorldPosition(
    imageInfoProvider: ImageInfoProvider,
    me: IPlayer,
    scale = 1,
  ): Vec2[] {
    const result: Vec2[] = [];

    const originVertex = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ];
    const imageinfo = imageInfoProvider.getAvatarImageInfo(
      me.avatar,
      AvatarPartImageEnum.FACE_MUTE,
    );
    if (!imageinfo) {
      return [];
    }
    this.updateImageMatrixFromDrawInfo({
      ...imageinfo,
      scale: scale,
      rotateRadian: me.rotateRadian,
      centerPos: me.centerPos,
    });

    originVertex.forEach(arr => {
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

  updateProjectionMatrix(): void {
    this.projectionMatrix = m3.projection(
      this.camera.originSize.width,
      this.camera.originSize.height,
    );
  }

  updateCameraMatrix(): void {
    this.cameraMatrix = m3.identity();
    this.cameraMatrix = m3.translate(
      this.cameraMatrix,
      this.camera.centerPos.x - this.camera.size.width / 2,
      this.camera.centerPos.y - this.camera.size.height / 2,
    ); // 2d 이동
    this.cameraMatrix = m3.scale(
      this.cameraMatrix,
      1 / this.camera.scale,
      1 / this.camera.scale,
    );
    this.cameraMatrix = m3.inverse(this.cameraMatrix);
  }

  updateImageMatrixFromDrawInfo(drawImageInfo: DrawInfo): void {
    this.imageMatrix = m3.identity();
    this.imageMatrix = m3.translate(
      this.imageMatrix,
      drawImageInfo.centerPos.x - drawImageInfo.size.width / 2,
      drawImageInfo.centerPos.y - drawImageInfo.size.height / 2,
    ); // 2d 이동
    this.imageMatrix = m3.translate(
      this.imageMatrix,
      drawImageInfo.size.width / 2,
      drawImageInfo.size.height / 2,
    );

    this.imageMatrix = m3.rotate(this.imageMatrix, drawImageInfo.rotateRadian); // rotate
    this.imageMatrix = m3.translate(
      this.imageMatrix,
      drawImageInfo.centerPosPixelOffset.x,
      drawImageInfo.centerPosPixelOffset.y,
    );

    this.imageMatrix = m3.scale(
      this.imageMatrix,
      drawImageInfo.scale,
      drawImageInfo.scale,
    ); // 중앙점을 기준으로 스케일값 만큼 스케일

    this.imageMatrix = m3.translate(
      this.imageMatrix,
      -drawImageInfo.size.width / 2,
      -drawImageInfo.size.height / 2,
    );
    this.imageMatrix = m3.scale(
      this.imageMatrix,
      drawImageInfo.size.width,
      drawImageInfo.size.height,
    ); // 원래 크기로 스케일
  }

  drawArray(tex: WebGLTexture): void {
    this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
    this.gl.uniformMatrix3fv(
      this.applyShapeMatrixLocation,
      false,
      m3.multiply(
        m3.multiply(this.projectionMatrix, this.cameraMatrix),
        this.imageMatrix,
      ),
    );
    this.gl.uniform1f(this.applyTransparencyLocation, this.transparency);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }

  drawImage(drawImageInfo: DrawInfo): void {
    this.updateProjectionMatrix();
    this.updateCameraMatrix();
    this.updateImageMatrixFromDrawInfo(drawImageInfo);
    this.drawArray(drawImageInfo.tex);
  }

  makeAvatarImageInfoFromImageInfoProviderAndPlayer(
    imageInfoProvider: ImageInfoProvider,
    avatarPart: AvatarPartImageEnum,
    player: IPlayer,
    isFace = true,
  ): DrawInfo | undefined {
    const imageInfo = imageInfoProvider.getAvatarImageInfo(
      player.avatar,
      avatarPart,
    );
    if (!imageInfo) {
      console.error(
        'cannot find imageInfo in makeAvatarImageInfoFromImageInfoProviderAndPlayer',
        player,
      );
      return;
    }
    return {
      ...imageInfo,
      scale: isFace ? 1 + player.volume / this.volumeDivideValue : 1,
      rotateRadian: player.rotateRadian,
      centerPos: player.centerPos,
    };
  }

  drawAvatar(
    imageInfoProvider: ImageInfoProvider,
    player: IPlayer,
    div: HTMLDivElement,
  ): void {
    const divSize = {...this.camera.size};
    let faceIdx = AvatarPartImageEnum.FACE_MUTE; // Mute 얼굴

    if (this.SpeakThrashHold < player.volume) {
      faceIdx = AvatarPartImageEnum.FACE_SPEAK; // 말하는 얼굴
      if (this.SpeakMouseThrashHold < player.volume)
        faceIdx = AvatarPartImageEnum.FACE_SPEAK_MOUSE;
    }
    const drawIdxs = [AvatarPartImageEnum.BODY, faceIdx]; // 0은 몸통
    drawIdxs.forEach(partEnum => {
      const drawInfo = this.makeAvatarImageInfoFromImageInfoProviderAndPlayer(
        imageInfoProvider,
        partEnum,
        player,
        partEnum === faceIdx,
      );
      if (!drawInfo) return;
      this.drawImage(drawInfo);
      const temp = [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
      ];

      const multipiedMat = m3.multiply(
        this.projectionMatrix,
        m3.multiply(this.cameraMatrix, this.imageMatrix),
      );

      for (let j = 0; j < temp.length; j++) {
        const clipspace = m3.transformPoint(multipiedMat, temp[j]);
        const pixelY =
          (clipspace[1] * -0.5 + 0.5) * this.camera.originSize.height;
        divSize.height = Math.min(divSize.height, pixelY);
      }

      const clipspace = m3.transformPoint(multipiedMat, [0.5, 0.5]);
      const pixelX = (clipspace[0] * 0.5 + 0.5) * this.camera.originSize.width;
      divSize.width = pixelX;
    });
    if (divSize.height + this.divHeightOffsetY < 0)
      divSize.height = -this.divHeightOffsetY;
    if (divSize.height > this.camera.originSize.height)
      divSize.height = this.camera.originSize.height - div.clientHeight;
    if (divSize.width - div.clientWidth / 2 < 0)
      divSize.width = div.clientWidth / 2;
    if (divSize.width + div.clientWidth / 2 > this.camera.originSize.width)
      divSize.width = this.camera.originSize.width - div.clientWidth / 2;

    div.style.left = Math.floor(divSize.width) - div.clientWidth / 2 + 'px';
    div.style.top = Math.floor(divSize.height) + this.divHeightOffsetY + 'px';
  }
}

export default GLHelper;
