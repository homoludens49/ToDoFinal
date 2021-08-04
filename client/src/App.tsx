import React, { FC, ChangeEvent, useState, useEffect } from "react";
import "./App.css";
import TodoTask from "./Components/TodoTask";
import { ITask } from "./interfaces";
import { IMessage } from "./messageInterface";
import { io } from "socket.io-client";
import axios from "axios";

let socket: any;
// const URL = "https://todoassignmentpjotrssakovs.herokuapp.com";
const URL = "http://localhost:1337";

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
  const [hide, setHide] = useState<boolean>(false);
  const [todoList, setTodoList] = useState<ITask[]>([]);

  useEffect(() => {
    getTasks();
  }, []);
  const getTasks = async () => {
    //const res = await axios.get("https://todoassignmentpjotrssakovs.herokuapp.com/tasks");
    const res = await axios.get("http://localhost:1337/tasks");
    setTodoList(res.data);
  };

  useEffect(() => {
    socket.on("display_todo", (data: ITask) => {
      setTodoList([...todoList, data]);
    });
  });
  useEffect(() => {
    socket.on("display_updatedTodo", (data: ITask[]) => {
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
    //await axios.post("https://todoassignmentpjotrssakovs.herokuapp.com/tasks", newTask);
    await axios.post("http://localhost:1337/tasks", newTask);
    await socket.emit("create_todo", newTask, room);
    setTask("");
    setDeadline(0);
  };

  const editTask = async (taskNameToEdit: string) => {
    console.log(taskNameToEdit);
    // await axios.delete(`https://todoassignmentpjotrssakovs.herokuapp.com/tasks/${taskNameToEdit}`);
    // setTodoList(todoList.filter((task) => task.taskName != taskNameToEdit));
    //this is
  };

  const completeTask = (task: ITask) => {
    const updatedArray = [...todoList];
    for (let i in updatedArray) {
      if (updatedArray[i].taskName === task.taskName) {
        updatedArray[i].complete = !updatedArray[i].complete;
        // axios.put(
        //   `https://todoassignmentpjotrssakovs.herokuapp.com/tasks/${updatedArray[i].taskName}`,
        //   updatedArray[i]
        // );
        axios.put(
          `http://localhost:1337/tasks/${updatedArray[i].taskName}`,
          updatedArray[i]
        );
        socket.emit("update_todo", updatedArray, room);
        return setTodoList(updatedArray);
      }
    }
  };

  const deleteTask = (task: ITask) => {
    const updatedArray = todoList.filter((ts) => ts.taskName !== task.taskName);
    //axios.delete(`https://todoassignmentpjotrssakovs.herokuapp.com/tasks/${task.taskName}`);
    axios.delete(`http://localhost:1337/tasks/${task.taskName}`);
    socket.emit("update_todo", updatedArray, room);
    setTodoList(updatedArray);
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
                id={val.name === name ? "You" : "Other"}
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
        <button onClick={() => setHide(!hide)}>Hide completed Tasks</button>
        {todoList
          .sort(function (a, b) {
            let keyA = a.complete;
            let keyB = b.complete;
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
          })
          .map((task: ITask, key: number) => {
            return (
              <TodoTask
                key={key}
                task={task}
                hide={hide}
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
