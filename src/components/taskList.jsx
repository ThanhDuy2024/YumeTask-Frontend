// taskList.jsx (Revised)

import React from "react";
import TaskEmptyState from "./taskEmptyState";
import TaskCard from "./taskCard";

const TaskList = ({ filteredTasks, filter, handleTaskChanged }) => {
  if (!Array.isArray(filteredTasks) || filteredTasks.length === 0) {
    return <TaskEmptyState filter={filter} />;
  }

  return (
    <div className="space-y-3">
      {filteredTasks.map((task, index) => (
        <TaskCard
          key={task.id ?? index}
          task={task}
          index={index}
          handleTaskChanged={handleTaskChanged}
        />
      ))}
    </div>
  );
};

export default TaskList;