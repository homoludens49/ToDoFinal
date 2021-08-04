import React from "react";
import { ITask } from "../interfaces";
interface Props {
  task: ITask;
  deleteTask(taskNameToDelete: string): void;
  completeTask(task: ITask): void;
  editTask(taskNameToEdit: string): void;
}

const TodoTask = ({ task, deleteTask, completeTask, editTask }: Props) => {
  return (
     <div className="task" >
      <div className="content">
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
        className="edit"
        onClick={() => {
          console.log(task.taskName)
          //editTask(task.taskName);
        }}
      >
        Edit Task
      </button>
      <button
        className="delete"
        onClick={() => {
          deleteTask(task.taskName);
        }}
      >
        Delete Task
      </button>
    </div>
  );
};

export default TodoTask;
