import React, { FC, ChangeEvent, useState, useEffect } from "react";
import "./App.css";
import TodoTask from "./Components/TodoTask";
import { ITask } from "./interfaces";

import { io } from "socket.io-client";
import axios from "axios";

//creat socket connection
let socket: any;
const URL: string = "https://todo-assignment-app.herokuapp.com";
// const URL: string = "http://localhost:1337";

const connectionOptions: object = {
  transports: ["websocket"],
};

const App: FC = () => {
  //create socket connection params
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [room] = useState<number>(0);
  //initiate socket connection
  useEffect(() => {
    socket = io(URL, connectionOptions);
  }, [URL]);
  //join room on enter name
  const logIn = (): void => {
    setLoggedIn(!loggedIn);
    socket.emit("join_room", room);
  };

  //Todo
  const [task, setTask] = useState<string>("");
  const [deadline, setDeadline] = useState<number>(0);
  const [hide, setHide] = useState<boolean>(false);
  const [todoList, setTodoList] = useState<ITask[]>([]);
  //get Todos from DB on init
  useEffect(() => {
    getTasks();
  }, []);
  //get Todos from DB on init
  const getTasks = async () => {
    const res = await axios.get(
      "https://todo-assignment-app.herokuapp.com/tasks"
    );
    // const res = await axios.get("http://localhost:1337/tasks");
    setTodoList(res.data);
  };
  //sockets to display changes in Todos
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

  //handle change of input fields
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    event.target.name === "task"
      ? setTask(event.target.value)
      : event.target.name === "name"
      ? setName(event.target.value)
      : setDeadline(Number(event.target.value));
  };

  //add Todo
  const addTask = (): void => {
    //create new ITask
    const newTask = {
      user: name,
      taskName: task,
      deadline: deadline,
      complete: false,
      date: new Date(),
    };
    setTodoList([...todoList, newTask]);
    //add todo to DB
    axios.post(
      "https://todo-assignment-app.herokuapp.com/tasks",
      newTask
    );

    //axios.post("http://localhost:1337/tasks", newTask);
    //reflect todo for others through socket
    socket.emit("create_todo", newTask, room);
    setTask("");
    setDeadline(0);
  };
  //Toogle complete task
  const completeTask = (task: ITask) => {
    const updatedArray = [...todoList];
    for (let i in updatedArray) {
      if (updatedArray[i].taskName === task.taskName) {
        updatedArray[i].complete = !updatedArray[i].complete;
        //update todo in DB
        axios.put(
          `https://todo-assignment-app.herokuapp.com/tasks/${updatedArray[i].taskName}`,
          updatedArray[i]
        );
        // axios.put(
        //   `http://localhost:1337/tasks/${updatedArray[i].taskName}`,
        //   updatedArray[i]
        // );
        //reflect todo deletion for others through socket
        socket.emit("update_todo", updatedArray, room);
        return setTodoList(updatedArray);
      }
    }
  };
  //handle task deletion
  const deleteTask = (task: ITask) => {
    //delete todo from DB
    const updatedArray = todoList.filter((ts) => ts.taskName !== task.taskName);
    axios.delete(
      `https://todo-assignment-app.herokuapp.com/tasks/${task.taskName}`
    );

    //axios.delete(`http://localhost:1337/tasks/${task.taskName}`);
    //reflect todo deletion for others through socket
    socket.emit("update_todo", updatedArray, room);
    setTodoList(updatedArray);
  };

  return (
    <div className="App">
      {!loggedIn ? (
        <div>
          <small className="intro">
            Type your name heve to see what others are doing
          </small>
        </div>
      ) : undefined}
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
                onChange={handleChange}
              ></input>
            </div>
            <button onClick={addTask}>Add Task</button>
          </div>
        )}
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
              />
            );
          })}
      </div>
    </div>
  );
};

export default App;
