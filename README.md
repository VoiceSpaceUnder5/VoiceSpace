## [파비콘이미지] Giggle Forest (project.VoiceSpace) by Team - under5

### 개발 목적

코로나 시대를 겪으면서 대부분의 '만남의 장소'가 각종 Zoom에서 파생된 각종 화상회의 공간으로 빠르게 이동 하고 있습니다. 그런 만큼 부작용도 많은데 대표적으로 화상회의 에서 평소의 대화보다 훨씬 많은 피로도를 느끼는 [줌피로도 (Zoom Fatigue)](https://en.wikipedia.org/wiki/Zoom_fatigue)증상이 대두 되고 있습니다. 이러한 피로의 주요 원인을 저희는

1. 영상
2. 딱딱한 화상회의 공간

라고 분석하였고, 이에 따라 **영상없는, 현실감 있는 대화**,**부드럽고 즐거운 공간**을 제공하는 서비스를 만들려는 목적으로 개발을 시작하였습니다.

---

### 소개 동영상

<iframe width="560" height="315" src="https://www.youtube.com/embed/ZcalOaRKCv8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

### 개발 및 배포 환경

| Part                       | Environment | Remark(Version) |
| -------------------------- | ----------- | --------------- |
| Front                      | React       | 17.0.2          |
| Back                       | NestJS      | 7.6.15          |
| WebServer                  | Nginx       | 1.14.2          |
| Publishing Server Hardware | AWS         | EC2             |

---

### 주 사용 라이브러리

| Name        | Remark                                                                        |
| ----------- | ----------------------------------------------------------------------------- |
| WebRTC      | 유저간 끊김없는 음성, 데이터 전송                                             |
| WebGL       | 영상을 대신하는 애니메이션을 클라이언트의 그레픽처리 하드웨어를 사용하여 출력 |
| WebAudioAPI | 영상없이도 현실감있는 대화를 구현하기 위한 음성분석 및 컨트롤                 |
| Jest        | 구현된 Component들과 Class의 Unit, Integration Test                           |

---

### 시스템 구성도

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

---

### 문서

[개발 문서](https://voicespaceunder5.github.io/VoiceSpaceDocs)

---

### 팀원

| Name     | Email               | Role | Major Part                    | Minor Part | Tech Stack                                   |
| -------- | ------------------- | ---- | ----------------------------- | ---------- | -------------------------------------------- |
| kilee    | (이메일 주소)       | 팀장 | 디자인, 프로젝트 배포 및 관리 | Front      | AWS, Github Action, CI/CD, React, Typescript |
| honlee   | kij753@naver.com    | 팀원 | Front                         | Back       | AWS, React, NestJS, Typescript               |
| hyeonkim | hyongtiii@gmail.com | 팀원 | Back                          | Front      | React, NestJS, Typescript                    |
| mijeong  | minje70@naver.com   | 팀원 | Front                         | Back       | React, NestJS, Typescript                    |

---
