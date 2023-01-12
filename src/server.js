import http from "http";
// import WebSocket from "ws";
import express from "express";
import SocketIO from "socket.io";

const app = express();

app.set("view engine", "pug"); //pug로 뷰엔진설정
app.set("views", __dirname + "/views"); //express에 template 위치지정
app.use("/public", express.static(__dirname + "/public")); //유저에게 파일 공유(프론트)
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/")); //home.pug render

const handleListen = () => console.log("Listening on http://localhost:3000");
// app.listen(3000, handleListen);

const server = http.createServer(app);
const wsServer = SocketIO(server);
wsServer.on("connection", socket => {
  socket["nickname"] = "Anon";
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome", socket.nickname);    //room기능은 socket.to("others").emit("event",{data})
    socket.on("disconnecting", () => {      //고객이 접속중단, 방을 완전히 나가진않은 상태
      socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname)); //연결중단될때 메세지 보냄
    });
    socket.on("new_message", (msg, room, done) => {
      socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
      done();
    });
    socket.on("nickname", (nickname) => socket["nickname"] = nickname)
  });
});


// const wss = new WebSocket.Server({ server }); //같은포트에서 http, ws 서버사용가능 
// const sockets = [];
// wss.on("connection", (socket) => {
//   sockets.push(socket); //socket: 연결된브라우저
//   socket["nickname"] = "Anon";
//   console.log("Connected to Browser");
//   socket.on("close", () => {
//     console.log("Disconnected from the Browser");
//   });
//   socket.on("message", (message) => {   //브라우저에서 보낸 메세지받기
//     const parsed = JSON.parse(message.toString()); //브라우저에서 보낸 메세지 object 형식으로 변환하기
//     switch (parsed.type) {
//       case "new_message":
//         sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${parsed.payload}`));
//         break;
//       case "nickname":
//         socket["nickname"] = parsed.payload;
//         break;
//     }
//   });
//   socket.send("hello!!!!");
// });

server.listen(3000, handleListen);
