import React, { FC, ChangeEvent, useState, useEffect } from "react";
import "./App.css";
import TodoTask from "./Components/TodoTask";
import { ITask } from "./interfaces";
import { IMessage } from "./messageInterface";
import { io } from "socket.io-client";
import axios from "axios";

let socket: any;
const URL = "http://localhost:5000";

let connectionOptions: any = {
  transports: ["websocket"],
};

const App: FC = () => {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [room, setRoom] = useState<number>(0);

  useEffect(() => {
    socket = io(URL, connectionOptions);
  }, [URL]);

  const logIn = (): void => {
    setLoggedIn(!loggedIn);
    socket.emit("join_room", room);
  };

  //
  const [message, setMessage] = useState<string>("");
  const [messageList, setMessageList] = useState<IMessage[]>([]);

  useEffect(() => {
    socket.on("receive_message", (data: IMessage) => {
      setMessageList([...messageList, data]);
    });
  });

  //Todo
  const [task, setTask] = useState<string>("");
  const [deadline, setDeadline] = useState<number>(0);
  const [todoList, setTodoList] = useState<ITask[]>([]);

  useEffect(() => {
    getTasks();
  }, []);
  const getTasks = async () => {
    const res = await axios.get("http://localhost:5000/tasks");
    setTodoList(res.data);
  };

  useEffect(() => {
    socket.on("display_todo", (data: ITask) => {
      setTodoList([...todoList, data]);
    });
  });
  useEffect(() => {
    socket.on("display_updatedTodo", (data:ITask[]) => {
      setTodoList(data);
    });
  });
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    event.target.name === "task"
      ? setTask(event.target.value)
      : event.target.name === "name"
      ? setName(event.target.value)
      : setDeadline(Number(event.target.value));
  };

  const sendMessage = async () => {
    const messageContent = {
      room: room,
      content: {
        name: name,
        message: message,
      },
    };
    await socket.emit("send_message", messageContent);
    setMessageList([...messageList, messageContent.content]);
    setMessage("");
  };

  const addTask = async () => {
    const newTask = {
      user: name,
      taskName: task,
      deadline: deadline,
      complete: false,
      date: new Date(),
    };
    setTodoList([...todoList, newTask]);
    await axios.post("http://localhost:5000/tasks", newTask);
    await socket.emit("create_todo", newTask, room);
    setTask("");
    setDeadline(0);
  };

  const editTask = async (taskNameToEdit: string) => {
    console.log(taskNameToEdit);
    // await axios.delete(`http://localhost:5000/tasks/${taskNameToEdit}`);
    // setTodoList(todoList.filter((task) => task.taskName != taskNameToEdit));
  };

  const completeTask = (task: ITask) => {
    const updatedArray = [...todoList];
    for (let i in updatedArray) {
      if (updatedArray[i].taskName == task.taskName) {
        updatedArray[i].complete = !updatedArray[i].complete;
        axios.put(`http://localhost:5000/tasks/${updatedArray[i].taskName}`, updatedArray[i])
        socket.emit("update_todo",updatedArray, room);
        return setTodoList(updatedArray);
      }   
    }
  };

  console.log(todoList);

  const deleteTask = async (taskNameToDelete: string) => {
    await axios.delete(`http://localhost:5000/tasks/${taskNameToDelete}`);
    setTodoList(todoList.filter((task) => task.taskName != taskNameToDelete));
  };

  return (
    <div className="App">
      <div className="header">
        {!loggedIn ? (
          <div className="logIn">
            <input
              type="text"
              placeholder="Your name..."
              name="name"
              value={name}
              onChange={handleChange}
            ></input>
            <button onClick={logIn}> Enter </button>
          </div>
        ) : (
          <div className="header">
            <div className="inputContainer">
              <input
                type="text"
                placeholder="Task..."
                name="task"
                value={task}
                onChange={handleChange}
              ></input>
              <input
                type="number"
                placeholder="Deadline (in Days)..."
                name="deadline"
                value={deadline}
                onChange={handleChange}
              ></input>
            </div>
            <button onClick={addTask}>Add Task</button>
          </div>
        )}
      </div>
      <div className="chatContainer">
        <div className="messages">
          {messageList.map((val, key) => {
            return (
              <div
                className="messageContainer"
                id={val.name == name ? "You" : "Other"}
              >
                <div className="individualMessage">
                  {val.name}: {val.message}
                </div>
              </div>
            );
          })}
        </div>
        <div className="messageInputs">
          <input
            type="text"
            placeholder="Message..."
            onChange={(e) => setMessage(e.target.value)}
          ></input>
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
      <div className="todoList">
        {todoList.map((task: ITask, key: number) => {
          return (
            <TodoTask
              key={key}
              task={task}
              deleteTask={deleteTask}
              completeTask={completeTask}
              editTask={editTask}
            />
          );
        })}
      </div>
    </div>
  );
};

export default App;
