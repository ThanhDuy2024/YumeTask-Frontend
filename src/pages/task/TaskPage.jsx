import AddTask from "@/components/addTask";
import StatsAndFilters from "@/components/statsAndFilters";
import { TaskCalendarView } from "@/components/TaskCalendarView";
import TaskList from "@/components/taskList";
import TaskListPagination from "@/components/taskListPagination";
import { createTaskAdvan } from "@/services/tasks/createTaskService";
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

  // --- STATE MỚI CHO THÊM NHIỆM VỤ NÂNG CAO ---
  const [isAdvanModalOpen, setIsAdvanModalOpen] = useState(false);
  const [newAdvanTask, setNewAdvanTask] = useState({
    taskName: "",
    taskNote: "",
    startTime: "00:00",
    endTime: "23:59",
    date: new Date().toISOString().split('T')[0]
  });

  const fetchTaskPagination = useCallback(async () => {
    try {
      const data = await taskList(filter, timeRange, page);
      setTaskBuffer(data?.data || []);
      setTotalPage(data?.totalPage || 0);
    } catch (error) {
      console.error("Lỗi fetch danh sách:", error);
      setTaskBuffer([]);
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

  // --- LOGIC LƯU NHIỆM VỤ NÂNG CAO ---
  const handleSaveAdvanTask = async (e) => {
    e.preventDefault();
    try {
      const response = await createTaskAdvan({
        taskContent: newAdvanTask.taskName,
        taskNote: newAdvanTask.taskNote,
        dateTime: newAdvanTask.date,
        startTime: newAdvanTask.startTime,
        endTime: newAdvanTask.endTime
      });
      if (response) {
        setIsAdvanModalOpen(false);
        setNewAdvanTask({ taskName: "", taskNote: "", startTime: "00:00", endTime: "23:59", date: new Date().toISOString().split('T')[0] });
        await handleTaskChange();
      }
    } catch (error) {
      console.error("Lỗi thêm task:", error);
      alert("Không thể thêm nhiệm vụ mới!");
    }
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

          {/* CHỈ HIỂN THỊ NÚT NÂNG CAO KHI Ở CHẾ ĐỘ LỊCH BIỂU */}
          {viewMode === "calendar" && (
            <button 
              onClick={() => setIsAdvanModalOpen(true)}
              className="bg-[#185ADB] text-white px-5 py-2 rounded-xl font-bold shadow-lg hover:bg-[#1244a7] transition-all"
            >
              ＋ Thêm nâng cao
            </button>
          )}

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

      {/* MODAL THÊM NHIỆM VỤ NÂNG CAO */}
      {isAdvanModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Tạo nhiệm vụ mới</h3>
            <form onSubmit={handleSaveAdvanTask} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tên nhiệm vụ</label>
                <input type="text" required className="w-full p-3.5 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#185ADB]" value={newAdvanTask.taskName} onChange={(e) => setNewAdvanTask({...newAdvanTask, taskName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Ghi chú</label>
                <textarea className="w-full p-3.5 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#185ADB] min-h-[80px]" value={newAdvanTask.taskNote} onChange={(e) => setNewAdvanTask({...newAdvanTask, taskNote: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Bắt đầu</label>
                  <input type="time" className="w-full p-3.5 rounded-2xl border border-gray-200" value={newAdvanTask.startTime} onChange={(e) => setNewAdvanTask({...newAdvanTask, startTime: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Kết thúc</label>
                  <input type="time" className="w-full p-3.5 rounded-2xl border border-gray-200" value={newAdvanTask.endTime} onChange={(e) => setNewAdvanTask({...newAdvanTask, endTime: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Ngày làm việc</label>
                <input type="date" required className="w-full p-3.5 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#185ADB]" value={newAdvanTask.date} onChange={(e) => setNewAdvanTask({...newAdvanTask, date: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAdvanModalOpen(false)} className="flex-1 py-3.5 rounded-2xl bg-gray-100 font-bold text-gray-600 hover:bg-gray-200 transition-all">Hủy</button>
                <button type="submit" className="flex-1 py-3.5 rounded-2xl bg-[#185ADB] font-bold text-white shadow-lg transition-all">Tạo ngay</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};