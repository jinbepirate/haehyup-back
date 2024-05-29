import express from "express";
import axios from "axios";
import { Server as SocketIO } from "socket.io";
import https from "https";
import fs from "fs";
import 'regenerator-runtime/runtime';

const dotenv = require("dotenv");
const mongoose = require("mongoose");
const session = require("express-session");
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require("cors");

////////
const PORT = process.env.PORT || 4000;

dotenv.config();

// router
const usersRouter = require("./routes/api/users.js");
const themesRouter = require("./routes/api/themes.js");
const memoRouter = require("./routes/api/memo");
const studyRecordRouter = require("./routes/api/studyRecord");
// const roomsRouter = require("./routes/api/rooms");

const app = express();


app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(process.cwd() + "/src/public"));
app.use(cors()); //모든 접근 허용

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  }
));

/////////////////

dotenv.config(); 

mongoose
  .connect(
    process.env.MONGO_URI
  )
  .then(() => console.log("Connected Successful"))
  .catch(err => console.log(err));



/////////////////
app.use("/public", express.static(process.cwd() + "/src/public"));
app.use("/api/themes", themesRouter);

app.use("/api/studyRecord", studyRecordRouter);
// app.use("/api/rooms", roomsRouter);

////
app.use('/users', usersRouter);
app.use('/memo',memoRouter);
////

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/*", (req, res) => {
  res.redirect("/");
});

//kakao login
// const KAKAO_REST_API_KEY = 
// const KAKAO_REDIRECT_URI = 

// SSL 인증서와 키 파일을 읽어옵니다.
const privateKey = fs.readFileSync("./private.pem", "utf8");
const certificate = fs.readFileSync("./public.pem", "utf8");
const credentials = { key: privateKey, cert: certificate };



const httpsServer = https.createServer(credentials, app);
const wsServer = new SocketIO(httpsServer, {
  cors: {
    origin: "https://172.16.1.84:4000",  // 허용할 도메인 설정
    methods: ["GET", "POST"],
    credentials: true
  }
});


// kakao login
// app.get('/oauth/callback/kakao', async (req, res) => {
//   const { code } = req.query;

//   try {
//     const tokenResponse = await axios.post(
//       'https://kauth.kakao.com/oauth/token',
//       {},
//       {
//         params: {
//           grant_type: 'authorization_code',
//           client_id: KAKAO_REST_API_KEY,
//           redirect_uri: KAKAO_REDIRECT_URI,
//           code
//         },
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded'
//         }
//       }
//     );

//     const { access_token } = tokenResponse.data;

//     const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
//       headers: {
//         Authorization: `Bearer ${access_token}`
//       }
//     });

//     const userData = userResponse.data;
//     res.json(userData);

//   } catch (error) {
//     console.error('Error fetching Kakao token or user data:', error);
//     res.status(500).json({ error: 'Failed to fetch Kakao token or user data' });
//   }
// });

let roomObjArr = [];
const MAXIMUM = 5;

wsServer.on("connection", (socket) => {
  let myRoomName = null;
  let myNickname = null;

  socket.on("join_room", (roomName, nickname) => {
    myRoomName = roomName;
    myNickname = nickname;

    let isRoomExist = false;
    let targetRoomObj = null;

    for (let i = 0; i < roomObjArr.length; ++i) {
      if (roomObjArr[i].roomName === roomName) {
        if (roomObjArr[i].currentNum >= MAXIMUM) {
          socket.emit("reject_join");
          return;
        }

        isRoomExist = true;
        targetRoomObj = roomObjArr[i];
        break;
      }
    }

    if (!isRoomExist) {
      targetRoomObj = {
        roomName,
        currentNum: 0,
        users: [],
      };
      roomObjArr.push(targetRoomObj);
    }

    targetRoomObj.users.push({
      socketId: socket.id,
      nickname,
    });
    ++targetRoomObj.currentNum;

    socket.join(roomName);
    socket.emit("accept_join", targetRoomObj.users);
  });

  socket.on("offer", (offer, remoteSocketId, localNickname) => {
    socket.to(remoteSocketId).emit("offer", offer, socket.id, localNickname);
  });

  socket.on("answer", (answer, remoteSocketId) => {
    socket.to(remoteSocketId).emit("answer", answer, socket.id);
  });

  socket.on("ice", (ice, remoteSocketId) => {
    socket.to(remoteSocketId).emit("ice", ice, socket.id);
  });

  socket.on("chat", (message, roomName) => {
    socket.to(roomName).emit("chat", message);
  });

  socket.on("disconnecting", () => {
    socket.to(myRoomName).emit("leave_room", socket.id, myNickname);

    let isRoomEmpty = false;
    for (let i = 0; i < roomObjArr.length; ++i) {
      if (roomObjArr[i].roomName === myRoomName) {
        const newUsers = roomObjArr[i].users.filter(
          (user) => user.socketId != socket.id
        );
        roomObjArr[i].users = newUsers;
        --roomObjArr[i].currentNum;

        if (roomObjArr[i].currentNum == 0) {
          isRoomEmpty = true;
        }
      }
    }

    if (isRoomEmpty) {
      const newRoomObjArr = roomObjArr.filter(
        (roomObj) => roomObj.currentNum != 0
      );
      roomObjArr = newRoomObjArr;
    }
  });
});

const handleListen = () =>
  console.log(`✅ Listening on https://172.16.1.84:${PORT}`);
httpsServer.listen(PORT, handleListen);