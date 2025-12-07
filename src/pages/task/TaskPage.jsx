import AddTask from "@/components/addTask";
import StatsAndFilters from "@/components/statsAndFilters";
import TaskList from "@/components/taskList";
import { taskList } from "@/services/tasks/taskListService";
import { useEffect } from "react";
import { useState } from "react";

export const TaskPage = () => {
  const [taskBuffer, setTaskBuffer] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    taskApi();
  }, [])

  const taskApi = async () => {
    try {
      const data = await taskList();
      setTaskBuffer(data.data);
      console.log(data.data);
    } catch (error) {
      console.log(error)
    }
  }

  const handleTaskChange = async () => {
    await taskApi();
  }
  
  //filter task
  const filterTasks = taskBuffer.filter((task) => {
    switch (filter) {
      case "init":
        return task.status === "init";
      case "complete":
        return task.status === "complete";
      default:
        return true;
    }
  });

  return (
    <>
      {/* Your Content/Components */}
      <div className="container relative z-10 pt-8 mx-auto">
        <div className="w-full max-w-2xl p-6 mx-auto space-y-6">
          <div className="text-center text-[32px] font-700 text-[#185ADB]">Hãy bắt đầu tạo nhiệm vụ nào!!!</div>
          {/* addTask */}
          <AddTask 
            handleNewTaskAdded={handleTaskChange}
          />

          {/* filter */}
          <StatsAndFilters
            filter={filter}
            setFilter={setFilter}
          />

          {/* taskList */}
          <TaskList
            filteredTasks={filterTasks}
            handleTaskChanged={handleTaskChange}
          />
        </div>
      </div>
    </>
  )
};
