
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

- Super smooth animation using WebGL (reducing eye fatigue)
- Real-time voice chat with very low latency using WebRTC (reducing fatigue from delay)
- As the distance between Avatars increases, the voice volume also decreases (like realistic meeting)
- A function that analyzes the voice and changes the shape of the avatar's mouth to match the pronunciation (like realistic meeting)
- The size of the avatar's face changes according to the volume of the voice. (realistic voice visualization)
  ![gif](https://user-images.githubusercontent.com/74593890/131952354-8176e60f-da09-4b66-9d6a-1356eb40a7d6.gif)

### you can try it right [**here**](https://giggleforest.com)

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

### 문서
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

| Name     | Email                                       | Role | Major Part                    | Minor Part | Tech Stack                                   |
| -------- | ------------------------------------------- | ---- | ----------------------------- | ---------- | -------------------------------------------- |
| kilee    | [gnsdlrl@daum.net](mailto:gnsdlrl@daum.net) | Leader | Design, project deployment and management | Front      | AWS, Github Action, CI/CD, React, Typescript |
| honlee   | kij753@naver.com                            | member | Front                         | Back       | AWS, React, NestJS, Typescript               |
| hyeonkim | hyongtiii@gmail.com                         | member | Back                          | Front      | React, NestJS, Typescript                    |
| mijeong  | minje70@naver.com                           | member | Front                         | Back       | React, NestJS, Typescript                    |

