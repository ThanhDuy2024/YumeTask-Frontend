import AddTask from "@/components/addTask";
import StatsAndFilters from "@/components/statsAndFilters";
import TaskList from "@/components/taskList";
import TaskListPagination from "@/components/taskListPagination";
import { limit } from "@/lib/data";
import { taskList } from "@/services/tasks/taskListService";
import { useEffect } from "react";
import { useState } from "react";

export const TaskPage = () => {
  const [taskBuffer, setTaskBuffer] = useState([]);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    taskApi();
  }, [])

  useEffect(() => {
    setPage(1);
  }, [filter]);

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

  const handleNext = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

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

  const visibleTasks = filterTasks.slice(
    (page - 1) * limit,
    page * limit
  );

  if (visibleTasks.length === 0) {
    handlePrev();
  }

  const totalPages = Math.ceil(filterTasks.length / limit);

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
            filteredTasks={visibleTasks}
            handleTaskChanged={handleTaskChange}
          />

          {/* Phân Trang và Lọc Theo Date */}
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <TaskListPagination
              handleNext={handleNext}
              handlePrev={handlePrev}
              handlePageChange={handlePageChange}
              page={page}
              totalPages={totalPages}
            />
          </div>
        </div>
      </div>
    </>
  )
};
