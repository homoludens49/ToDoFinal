import React from "react";
import { ITask } from "../interfaces";
interface Props {
  task: ITask;
  hide: boolean;
  deleteTask(task: ITask): void;
  completeTask(task: ITask): void;
}

const TodoTask = ({ task,hide, deleteTask, completeTask }: Props) => {

  return (
     <div className="task" style={{visibility: hide && task.complete  ? "hidden":"visible" }} >
      <div className="content" >
        <span style={{textDecoration: task.complete? "line-through": "none"}}>
          <small>Created By: </small>
          {task.user}
        </span>
        <span style={{textDecoration: task.complete? "line-through": "none"}}>
          <small>Task: </small>
          {task.taskName}
        </span>
        <span style={{textDecoration: task.complete? "line-through": "none"}}>
          <small>Deadline in Days: </small>
          {task.deadline}
        </span>
      </div>
      <button
        className="complete"
        onClick={() => {
          completeTask(task);
        }}
      >
        Complete Task
      </button>
      <button
        className="delete"
        onClick={() => {
          deleteTask(task);
        }}
      >
        Delete Task
      </button>
    </div>
  );
};

export default TodoTask;
