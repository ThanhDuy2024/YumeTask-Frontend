import { useState, useEffect } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './calendar-custom.css';

export const TaskCalendarView = ({ tasks, handleTaskChanged }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 4;

  // Reset trang khi đổi ngày
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate]);

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

  const tasksOfSelectedDate = tasks.filter(task => {
    const taskDateObj = parseTaskDate(task.createdAt);
    return taskDateObj ? taskDateObj.toDateString() === selectedDate.toDateString() : false;
  });

  // Logic phân trang
  const totalPages = Math.ceil(tasksOfSelectedDate.length / tasksPerPage);
  const currentTasks = tasksOfSelectedDate.slice(
    (currentPage - 1) * tasksPerPage,
    currentPage * tasksPerPage
  );

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
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-50">
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl font-bold text-gray-800">Chi tiết nhiệm vụ</h3>
            <p className="text-[#185ADB] font-medium">
              <span className="capitalize">{selectedDate.toLocaleDateString('vi-VN', { weekday: 'long' })}</span>
              <span> • </span>
              <span>{selectedDate.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-3xl font-bold text-[#185ADB]">{tasksOfSelectedDate.length}</span>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Công việc</span>
          </div>
        </div>

        {/* Danh sách nhiệm vụ (đã cắt theo trang) */}
        <div className="flex-1 space-y-3">
          {currentTasks.length > 0 ? (
            currentTasks.map((task) => (
              <div key={task._id} className="group p-5 bg-gray-50/50 rounded-2xl flex items-start gap-4 border border-transparent hover:border-blue-100 transition-all">
                <input type="checkbox" checked={task.status === 'done' || task.status === 'complete'} readOnly className="w-6 h-6 rounded-lg text-[#185ADB]" />
                <div className="flex-1">
                  <p className={`text-base font-semibold ${task.status === 'done' || task.status === 'complete' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {task.taskContent || task.taskName}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-300">
              <div className="text-6xl mb-4">✨</div>
              <p className="text-gray-400 font-medium italic">Không có nhiệm vụ nào</p>
            </div>
          )}
        </div>

        {/* PHẦN ĐIỀU KHIỂN PHÂN TRANG */}
        {totalPages > 1 && (
          <div className="pt-6 border-t border-gray-50 flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${currentPage === 1 ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-[#185ADB] bg-blue-50 hover:bg-[#185ADB] hover:text-white'}`}
            >
              Trước
            </button>
            
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === index + 1 ? 'bg-[#185ADB] text-white' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${currentPage === totalPages ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-[#185ADB] bg-blue-50 hover:bg-[#185ADB] hover:text-white'}`}
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
};