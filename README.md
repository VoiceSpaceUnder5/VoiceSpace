
## ![img](https://user-images.githubusercontent.com/35288028/131969010-2f6197cc-2bd6-409e-b1f7-f23ccb77881a.png) Giggle Forest (project.VoiceSpace) by Team - under5

### Development Purpose

As we go through the COVID-19, most of the 'meeting places' are rapidly moving to various video conferencing spaces started from Zoom. As such, there are many side effects, A typical example is Zoom Fatigue, which causes a lot of fatigue in video conferences than usual conversations. We think that main causes of this fatigue are

1. video
2. Rigid video conferencing space

Accordingly, we started development with the purpose of creating a service that provides a **video-free**, **realistic conversation**, and a **soft and enjoyable space**.

---

### Introduction Video (with Korean language)

[![YoutubeVideo](https://img.youtube.com/vi/Tdtk7nvgxqo/maxresdefault.jpg)](https://youtu.be/Tdtk7nvgxqo)

---

### Demo Website Link
- address : https://giggleforest.com 
- you can try it right [**here**](https://giggleforest.com)

---


### Development and deployment environment

| Part                       | Environment | Remark(Version) |
| -------------------------- | ----------- | --------------- |
| Front                      | React       | 17.0.2          |
| Back                       | NestJS      | 7.6.15          |
| WebServer                  | Nginx       | 1.14.2          |
| Publishing Server Hardware | AWS         | EC2             |

---

### Main library

| Name        | Remark                                                                        |
| ----------- | ----------------------------------------------------------------------------- |
| WebRTC      | Seamless voice and data transmission between users
| WebGL(PixiJS)      | Outputs animation instead of video, using the client's graphics processing hardware |
| WebAudioAPI | Voice analysis and control for realizing realistic conversations without video
| Jest        | Unit and Integration Test of implemented components and classes                           |

---

### System diagram

#### Overall system configuration
- Peer-to-peer connection using WebRTC is the most important part.
- Audio streams are exchanged through this p2p connection, and avatar-related data is also continuously transmitted to each other.
- Therefore, when a user connects for the first time, the p2p connection is established using the back signaling server.
- After that, when the connection is completed, the transmitted audio stream is continuously played, and animation is drawn every frame with webGL technology through the transmitted avatar information.

![image](https://user-images.githubusercontent.com/74593890/131950983-cf735bf4-3a74-4074-bf3d-1bf79e3fc6cd.png)

#### Multiple peer connection architecture
- Because we aim for a project that anyone can service on their own server, In order to minimize the role of the back server, a number of p2p connections were established in **Full Mesh**.
- If we start service, probably architecture will be changed to **SFU** 
![Advantages and disadvantages of mesh topology - IT Release](https://www.itrelease.com/wp-content/uploads/2021/06/Full-Mesh-Topology-1024x640.jpg)

---

### Main function

- WebGL 을 이용한 굉장히 부드러운 애니메이션 (눈의 피로감 감소)
- WebRTC 를 이용한 현실과 같은 매우 낮은 레이턴시의 음성채팅 (딜레이로부터 오는 피로감 감소)
- Avatar 끼리의 거리가 멀어질수록, 음성 볼륨도 낮아지는 기능 (현실감 있는 음성 채팅)
- 목소리 크기에 따라 아바타의 얼굴 크기가 변함 (현실감 있는 음성 시각화)
  ![gif](https://user-images.githubusercontent.com/74593890/131952354-8176e60f-da09-4b66-9d6a-1356eb40a7d6.gif)

### [**여기**](https://giggleforest.com)에서 바로 체험해보실 수 있습니다.

---

### 주요 추가중인 기능 (고도화)

- 음성을 분석하여 해당 발음에 맞게 아바타의 입모양이 바뀌는 기능 (현실감 있는 음성 채팅)
- 아바타들이 움직이는 맵을 커스터마이징 하는 기능

---

### 프로젝트 시작하기

in back folder

```
npm install
npm run start:dev
```

in front folder

```
npm install
npm run start
```

- front 폴더의 .env.development 에서 백엔드 주소를 변경 하실 수 있습니다.

---

### 프로젝트 배포하기

#### Front

1. npm run build (in front folder) (.env.production) 의 값이 적용됩니다.
2. 위 스크립트의 아웃풋으로 나온 build 폴더를 root 로 하여 serve (저희팀은 nginx 를 사용하였습니다.)

#### Back

1. npm run build (in back folder) (이때 만약 https 로 설정하시길 원하신다면 main.ts 의 내용을 바꿔주세요 (주석참조))
2. 위 스크립트의 아웃풋으로 나온 dist 폴더의 main.js 를 nodeJS 로 실행하세요.

---

### 문서

- 각종 Component, Class, Function 정보는 [여기](https://voicespaceunder5.github.io/VoiceSpaceDocs/docs/)에서 확인 하실 수 있습니다.

---

### 테스트

#### front 폴더에서
- unit test
```
npm run test
```

- unit test with coverage report
```
npm run testCover
```

- 현재 master 의 커버리지 레포트는 [여기](https://voicespaceunder5.github.io/VoiceSpaceDocs/coverage/)에서 보실 수 있습니다.

---

### 라이센스

- [MIT](https://github.com/VoiceSpaceUnder5/VoiceSpace/blob/master/LICENSE)

---

### 팀원

| Name     | Email                                       | Role | Major Part                    | Minor Part | Tech Stack                                   |
| -------- | ------------------------------------------- | ---- | ----------------------------- | ---------- | -------------------------------------------- |
| kilee    | [gnsdlrl@daum.net](mailto:gnsdlrl@daum.net) | 팀장 | 디자인, 프로젝트 배포 및 관리 | Front      | AWS, Github Action, CI/CD, React, Typescript |
| honlee   | kij753@naver.com                            | 팀원 | Front                         | Back       | AWS, React, NestJS, Typescript               |
| hyeonkim | hyongtiii@gmail.com                         | 팀원 | Back                          | Front      | React, NestJS, Typescript                    |
| mijeong  | minje70@naver.com                           | 팀원 | Front                         | Back       | React, NestJS, Typescript                    |


