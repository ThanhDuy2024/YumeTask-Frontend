import { useState, useEffect } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './calendar-custom.css';
import { updateStatus } from "@/services/tasks/updateTaskService";

export const TaskCalendarView = ({ tasks, handleTaskChanged }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loadingId, setLoadingId] = useState(null); // Để hiển thị trạng thái đang update
  const tasksPerPage = 4;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, filterStatus]);

  // --- 2. HÀM GỌI API TRỰC TIẾP ---
  const updateTaskStatus = async (taskId, currentStatus) => {
    let newStatus;
    if (currentStatus === "init") {
      newStatus = "complete"
    } else if (currentStatus === "complete") {
      newStatus = "init"
    };

    setLoadingId(taskId);
    try {
      // Giả sử updateTaskApi là hàm import từ file api service
      const response = await updateStatus(taskId, { status: newStatus });

      // Nếu API trả về trực tiếp data (không phải object của axios)
      // thì kiểm tra response có tồn tại hay không
      if (response) {
        await handleTaskChanged();
      }
    } catch (error) {
      console.error("Lỗi:", error);
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8 w-full">
      {/* CỘT TRÁI: LỊCH */}
      <div className="lg:col-span-5 p-6 bg-white rounded-3xl border border-gray-100 shadow-xl">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileContent={tileContent}
          locale="vi-VN"
          className="mx-auto border-none w-full font-sans text-lg"
        />
      </div>

      {/* CỘT PHẢI: NHIỆM VỤ */}
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

          <div className="flex bg-gray-100 p-1 rounded-xl">
            {[{ id: 'all', label: 'Tất cả' }, { id: 'init', label: 'Chưa xong' }, { id: 'complete', label: 'Hoàn thành' }].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === tab.id ? 'bg-white text-[#185ADB] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {currentTasks.length > 0 ? (
            currentTasks.map((task) => {
              const isDone = task.status === 'done' || task.status === 'complete';
              const isUpdating = loadingId === task._id;

              return (
                <div
                  key={task.id}
                  className={`group p-5 rounded-2xl flex items-start gap-4 border transition-all cursor-pointer ${isDone ? 'bg-gray-50/50 border-transparent' : 'bg-white border-gray-100 shadow-sm hover:border-blue-200'} ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => updateTaskStatus(task.id, task.status)}
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => { }}
                      className="w-6 h-6 rounded-lg accent-[#185ADB] cursor-pointer mt-0.5"
                    />
                    {isUpdating && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                        <div className="w-4 h-4 border-2 border-[#185ADB] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-base font-semibold transition-all ${isDone ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {task.taskContent || task.taskName}
                    </p>
                  </div>
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

        {/* PHẦN PHÂN TRANG (Giữ nguyên như cũ) */}
        {totalPages > 1 && (
          <div className="pt-6 border-t border-gray-50 flex items-center justify-center gap-4">
            {/* ... code phân trang ... */}
          </div>
        )}
      </div>
    </div>
  );
};