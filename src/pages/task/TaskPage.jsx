import AddTask from "@/components/addTask";
import StatsAndFilters from "@/components/statsAndFilters";
import { TaskCalendarView } from "@/components/TaskCalendarView";
import TaskList from "@/components/taskList";
import TaskListPagination from "@/components/taskListPagination";
import { taskList } from "@/services/tasks/taskListService";
import { useEffect, useState } from "react";

export const TaskPage = () => {
  const [taskBuffer, setTaskBuffer] = useState([]);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [timeRange, setTimeRange] = useState("all");
  const [viewMode, setViewMode] = useState("list");

  // Hàm gọi API
  const taskApi = async (currentFilter, currentTimeRange, currentPage, isCalendar = false) => {
    try {
      // Khi ở chế độ Lịch, chúng ta lấy limit lớn (ví dụ 1000) để hiện đủ dấu chấm các tháng
      const limit = isCalendar ? 1000 : undefined; 
      const data = await taskList(currentFilter, isCalendar ? "all" : currentTimeRange, currentPage, limit);
      
      setTaskBuffer(data.data);
      setTotalPage(data.totalPage);
    } catch (error) {
      console.log("Error fetching tasks:", error);
    }
  };

  // Chạy lại khi chuyển đổi ViewMode hoặc thay đổi lọc
  useEffect(() => {
    taskApi(filter, timeRange, page, viewMode === "calendar");
  }, [filter, timeRange, page, viewMode]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleTaskChange = () => {
    taskApi(filter, timeRange, page, viewMode === "calendar");
  };

  const handleTimeRangeChange = (newTime) => {
    setTimeRange(newTime);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50/30 pt-8 pb-20">
      {/* Nới rộng container từ max-w-2xl lên max-w-7xl để hỗ trợ nằm ngang */}
      <div className={`mx-auto px-4 space-y-6 transition-all duration-500 ${viewMode === 'calendar' ? 'max-w-7xl' : 'max-w-3xl'}`}>
        
        <div className="text-center space-y-2">
          <h1 className="text-[36px] font-bold text-[#185ADB]">Kế hoạch của tôi</h1>
          <p className="text-gray-500 text-sm">Quản lý công việc hiệu quả mỗi ngày</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <AddTask handleNewTaskAdded={handleTaskChange} />
        </div>

        {/* Thanh công cụ: Chuyển view & Lọc */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex p-1 bg-gray-200/50 rounded-xl w-fit">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-[#185ADB]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <span className="text-lg">☰</span> Danh sách
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white shadow-md text-[#185ADB]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <span className="text-lg">📅</span> Lịch biểu
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

        {/* Nội dung hiển thị */}
        <div className="mt-4">
          {viewMode === "list" ? (
            <div className="space-y-6">
              <TaskList filteredTasks={taskBuffer} handleTaskChanged={handleTaskChange} />
              <TaskListPagination
                handleNext={() => page < totalPage && setPage(p => p + 1)}
                handlePrev={() => page > 1 && setPage(p => p - 1)}
                handlePageChange={setPage}
                page={page}
                totalPages={totalPage}
              />
            </div>
          ) : (
            <TaskCalendarView 
              tasks={taskBuffer} 
              handleTaskChanged={handleTaskChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};