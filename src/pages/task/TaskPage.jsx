import AddTask from "@/components/addTask";
import StatsAndFilters from "@/components/statsAndFilters";
import TaskList from "@/components/taskList";
import TaskListPagination from "@/components/taskListPagination";
import { taskList } from "@/services/tasks/taskListService";
import { useEffect } from "react";
import { useState } from "react";

export const TaskPage = () => {
  const [taskBuffer, setTaskBuffer] = useState([]);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);

  // 1. Hàm gọi API: Luôn lấy giá trị mới nhất từ state
  const taskApi = async (currentFilter, currentPage) => {
    try {
      // Truyền đúng giá trị đang có vào service
      const data = await taskList(currentFilter, currentPage);
      setTaskBuffer(data.data);
      setTotalPage(data.totalPage);
    } catch (error) {
      console.log("Error fetching tasks:", error);
    }
  };

  // 2. Chỉ dùng 1 useEffect chính để xử lý gọi dữ liệu
  useEffect(() => {
    taskApi(filter, page);
  }, [filter, page]); // Chạy lại khi 1 trong 2 thay đổi

  // 3. Xử lý riêng khi người dùng thay đổi filter
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1); // Reset về trang 1 khi lọc
  };

  // 4. Cập nhật hàm này để các component con gọi đúng
  const handleTaskChange = () => {
    taskApi(filter, page);
  };

  const handleNext = () => {
    if (page < totalPage) setPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage(prev => prev - 1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <>
      <div className="container relative z-10 pt-8 mx-auto">
        <div className="w-full max-w-2xl p-6 mx-auto space-y-6">
          <div className="text-center text-[32px] font-700 text-[#185ADB]">Hãy bắt đầu tạo nhiệm vụ nào!!!</div>
          
          <AddTask handleNewTaskAdded={handleTaskChange} />

          <StatsAndFilters
            filter={filter}
            setFilter={handleFilterChange} // Dùng hàm handle mới để reset page
          />

          <TaskList
            filteredTasks={taskBuffer}
            handleTaskChanged={handleTaskChange}
          />

          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <TaskListPagination
              handleNext={handleNext}
              handlePrev={handlePrev}
              handlePageChange={handlePageChange}
              page={page}
              totalPages={totalPage}
            />
          </div>
        </div>
      </div>
    </>
  );
};