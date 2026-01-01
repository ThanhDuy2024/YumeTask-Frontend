import { useState } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './calendar-custom.css';

export const TaskCalendarView = ({ tasks, handleTaskChanged }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Hàm xử lý mọi định dạng ngày từ Backend (kể cả lỗi DD/MM/YYYY của năm 2025)
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
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full shadow-[0_0_3px_rgba(37,99,235,0.5)]"></div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8 w-full">

      {/* CỘT TRÁI: LỊCH (Chiếm 5/12 phần) */}
      <div className="lg:col-span-5 p-6 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 sticky top-4">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileContent={tileContent}
          locale="vi-VN"
          className="mx-auto border-none w-full font-sans text-lg"
        />
      </div>

      {/* CỘT PHẢI: NHIỆM VỤ (Chiếm 7/12 phần) */}
      <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 min-h-[550px] flex flex-col">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-50">
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl font-bold text-gray-800">Chi tiết nhiệm vụ</h3>
            <p className="text-[#185ADB] font-medium flex items-center gap-2">
              <span className="capitalize">{selectedDate.toLocaleDateString('vi-VN', { weekday: 'long' })}</span>
              <span>•</span>
              <span>{selectedDate.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-3xl font-bold text-[#185ADB]">{tasksOfSelectedDate.length}</span>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Công việc</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
          {tasksOfSelectedDate.length > 0 ? (
            tasksOfSelectedDate.map((task) => (
              <div
                key={task._id}
                className="group p-5 bg-gray-50/50 rounded-2xl flex items-start gap-4 border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-md transition-all duration-300"
              >
                <div className="mt-1">
                  <input
                    type="checkbox"
                    checked={task.status === 'done' || task.status === 'complete'}
                    readOnly
                    className="w-6 h-6 rounded-lg border-2 border-gray-300 text-[#185ADB] focus:ring-[#185ADB] accent-[#185ADB] cursor-pointer transition-all"
                  />
                </div>
                <div className="flex-1">
                  <p className={`text-base font-semibold transition-all ${task.status === 'done' || task.status === 'complete' ? 'line-through text-gray-400 opacity-70' : 'text-gray-700'}`}>
                    {task.taskContent || task.taskName}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[11px] font-medium px-2 py-0.5 bg-white rounded-md text-gray-500 border border-gray-100 shadow-sm">
                      🕒 {task.createdAt}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-300">
              <div className="text-6xl mb-4">✨</div>
              <p className="text-gray-400 font-medium italic">Không có nhiệm vụ nào được ghi nhận</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};