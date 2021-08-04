const express = require("express");
const socket = require("socket.io");
const app = express();
const cors = require("cors");
const connectDB = require("./config/db");
connectDB();

app.use(
  cors({
    //origin: "https://competent-yalow-725f0b.netlify.app/",
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

//Routes
app.use("/tasks", require("./api/routes/tasks"));

const port = process.env.PORT || 1337;
const server = app.listen(port, () => console.log(`listening on ${port}`));

const io = socket(server);

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User joined Room: ${data}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data.content);
  });

  socket.on("create_todo", (data, room) => {
    socket.to(room).emit("display_todo", data);
  });
  socket.on("update_todo", (data, room) => {
    console.log(data, room);
    socket.to(room).emit("display_updatedTodo", data);
  });

  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED");
  });
});
