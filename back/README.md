## Backend signaling server starting guideline
- Our public backend was built using the NestJS framework.
- Therefore, you can refer [here](https://nestjs.com/) for issues such as distribution and code modification.
- Currently, backend is used only for signaling between front users, so you can replace it with another backend [ex) express, spring...] at any time.
- The backend address can be set in the REACT_APP_SOCKET_URL environment value in root/front/.env.production.

## WebRTC and Signaling
- We recommend that you read about WebRTC and Signaling [here](https://www.html5rocks.com/ko/tutorials/webrtc/basics/) .

## Turn Server
- Because the user-to-user connection uses WebRTC, a turn server is often required.
- If necessary, we recommend [Coturn](https://github.com/coturn/coturn) , an open source turn server.
