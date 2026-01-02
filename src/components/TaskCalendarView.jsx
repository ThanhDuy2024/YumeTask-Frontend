import { useState, useEffect } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './calendar-custom.css';
import { updateStatus } from "@/services/tasks/updateTaskService";
// 1. Giả sử bạn import hàm deleteTask từ service của mình
import { taskDelete } from "@/services/tasks/taskDeleteService";

export const TaskCalendarView = ({ tasks, handleTaskChanged }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loadingId, setLoadingId] = useState(null);
  const tasksPerPage = 4;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, filterStatus]);

  // --- LOGIC CẬP NHẬT TRẠNG THÁI ---
  const updateTaskStatus = async (taskId, currentStatus) => {
    let newStatus = (currentStatus === "done" || currentStatus === "complete") ? "init" : "complete";
    setLoadingId(taskId);
    try {
      const response = await updateStatus(taskId, { status: newStatus });
      if (response) {
        await handleTaskChanged();
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      alert("Không thể cập nhật trạng thái!");
    } finally {
      setLoadingId(null);
    }
  };

  // --- 2. LOGIC XÓA TASK ---
  const handleDeleteTask = async (e, taskId) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra thẻ cha (tránh vô tình toggle status)
    setLoadingId(taskId);
    try {
      const response = await taskDelete(taskId);
      if (response) {
        await handleTaskChanged(); // Load lại danh sách sau khi xóa
      }
    } catch (error) {
      console.error("Lỗi khi xóa task:", error);
      alert("Xóa thất bại. Vui lòng thử lại!");
    } finally {
      setLoadingId(null);
    }
  };

  const parseTaskDate = (dateStr) => {
    if (!dateStr) return null;
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
      const parts = dateStr.split(' ');
      const dmy = parts.length > 1 ? parts[1] : parts[0];
      const [d, m, y] = dmy.split('/');
      return new Date(`${y}-${m}-${d}`);
    }
    const dateObj = new Date(dateStr);
    return isNaN(dateObj.getTime()) ? null : dateObj;
  };

  const filteredTasks = tasks.filter(task => {
    const taskDateObj = parseTaskDate(task.createdAt);
    const isSameDate = taskDateObj ? taskDateObj.toDateString() === selectedDate.toDateString() : false;
    if (!isSameDate) return false;

    if (filterStatus === 'all') return true;
    if (filterStatus === 'complete') return task.status === 'done' || task.status === 'complete';
    if (filterStatus === 'init') return task.status === 'init' || task.status === 'todo' || !task.status;
    return true;
  });

  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const currentTasks = filteredTasks.slice((currentPage - 1) * tasksPerPage, currentPage * tasksPerPage);

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toDateString();
      const hasTask = tasks.some(task => {
        const taskDateObj = parseTaskDate(task.createdAt);
        return taskDateObj ? taskDateObj.toDateString() === dateStr : false;
      });
      if (hasTask) {
        return (
          <div key={dateStr} className="flex justify-center mt-1">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8 w-full font-sans">
      {/* CỘT TRÁI: LỊCH */}
      <div className="lg:col-span-5 p-6 bg-white rounded-3xl border border-gray-100 shadow-xl">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileContent={tileContent}
          locale="vi-VN"
          className="mx-auto border-none w-full text-lg"
        />
      </div>

      {/* CỘT PHẢI: CHI TIẾT NHIỆM VỤ */}
      <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl min-h-[600px] flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-gray-50 gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl font-bold text-gray-800">Chi tiết nhiệm vụ</h3>
            <p className="text-[#185ADB] font-medium">
              <span className="capitalize">{selectedDate.toLocaleDateString('vi-VN', { weekday: 'long' })}</span>
              <span> • </span>
              <span>{selectedDate.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner">
            {[{ id: 'all', label: 'Tất cả' }, { id: 'init', label: 'Chưa xong' }, { id: 'complete', label: 'Xong' }].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === tab.id ? 'bg-white text-[#185ADB] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* DANH SÁCH NHIỆM VỤ */}
        <div className="flex-1 space-y-3">
          {currentTasks.length > 0 ? (
            currentTasks.map((task) => {
              const isDone = task.status === 'done' || task.status === 'complete';
              const isUpdating = loadingId === task.id;

              return (
                <div
                  key={task.id}
                  className={`group p-5 rounded-2xl flex items-center gap-4 border transition-all cursor-pointer ${
                    isDone ? 'bg-gray-50/50 border-transparent' : 'bg-white border-gray-100 shadow-sm hover:border-blue-200'
                  } ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => updateTaskStatus(task.id, task.status)}
                >
                  {/* Checkbox */}
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isDone}
                      readOnly
                      className="w-6 h-6 rounded-lg accent-[#185ADB] cursor-pointer"
                    />
                    {isUpdating && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                        <div className="w-4 h-4 border-2 border-[#185ADB] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  {/* Nội dung task */}
                  <div className="flex-1 flex flex-col gap-1">
                    <p className={`text-base font-semibold leading-tight transition-all ${
                      isDone ? 'line-through text-gray-400' : 'text-gray-700'
                    }`}>
                      {task.taskContent || task.taskName}
                    </p>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[11px] font-medium tracking-tight">
                        {task.createdAt || "Chưa có thời gian"}
                      </span>
                    </div>
                  </div>

                  {/* 3. NÚT XÓA (Hiển thị khi hover hoặc luôn hiển thị tùy ý) */}
                  <button
                    onClick={(e) => handleDeleteTask(e, task.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    title="Xóa nhiệm vụ"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-300">
              <div className="text-6xl mb-4">✨</div>
              <p className="text-gray-400 font-medium italic">Không có nhiệm vụ nào</p>
            </div>
          )}
        </div>

        {/* PHÂN TRANG */}
        {totalPages > 1 && (
          <div className="pt-6 mt-6 border-t border-gray-50 flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentPage === 1 ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-[#185ADB] bg-blue-50 hover:bg-[#185ADB] hover:text-white'
              }`}
            >
              Trước
            </button>
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                    currentPage === index + 1 ? 'bg-[#185ADB] text-white shadow-md' : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentPage === totalPages ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-[#185ADB] bg-blue-50 hover:bg-[#185ADB] hover:text-white'
              }`}
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
};