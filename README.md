
## ![img](https://user-images.githubusercontent.com/35288028/131969010-2f6197cc-2bd6-409e-b1f7-f23ccb77881a.png) Giggle Forest (project.VoiceSpace) by Team - under5

### Development Goals

As we go through the COVID-19, most of the 'meeting places' are rapidly moving to various virtual conference spaces started from Zoom. As such, there are many side effects, A typical example is Zoom Fatigue, which causes a lot of fatigue in virtual conferences than usual conversations. We think the main causes of that are

1. video
2. Rigid video conferencing space
   Accordingly, we started to development this service with the purpose of creating a service that provides a **video-free**, **realistic conversation**, and a **soft and enjoyable space**.

---

### Introduction Video (with Korean language)

## [![YoutubeVideo](https://img.youtube.com/vi/ufxFfA7_ntU/maxresdefault.jpg)](https://youtu.be/ufxFfA7_ntU)

### Demo Website Link
Under construction of demo website.
- url : ~~https://giggleforest.com~~
- you can try it right ~~[**here**](https://giggleforest.com)~~

---

### Development and deployment environment

| Part                       | Environment | Remark(Version) |
| -------------------------- | ----------- | --------------- |
| FrontEnd                   | React       | 17.0.2          |
| BackEnd                    | NestJS      | 7.6.15          |
| WebServer                  | Nginx       | 1.14.2          |
| Publishing Server Hardware | AWS         | EC2             |

---

### Main library

| Name          | Remark                                                                              |
| ------------- | ----------------------------------------------------------------------------------- |
| WebRTC        | Seamless voice and data transmission between users                                  |
| WebGL(PixiJS) | Outputs animation instead of video, using the client's graphics processing hardware |
| WebAudioAPI   | Voice analysis and control for realizing realistic conversations without video      |
| Jest          | Unit and Integration Test of implemented components and classes                     |

---

### System diagram

#### Overall system configuration

- Peer-to-peer connection using WebRTC is the most important part.
- Audio streams are exchanged through this P2P connection, and avatar-related data is also continuously transmitted to each other.
- Therefore, when a user connects for the first time, the P2P connection is established using the back signaling server.
- As the connection is completed, the transmitted audio stream is continuously played, and animation is drawn every frame using WebGL through the transmitted avatar information.
  ![image](https://user-images.githubusercontent.com/74593890/139775166-f036b4c0-1584-4ecd-9444-5a1788fec82c.png)

#### Multiple peer connection architecture

- So we aim for a project that anyone can service on their own server, that a number of P2P connections were established in **Full Mesh** in order to minimize the role of the back server.
- If we launch this service, the architecture may be restructured using **SFU**.
<img src="https://www.itrelease.com/wp-content/uploads/2021/06/Full-Mesh-Topology-1024x640.jpg" width="600" height="400">

#### Page Infomation
1. Home Page
<img src="https://user-images.githubusercontent.com/74593890/140017019-76c02218-0044-498d-a08e-10981f3b3ef5.png" width="200"> 

|                        |  | 
| --------------- | -----------  |
| Component Path  | [/front/src/pages/homePage/Home.tsx](https://github.com/VoiceSpaceUnder5/VoiceSpace/blob/master/front/src/pages/homePage/Home.tsx)                |
| URL| /               |
| Role                  | Route to SettingComponent (/setting) with random or specific(input) roomId               |
| Remark | **자세히 알아보세요** is connected with this github page                   |
---
2. Setting Page
<img src="https://user-images.githubusercontent.com/74593890/140028049-f3f2217f-ec49-40fe-ad9e-058d97e0c0ab.png" width="200"> 

|                        |  | 
| --------------- | -----------  |
| Component Path  | [/front/src/pages/settingPage/Setting.tsx](https://github.com/VoiceSpaceUnder5/VoiceSpace/blob/master/front/src/pages/settingPage/Setting.tsx)                |
| URL| /setting               |
| Role                  | Select mic, speaker device and avatar information (nickname and avatarImage) and route to SpaceComponent with selected values               |
| Remark | Only Chrome browser is fully supported                   |

---

3. Space Page
<img src="https://user-images.githubusercontent.com/74593890/140028152-07059817-a7b0-44be-bdc3-03a1093f623d.png" width="200"> 

|                        |  | 
| --------------- | -----------  |
| Component Path  | [/front/src/pages/spacePage/Space.tsx](https://github.com/VoiceSpaceUnder5/VoiceSpace/blob/master/front/src/pages/spacePage/Space.tsx)                |
| URL| /space               |
| Role                  | - Draw map and avatars using [pixiUtils](https://github.com/VoiceSpaceUnder5/VoiceSpace/tree/master/front/src/utils/pixiUtils) <br/> - Establish P2P connection and transfer avatar data using [Peer](https://voicespaceunder5.github.io/VoiceSpaceDocs/docs/classes/utils_RTCGameUtils.Peer.html), [PeerManager](https://voicespaceunder5.github.io/VoiceSpaceDocs/docs/classes/utils_RTCGameUtils.default.html) <br/> - Analyze voice for lip sync using [AudioAnalyer](https://voicespaceunder5.github.io/VoiceSpaceDocs/docs/classes/utils_RTCGameUtils.AudioAnalyser.html) <br/> - Control all of settings (with [Navigation Component](https://github.com/VoiceSpaceUnder5/VoiceSpace/blob/master/front/src/components/Navigation.tsx)               |
| Remark | - If you want to customize world map, see [World.ts](https://github.com/VoiceSpaceUnder5/VoiceSpace/blob/master/front/src/utils/pixiUtils/World.ts) and [world1.json](https://github.com/VoiceSpaceUnder5/VoiceSpace/blob/master/front/src/utils/pixiUtils/metaData/world1.json) <br/> - If you want to add some special stuff (like Youtube sign), see [Stuff.ts](https://github.com/VoiceSpaceUnder5/VoiceSpace/blob/master/front/src/utils/pixiUtils/Stuff.ts) <br/> - If you want to Improve lip sync logic, see [AudioAnalyer](https://voicespaceunder5.github.io/VoiceSpaceDocs/docs/classes/utils_RTCGameUtils.AudioAnalyser.html) <br/> - If you want to develop your own signaling server, see [RTCSignalingHelper.ts](https://github.com/VoiceSpaceUnder5/VoiceSpace/blob/master/front/src/utils/RTCSignalingHelper.ts) <br/> - If you want to add stun/turn server, see [IceServerList.ts](https://github.com/VoiceSpaceUnder5/VoiceSpace/blob/master/front/src/utils/IceServerList.ts)                   |

---

### Main function

- Smooth animation using WebGL in a outstanding level (reducing eye fatigue)
- Real-time voice chat with very low latency using WebRTC (reducing fatigue from delay)
- The more a distance between avatars increases, the more voice volume also decreases (like realistic meeting)
- A function that analyzes the voice and changes the shape of the avatar's mouth to match the pronunciation (like realistic meeting)
- The size of the avatar's face changes according to the volume of the voice. (realistic voice visualization)
- ![gif](https://user-images.githubusercontent.com/68804133/139776993-f7d43f8f-adab-426d-a89d-3af94902d6e6.gif)

### you can try it ~~[**right here**](https://giggleforest.com)~~

---

### Main features being added (Advancement)

- map customization

---

### Start project

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

- You can change the backend address in **.env.development** in the front folder.

---

### Deploy the project

#### Front

1. npm run build (in front folder) The value of (.env.production) applies.
2. Serve the build folder output from the above script as root (our team used nginx)

#### Back

1. npm run build (in back folder) (In this case, if you want to set it to https, please change the contents of main.ts (see comments))
2. Execute main.js in the dist folder as the output of the above script as NodeJS.

---

### Document

- Information on various components, classes, and functions can be found [here](https://voicespaceunder5.github.io/VoiceSpaceDocs/docs/).

---

### Test

#### In front folder

- unit test

```
npm run test
```

- unit test with coverage report

```
npm run testCover
```

- The current master's coverage report can be viewed [here](https://voicespaceunder5.github.io/VoiceSpaceDocs/coverage/)

---

### License

- [MIT](https://github.com/VoiceSpaceUnder5/VoiceSpace/blob/master/LICENSE)

---

### Team Information

| Name     | Email                                       | Role   | Major Part                                | Minor Part | Tech Stack                                   |
| -------- | ------------------------------------------- | ------ | ----------------------------------------- | ---------- | -------------------------------------------- |
| kilee    | [gnsdlrl@daum.net](mailto:gnsdlrl@daum.net) | Leader | Design, project deployment and management | Front      | AWS, Github Action, CI/CD, React, Typescript |
| honlee   | kij753@naver.com                            | member | Front                                     | Back       | AWS, React, NestJS, Typescript               |
| hyeonkim | hyongtiii@gmail.com                         | member | Back                                      | Front      | React, NestJS, Typescript                    |
| mijeong  | minje70@naver.com                           | member | Front                                     | Back       | React, NestJS, Typescript                    |
