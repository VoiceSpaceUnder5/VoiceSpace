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
}

class GLHelper {
  gl: WebGLRenderingContext;
  applyMatrixLocation: WebGLUniformLocation | null;
  projectionWidth: number;
  projectionHeight: number;
  camera: DrawInfo;

  constructor(
    gl: WebGLRenderingContext,
    projectionWidth: number,
    projectionHeight: number,
    camera: DrawInfo
  ) {
    this.gl = gl;
    this.applyMatrixLocation = null;
    this.projectionWidth = projectionWidth;
    this.projectionHeight = projectionHeight;
    this.camera = camera;
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

  drawImage(drawImageInfo: DrawInfo) {
    this.gl.bindTexture(this.gl.TEXTURE_2D, drawImageInfo.tex);

    let projectionMat = m3.projection(
      this.projectionWidth,
      this.projectionHeight
    );

    let cameraMat = m3.identity();
    cameraMat = m3.identity();
    cameraMat = m3.translate(
      cameraMat,
      this.camera.centerPosX - this.camera.width / 2,
      this.camera.centerPosY - this.camera.height / 2
    ); // 2d 이동
    cameraMat = m3.scale(
      cameraMat,
      1 / this.camera.scale,
      1 / this.camera.scale
    );
    cameraMat = m3.inverse(cameraMat);

    let imageMat = m3.identity();
    imageMat = m3.translate(
      imageMat,
      drawImageInfo.centerPosX - drawImageInfo.width / 2,
      drawImageInfo.centerPosY - drawImageInfo.height / 2
    ); // 2d 이동
    imageMat = m3.translate(
      imageMat,
      drawImageInfo.width / 2,
      drawImageInfo.height / 2
    );
    imageMat = m3.rotate(imageMat, drawImageInfo.rotateRadian); // rotate
    imageMat = m3.translate(
      imageMat,
      -drawImageInfo.width / 2,
      -drawImageInfo.height / 2
    );
    imageMat = m3.scale(imageMat, drawImageInfo.scale, drawImageInfo.scale);
    imageMat = m3.scale(imageMat, drawImageInfo.width, drawImageInfo.height); // 원래 크기로 스케일

    this.gl.uniformMatrix3fv(
      this.applyMatrixLocation,
      false,
      m3.multiply(m3.multiply(projectionMat, cameraMat), imageMat)
    );
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }
}

export default GLHelper;
