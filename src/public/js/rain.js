// import {postMemo} from './api/memo.js'
// const {postMemo} = import("./api/memo.js");

const socket = io("https://elandland.site");


const myFace = document.querySelector("#myFace");
const muteBtn = document.querySelector("#mute");
const muteIcon = muteBtn.querySelector(".muteIcon");
const unMuteIcon = muteBtn.querySelector(".unMuteIcon");
const cameraBtn = document.querySelector("#camera");
const cameraIcon = cameraBtn.querySelector(".cameraIcon");
const unCameraIcon = cameraBtn.querySelector(".unCameraIcon");
const camerasSelect = document.querySelector("#cameras");

const call = document.querySelector("#call");
const welcome = document.querySelector("#welcome");

const HIDDEN_CN = "hidden";

let myStream;
let muted = true;
unMuteIcon.classList.add(HIDDEN_CN);
let cameraOff = false;
unCameraIcon.classList.add(HIDDEN_CN);
let roomName = "";
let nickname = "";
let peopleInRoom = 1;




let pcObj = {
  // remoteSocketId: pc
};

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks();
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;

      if (currentCamera.label == camera.label) {
        option.selected = true;
      }

      camerasSelect.appendChild(option);
    });
  } catch (error) {
    console.log(error);
  }
}

async function getMedia(deviceId) {
  const initialConstraints = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };

  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstraints
    );

    myFace.srcObject = myStream;
    myFace.muted = true;

    if (!deviceId) {
      myStream.getAudioTracks().forEach((track) => (track.enabled = false));
      await getCameras();
    }
  } catch (error) {
    console.log(error);
  }
}

function handleMuteClick() {
  myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
  if (muted) {
    unMuteIcon.classList.remove(HIDDEN_CN);
    muteIcon.classList.add(HIDDEN_CN);
    muted = false;
  } else {
    muteIcon.classList.remove(HIDDEN_CN);
    unMuteIcon.classList.add(HIDDEN_CN);
    muted = true;
  }
}

function handleCameraClick() {
  myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraIcon.classList.remove(HIDDEN_CN);
    unCameraIcon.classList.add(HIDDEN_CN);
    cameraOff = false;
  } else {
    unCameraIcon.classList.remove(HIDDEN_CN);
    cameraIcon.classList.add(HIDDEN_CN);
    cameraOff = true;
  }
}

async function handleCameraChange() {
  try {
    await getMedia(camerasSelect.value);
    if (peerConnectionObjArr.length > 0) {
      const newVideoTrack = myStream.getVideoTracks()[0];
      peerConnectionObjArr.forEach((peerConnectionObj) => {
        const peerConnection = peerConnectionObj.connection;
        const peerVideoSender = peerConnection
          .getSenders()
          .find((sender) => sender.track.kind == "video");
        peerVideoSender.replaceTrack(newVideoTrack);
      });
    }
  } catch (error) {
    console.log(error);
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Screen Sharing

let captureStream = null;

async function startCapture() {
  try {
    captureStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    const screenVideo = document.querySelector("#screen");
    screenVideo.srcObject = captureStream;
  } catch (error) {
    console.error(error);
  }
}

// Welcome Form (choose room)

call.classList.add(HIDDEN_CN);

const welcomeForm = welcome.querySelector("form");

async function initCall() {
  console.log("initCall");
  welcome.hidden = true;
  call.classList.remove(HIDDEN_CN);
  await getMedia();
}

async function handleWelcomeSubmit(event) {
  event.preventDefault();
  console.log("handleWelcomeSubmit");
  if (socket.disconnected) {
    socket.connect();
  }

  const welcomeRoomName = welcomeForm.querySelector("#roomName");
  const welcomeNickname = welcomeForm.querySelector("#nickname");
  const nicknameContainer = document.querySelector("#userNickname");
  roomName = welcomeRoomName.value;
  welcomeRoomName.value = "";
  nickname = welcomeNickname.value;
  welcomeNickname.value = "";
  nicknameContainer.innerText = nickname;
  socket.emit("join_room", roomName, nickname);
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Chat Form

const chatForm = document.querySelector("#chatForm");
const chatBox = document.querySelector("#chatBox");

const MYCHAT_CN = "myChat";
const NOTICE_CN = "noticeChat";

chatForm.addEventListener("submit", handleChatSubmit);

function handleChatSubmit(event) {
  console.log("handleCahtSubmit");
  event.preventDefault();
  const chatInput = chatForm.querySelector("input");
  const message = chatInput.value;
  chatInput.value = "";
  socket.emit("chat", `${nickname}: ${message}`, roomName);
  writeChat(`${message}`, MYCHAT_CN);
}

function writeChat(message, className = null) {
  console.log("writeChat");
  // postMemo("ww").then((resp)=>{
  //   console.log("suucess");
  // }).catch(err=>{
  //   console.log(`error : ${err}`)
  // })
  
  const li = document.createElement("li");
  const span = document.createElement("span");
  span.innerText = message;
  li.appendChild(span);
  li.classList.add(className);
  chatBox.prepend(li);
}

// Leave Room

const leaveBtn = document.querySelector("#leave");
const playBtn = document.querySelector("#audio")

function leaveRoom() {
  console.log("leaveRoom");
  socket.disconnect();

  call.classList.add(HIDDEN_CN);
  welcome.hidden = false;

  peerConnectionObjArr = [];
  peopleInRoom = 1;
  nickname = "";

  myStream.getTracks().forEach((track) => track.stop());
  const nicknameContainer = document.querySelector("#userNickname");
  nicknameContainer.innerText = "";

  myFace.srcObject = null;
  clearAllVideos();
  clearAllChat();
}

function audioPlay(){
  console.log("playBtn Click");
  const backgroundMusic = new Audio("../audio/sound-rain.mp3");
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.5; // 원하는 볼륨으로 설정하세요
  
  console.log("window in");
    backgroundMusic.play().then(data =>{
      console.log("data");
    }).catch(error => {
        console.error("음악을 재생하는 중 오류가 발생했습니다:", error);
    });
}
playBtn.addEventListener("click",audioPlay);

function removeVideo(leavedSocketId) {
  console.log("removeVide");
  const streams = document.querySelector("#streams");
  const streamArr = streams.querySelectorAll("div");
  streamArr.forEach((streamElement) => {
    if (streamElement.id === leavedSocketId) {
      streams.removeChild(streamElement);
    }
  });
}

function clearAllVideos() {
  console.log("clearAllVideos");
  const streams = document.querySelector("#streams");
  const streamArr = streams.querySelectorAll("div");
  streamArr.forEach((streamElement) => {
    if (streamElement.id != "myStream") {
      streams.removeChild(streamElement);
    }
  });
}

function clearAllChat() {
  console.log("clearAllChat");
  const chatArr = chatBox.querySelectorAll("li");
  chatArr.forEach((chat) => chatBox.removeChild(chat));
}

leaveBtn.addEventListener("click", leaveRoom);


// Modal code

const modal = document.querySelector(".modal");
const modalText = modal.querySelector(".modal__text");
const modalBtn = modal.querySelector(".modal__btn");

function paintModal(text) {
  console.log("paintModal");
  modalText.innerText = text;
  modal.classList.remove(HIDDEN_CN);

  modal.addEventListener("click", removeModal);
  modalBtn.addEventListener("click", removeModal);
  document.addEventListener("keydown", handleKeydown);
}

function removeModal() {
  console.log("removeModal");
  modal.classList.add(HIDDEN_CN);
  modalText.innerText = "";
}

function handleKeydown(event) {
  console.log("handleKeydown");
  if (event.code === "Escape" || event.code === "Enter") {
    removeModal();
  }
}

// Socket code

socket.on("reject_join", () => {
  paintModal("Sorry, The room is already full.");
  const nicknameContainer = document.querySelector("#userNickname");
  nicknameContainer.innerText = "";
  roomName = "";
  nickname = "";
});

socket.on("accept_join", async (userObjArr) => {
  await initCall();

  const length = userObjArr.length;
  if (length === 1) {
    return;
  }

  writeChat("알림!", NOTICE_CN);
  for (let i = 0; i < length - 1; ++i) {
    try {
      const newPC = createConnection(
        userObjArr[i].socketId,
        userObjArr[i].nickname
      );
      const offer = await newPC.createOffer();
      await newPC.setLocalDescription(offer);
      socket.emit("offer", offer, userObjArr[i].socketId, nickname);
      // writeChat(`__${userObjArr[i].nickname}__`, NOTICE_CN);
    } catch (err) {
      console.error(err);
    }
  }
  // writeChat("is in the room.", NOTICE_CN);
});

socket.on("offer", async (offer, remoteSocketId, remoteNickname) => {
  try {
    const newPC = createConnection(remoteSocketId, remoteNickname);
    await newPC.setRemoteDescription(offer);
    const answer = await newPC.createAnswer();
    await newPC.setLocalDescription(answer);
    socket.emit("answer", answer, remoteSocketId);
    // writeChat(`notice! __${remoteNickname}__ joined the room`, NOTICE_CN);
    // writeChat(`${remoteNickname}님이 입장하였습니다.`, NOTICE_CN);
  } catch (err) {
    console.error(err);
  }
});

socket.on("answer", async (answer, remoteSocketId) => {
  await pcObj[remoteSocketId].setRemoteDescription(answer);
});

socket.on("ice", async (ice, remoteSocketId) => {
  await pcObj[remoteSocketId].addIceCandidate(ice);
});

socket.on("chat", (message) => {
  writeChat(message);
});

socket.on("leave_room", (leavedSocketId, nickname) => {
  removeVideo(leavedSocketId);
  // writeChat(`notice! ${nickname} leaved the room.`, NOTICE_CN);
  // writeChat(`${nickname}님이 떠났습니다.`, NOTICE_CN);
  --peopleInRoom;
  sortStreams();
});

// RTC code

function createConnection(remoteSocketId, remoteNickname) {
  console.log("createConnection");
  const myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });
  myPeerConnection.addEventListener("icecandidate", (event) => {
    console.log("addEventListener");
    handleIce(event, remoteSocketId);
  });
  myPeerConnection.addEventListener("addstream", (event) => {
    console.log("addEventListener");
    handleAddStream(event, remoteSocketId, remoteNickname);
  });
  myStream.getTracks().forEach((track) => myPeerConnection.addTrack(track, myStream));

  pcObj[remoteSocketId] = myPeerConnection;

  ++peopleInRoom;
  sortStreams();
  return myPeerConnection;
}

function handleIce(event, remoteSocketId) {
  console.log("handleIce");
  if (event.candidate) {
    socket.emit("ice", event.candidate, remoteSocketId);
  }
}

function handleAddStream(event, remoteSocketId, remoteNickname) {
  console.log("handleAddStream");
  const peerStream = event.stream;
  paintPeerFace(peerStream, remoteSocketId, remoteNickname);
}

function paintPeerFace(peerStream, id, remoteNickname) {
  console.log("paintPeerFace");
  const streams = document.querySelector("#streams");
  const div = document.createElement("div");
  div.id = id;
  const video = document.createElement("video");
  video.autoplay = true;
  video.playsInline = true;
  video.width = "400";
  video.height = "400";
  video.srcObject = peerStream;
  const nicknameContainer = document.createElement("h3");
  nicknameContainer.id = "userNickname";
  nicknameContainer.innerText = remoteNickname;

  div.appendChild(video);
  div.appendChild(nicknameContainer);
  streams.appendChild(div);
  sortStreams();
}

function sortStreams() {
  console.log("srotStreams");
  const streams = document.querySelector("#streams");
  const streamArr = streams.querySelectorAll("div");
  streamArr.forEach((stream) => (stream.className = `people${peopleInRoom}`));
}
socket.emit("join_room", "rain", "");