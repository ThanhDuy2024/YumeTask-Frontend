import AddTask from "@/components/addTask";
import StatsAndFilters from "@/components/statsAndFilters";
import { TaskCalendarView } from "@/components/TaskCalendarView";
import TaskList from "@/components/taskList";
import TaskListPagination from "@/components/taskListPagination";
import { taskAll, taskList } from "@/services/tasks/taskListService";
import { useEffect, useState, useCallback } from "react";

export const TaskPage = () => {
  const [taskBuffer, setTaskBuffer] = useState([]);
  const [allTasks, setAllTasks] = useState([]); 
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [timeRange, setTimeRange] = useState("all");
  const [viewMode, setViewMode] = useState("list");

  // Dùng useCallback để hàm không bị khởi tạo lại, tránh lỗi vòng lặp useEffect
  const fetchTaskPagination = useCallback(async () => {
    try {
      const data = await taskList(filter, timeRange, page);
      // Kiểm tra an toàn: nếu data.data không tồn tại thì gán mảng rỗng []
      setTaskBuffer(data?.data || []);
      setTotalPage(data?.totalPage || 0);
    } catch (error) {
      console.error("Lỗi fetch danh sách:", error);
      setTaskBuffer([]); // Tránh render object lỗi
    }
  }, [filter, timeRange, page]);

  const fetchAllTasksForCalendar = useCallback(async () => {
    try {
      const data = await taskAll();
      setAllTasks(data?.data || []);
    } catch (error) {
      console.error("Lỗi fetch toàn bộ task:", error);
      setAllTasks([]);
    }
  }, []);

  // Effect điều khiển việc gọi dữ liệu
  useEffect(() => {
    if (viewMode === "list") {
      fetchTaskPagination();
    } else {
      fetchAllTasksForCalendar();
    }
  }, [viewMode, fetchTaskPagination, fetchAllTasksForCalendar]);

  const handleTaskChange = async () => {
    if (viewMode === "list") await fetchTaskPagination();
    else await fetchAllTasksForCalendar();
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleTimeRangeChange = (newTime) => {
    setTimeRange(newTime);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pt-8 pb-20">
      <div className={`mx-auto px-4 space-y-6 transition-all duration-700 ${viewMode === 'calendar' ? 'max-w-7xl' : 'max-w-3xl'}`}>
        
        <div className="text-center">
          <h1 className="text-[36px] font-bold text-[#185ADB]">Kế hoạch của tôi</h1>
          <p className="text-gray-500 text-sm mt-2">Quản lý công việc hiệu quả mỗi ngày</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <AddTask handleNewTaskAdded={handleTaskChange} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex p-1 bg-gray-200/50 rounded-xl w-fit">
            <button 
              onClick={() => setViewMode("list")} 
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-[#185ADB]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ☰ Danh sách
            </button>
            <button 
              onClick={() => setViewMode("calendar")} 
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white shadow-md text-[#185ADB]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              📅 Lịch biểu
            </button>
          </div>

          {viewMode === "list" && (
            <StatsAndFilters 
              filter={filter} 
              setFilter={handleFilterChange} 
              timeRange={timeRange} 
              setTimeRange={handleTimeRangeChange} 
            />
          )}
        </div>

        <div className="mt-4">
          {viewMode === "list" ? (
            <div className="space-y-6">
              <TaskList filteredTasks={taskBuffer} handleTaskChanged={handleTaskChange} />
              {totalPage > 1 && (
                <TaskListPagination
                  handleNext={() => page < totalPage && setPage(p => p + 1)}
                  handlePrev={() => page > 1 && setPage(p => p - 1)}
                  handlePageChange={setPage}
                  page={page}
                  totalPages={totalPage}
                />
              )}
            </div>
          ) : (
            <TaskCalendarView tasks={allTasks} handleTaskChanged={handleTaskChange} />
          )}
        </div>
      </div>
    </div>
  );
};