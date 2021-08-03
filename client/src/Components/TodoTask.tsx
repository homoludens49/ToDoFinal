import React from "react";
import { ITask } from "../interfaces";
interface Props {
  task: ITask;
  completeTask(taskNameToDelete: string): void;
}

const TodoTask = ({ task, completeTask }: Props) => {
  return (
    <div className="task">
      <div className="content">
        <span>
          <small>Created By: </small>
          {task.user}
        </span>
        <span>
          <small>Task: </small>
          {task.taskName}
        </span>
        <span>
          <small>Deadline in Days: </small>
          {task.deadline}
        </span>
      </div>
      <button
        className="delete"
        onClick={() => {
          completeTask(task.taskName);
        }}
      >
        Delete Task
      </button>
    </div>
  );
};

export default TodoTask;
