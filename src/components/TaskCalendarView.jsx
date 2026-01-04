import { useState, useEffect } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './calendar-custom.css';
import { updateStatus, updateTaskAdvan } from "@/services/tasks/updateTaskService";
import { taskDelete } from "@/services/tasks/taskDeleteService";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import slugify from "slugify";
import { ClockFading } from "lucide-react";
import { Search } from "lucide-react";
import { FileText } from "lucide-react";
import { Pencil } from "lucide-react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const TaskCalendarView = ({ tasks, handleTaskChanged }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loadingId, setLoadingId] = useState(null);
  const [sortType, setSortType] = useState('none'); // TÍNH NĂNG MỚI: 'none', 'startTime', 'endTime'
  // --- STATE TÌM KIẾM ---
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // --- STATE CHO MODAL XÓA ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // --- STATE CHO MODAL CHỈNH SỬA ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const tasksPerPage = 4;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, filterStatus, sortType]); // Thêm sortType vào dependency

  // Hàm phụ xóa dấu để tránh lỗi Unicode
  const removeVietnameseTones = (str) => {
    if (!str) return "";
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-zA-Z0-9\s\-\:\/]/g, '');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const dateStr = selectedDate.toLocaleDateString('vi-VN');

    // --- 1. TRANG TRI PHAN DAU (HEADER) ---
    doc.setFillColor(24, 90, 219);
    doc.rect(0, 0, 210, 15, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(31, 41, 55);
    doc.text(removeVietnameseTones("DANH SACH NHIEM VU"), 14, 30);
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Ngay thuc hien: ${dateStr}`, 14, 38);
    doc.setDrawColor(229, 231, 235);
    doc.line(14, 42, 196, 42);

    // --- 2. CHUAN BI DU LIEU (Dùng filteredTasks đã sắp xếp) ---
    const tableColumn = ["STT", "NHIEM VU", "THOI GIAN", "GHI CHU", "TRANG THAI"];
    const tableRows = filteredTasks.map((task, index) => [
      index + 1,
      removeVietnameseTones(task.taskName || task.taskContent).toUpperCase(),
      `${task.startTime || "00:00"} - ${task.endTime || "23:59"}`,
      removeVietnameseTones(task.taskNote || "---"),
      (task.status === 'done' || task.status === 'complete') ? "HOAN THANH" : "....",
    ]);

    autoTable(doc, {
      startY: 48,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [24, 90, 219], textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: {
          halign: 'center', cellWidth: 20
        },
        1: {
          cellWidth: 50
        },
        2: {
          halign: 'center', cellWidth: 40
        },
        3: {
          halign: 'left',
          cellWidth: 50
        },
        4: {
          halign: 'center'
        }
      },
      margin: { left: 14, right: 14 }
    });

    doc.save(`Tasks_Professional_${dateStr.replace(/\//g, '-')}.pdf`);
  };

  // --- LOGIC CẬP NHẬT TRẠNG THÁI ---
  const updateTaskStatus = async (taskId, currentStatus) => {
    let newStatus = (currentStatus === "done" || currentStatus === "complete") ? "init" : "complete";
    setLoadingId(taskId);
    try {
      const response = await updateStatus(taskId, { status: newStatus });
      if (response) await handleTaskChanged();
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
    } finally {
      setLoadingId(null);
    }
  };

  // Hàm thực hiện xóa thực sự khi ấn nút "Xác nhận" trên Modal
  const confirmDeleteTask = (e, task) => {
    e.stopPropagation();
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  // Hàm thực hiện xóa thực sự khi ấn nút "Xác nhận" trên Modal
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    setLoadingId(taskToDelete.id);
    try {
      const response = await taskDelete(taskToDelete.id);
      if (response) {
        setIsDeleteModalOpen(false);
        setTaskToDelete(null);
        await handleTaskChanged();
      }
    } catch (error) {
      console.error("Lỗi khi xóa task:", error);
      alert("Không thể xóa nhiệm vụ!");
    } finally {
      setLoadingId(null);
    }
  };

  // --- LOGIC MỞ MODAL VÀ LƯU CHỈNH SỬA ---
  const openEditModal = (e, task) => {
    e.stopPropagation();
    const dateObj = parseTaskDate(task.dateTime || task.createdAt);
    const formattedDate = dateObj ? dateObj.toISOString().split('T')[0] : "";
    setEditingTask({
      ...task,
      editName: task.taskName || task.taskContent,
      editNote: task.taskNote || "",
      editDate: formattedDate,
      startTime: task.startTime || "00:00",
      endTime: task.endTime || "23:59"
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setLoadingId(editingTask.id);
    try {
      const response = await updateTaskAdvan(editingTask.id, {
        taskContent: editingTask.editName,
        taskNote: editingTask.editNote,
        dateTime: editingTask.editDate,
        startTime: editingTask.startTime,
        endTime: editingTask.endTime
      });
      if (response) {
        setIsEditModalOpen(false);
        toast.success("Nhiệm vụ được cập nhật thành công")
        await handleTaskChanged();
      }
    } catch (error) {
      alert("Không thể cập nhật thông tin!");
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

  // --- LOGIC LỌC VÀ SẮP XẾP MỚI ---
  const tasksForSelectedDate = tasks.filter(task => {
    const taskDateObj = parseTaskDate(task.dateTime ? task.dateTime : task.createdAt);
    return taskDateObj ? taskDateObj.toDateString() === selectedDate.toDateString() : false;
  });

  let filteredTasks = tasksForSelectedDate.filter(task => {
    let matchesStatus = true;
    if (filterStatus === 'complete') matchesStatus = task.status === 'done' || task.status === 'complete';
    if (filterStatus === 'init') matchesStatus = task.status === 'init' || task.status === 'todo' || !task.status;

    const querySlug = slugify(searchQuery, { lower: true, locale: 'vi', remove: /[*+~.()'"!:@]/g });
    const taskSlug = task.slug || slugify(task.taskContent || "", { lower: true, locale: 'vi' });
    const matchesSearch = taskSlug.includes(querySlug);
    return matchesStatus && matchesSearch;
  });

  // Áp dụng sắp xếp
  if (sortType !== 'none') {
    filteredTasks = [...filteredTasks].sort((a, b) => {
      const timeA = a[sortType] || "00:00";
      const timeB = b[sortType] || "00:00";
      return timeA.localeCompare(timeB);
    });
  }

  const totalTasksInDay = tasksForSelectedDate.length;
  const completedTasksInDay = tasksForSelectedDate.filter(t => t.status === 'done' || t.status === 'complete').length;
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const currentTasks = filteredTasks.slice((currentPage - 1) * tasksPerPage, currentPage * tasksPerPage);

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const calendarDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const tasksInDay = tasks.filter(task => {
        const taskDateObj = parseTaskDate(task.dateTime || task.createdAt);
        if (!taskDateObj) return false;
        const taskTime = new Date(taskDateObj.getFullYear(), taskDateObj.getMonth(), taskDateObj.getDate()).getTime();
        return taskTime === calendarDate;
      });
      if (tasksInDay.length > 0) {
        return (
          <div className="flex justify-center gap-0.5 mt-1 flex-wrap px-1">
            {tasksInDay.map((_, index) => (
              <div key={index} className="w-1 h-1 bg-green-500 rounded-full"></div>
            ))}
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8 w-full font-sans relative">
      <div className="lg:col-span-5 p-10 bg-white rounded-3xl border border-gray-100 shadow-xl flex items-center justify-center">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileContent={tileContent}
          locale="vi-VN"
          className="mx-auto border-none w-full h-auto text-xl" // Đổi text-lg thành text-xl
        />
      </div>

      <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl min-h-[600px] flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-gray-50 gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold text-gray-800">Chi tiết nhiệm vụ</h3>
              {totalTasksInDay > 0 && (
                <div className="flex items-center bg-[#185ADB] text-white px-3 py-1 rounded-full shadow-lg shadow-blue-100 transition-all scale-110">
                  <span className="text-xs font-black">{completedTasksInDay}/{totalTasksInDay}</span>
                </div>
              )}
            </div>
            <p className="text-[#185ADB] font-medium text-sm">
              <span className="capitalize">{selectedDate.toLocaleDateString('vi-VN', { weekday: 'long' })}</span>
              <span> • </span>
              <span>{selectedDate.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-4 mb-[20px]">
            <div className="flex gap-2">
              {/* NÚT TÌM KIẾM MỚI */}
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="px-3 py-1.5 bg-blue-700 text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span><Search width={"20px"} /></span> Tìm nhanh
              </button>

              <button
                onClick={handleExportPDF}
                className="px-3 py-1.5 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                <span className="flex-shrink-0">
                  <FileText size={14} />
                </span>
                <span>Xuất PDF</span>
              </button>
            </div>

            {/* TOOLBAR MỚI: SẮP XẾP & LỌC */}
            <div className="flex flex-wrap gap-2 justify-end">
              {/* Cụm Sắp xếp */}
              <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner">
                <button onClick={() => setSortType(sortType === 'startTime' ? 'none' : 'startTime')} className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer hover:bg-white hover:text-[#185ADB] hover:shadow-sm ${sortType === 'startTime' ? 'bg-white text-[#185ADB] shadow-sm' : 'text-gray-500'}`}>
                  🕒 Bắt đầu
                </button>
                <button onClick={() => setSortType(sortType === 'endTime' ? 'none' : 'endTime')} className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer hover:bg-white hover:text-[#185ADB] hover:shadow-sm ${sortType === 'endTime' ? 'bg-white text-[#185ADB] shadow-sm' : 'text-gray-500'}`}>
                  ⌛ Kết thúc
                </button>
              </div>

              {/* Cụm Lọc trạng thái */}
              <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner">
                {[{ id: 'all', label: 'Tất cả' }, { id: 'init', label: 'Chưa xong' }, { id: 'complete', label: 'Xong' }].map((tab) => (
                  <button key={tab.id} onClick={() => setFilterStatus(tab.id)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer hover:bg-white hover:text-[#185ADB] hover:shadow-sm ${filterStatus === tab.id ? 'bg-white text-[#185ADB] shadow-sm' : 'text-gray-500'}`}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {currentTasks.length > 0 ? (
            currentTasks.map((task) => {
              const isDone = task.status === 'done' || task.status === 'complete';
              const isUpdating = loadingId === task.id;
              return (
                <div key={task.id} className={`group p-5 rounded-2xl flex items-center gap-4 border transition-all cursor-pointer ${isDone ? 'bg-gray-50/50 border-transparent' : 'bg-white border-gray-100 shadow-sm hover:border-blue-200'} ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`} onClick={() => updateTaskStatus(task.id, task.status)}>
                  <div className="relative">
                    <input type="checkbox" checked={isDone} readOnly className="w-6 h-6 rounded-lg accent-[#185ADB] cursor-pointer" />
                    {isUpdating && <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg"><div className="w-4 h-4 border-2 border-[#185ADB] border-t-transparent rounded-full animate-spin"></div></div>}
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <p className={`text-base font-semibold leading-tight transition-all ${isDone ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.taskName || task.taskContent}</p>
                    {task.taskNote && <p className={`text-sm ${isDone ? 'text-gray-300' : 'text-gray-500'} italic line-clamp-1`}><span className="font-bold">Ghi chú:</span> {task.taskNote}</p>}
                    <div className="flex flex-wrap items-center gap-y-3 gap-x-4 mt-2">
                      <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#185ADB] rounded-xl border border-blue-100 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-xs font-bold tracking-wide uppercase">{task.startTime && task.endTime ? `${task.startTime} — ${task.endTime}` : `00:00 — 23:59`}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="text-[12px] font-semibold">Ngày tạo: <span className="font-normal text-gray-400">{task.createdAt}</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={(e) => openEditModal(e, task)} className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer">
                      <Pencil />
                    </button>
                    <button onClick={(e) => confirmDeleteTask(e, task)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer">
                      <Trash2 />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-300 italic">📒 Không có nhiệm vụ nào</div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pt-6 mt-6 border-t border-gray-50 flex items-center justify-center gap-4">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${currentPage === 1 ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-[#185ADB] bg-blue-50 hover:bg-[#185ADB] hover:text-white'}`}>Trước</button>
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, index) => (
                <button key={index + 1} onClick={() => setCurrentPage(index + 1)} className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentPage === index + 1 ? 'bg-[#185ADB] text-white shadow-md' : 'text-gray-400 hover:bg-gray-100'}`}>{index + 1}</button>
              ))}
            </div>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${currentPage === totalPages ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-[#185ADB] bg-blue-50 hover:bg-[#185ADB] hover:text-white'}`}>Sau</button>
          </div>
        )}
      </div>

      {/* MODAL EDIT */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Chỉnh sửa nhiệm vụ</h3>
            <form onSubmit={handleSaveEdit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Tên nhiệm vụ</label>
                <input type="text" required className="w-full p-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#185ADB] outline-none transition-all" value={editingTask?.editName || ""} onChange={(e) => setEditingTask({ ...editingTask, editName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Ghi chú / Chi tiết</label>
                <textarea placeholder="VD: toan, van, anh" className="w-full p-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#185ADB] outline-none transition-all min-h-[100px] resize-none" value={editingTask?.editNote || ""} onChange={(e) => setEditingTask({ ...editingTask, editNote: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Bắt đầu</label>
                  <input type="time" required className="w-full p-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#185ADB] outline-none" value={editingTask?.startTime || ""} onChange={(e) => setEditingTask({ ...editingTask, startTime: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Kết thúc</label>
                  <input type="time" required className="w-full p-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#185ADB] outline-none" value={editingTask?.endTime || ""} onChange={(e) => setEditingTask({ ...editingTask, endTime: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Ngày làm việc</label>
                <input type="date" required className="w-full p-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#185ADB] outline-none" value={editingTask?.editDate || ""} onChange={(e) => setEditingTask({ ...editingTask, editDate: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3.5 rounded-2xl bg-gray-100 font-bold text-gray-600 hover:bg-gray-200 cursor-pointer">Hủy</button>
                <button type="submit" className="flex-1 py-3.5 rounded-2xl bg-[#185ADB] font-bold text-white shadow-lg cursor-pointer">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TÌM KIẾM */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Tìm kiếm nhanh</h3>
                <p className="text-xs text-gray-400 mt-1">Sử dụng slug hoặc tên nhiệm vụ</p>
              </div>
              <button
                onClick={() => { setIsSearchModalOpen(false); setSearchQuery(""); }}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all text-2xl"
              >
                ×
              </button>
            </div>

            {/* Input tìm kiếm */}
            <div className="relative">
              <span className="absolute left-4 top-[18px] text-gray-400 text-lg"><Search/></span>
              <input
                type="text"
                placeholder="Tìm nhanh (ví dụ: 'hop team', 'coding')..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#185ADB] outline-none transition-all text-base shadow-inner"
                value={searchQuery}
                autoFocus
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <p className="text-[16px] text-gray-400 mt-3 ml-2 flex items-center gap-1.5 italic">
                <span className="not-italic"></span> Sếp có thể gõ tiếng Việt không dấu để tìm kiếm nhanh hơn!
              </p>
            </div>

            {/* Kết quả xem trước */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3 px-2">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Kết quả khớp ({filteredTasks.length})</span>
                {searchQuery && <button onClick={() => setSearchQuery("")} className="text-[10px] text-[#185ADB] font-bold hover:underline">Xóa trắng</button>}
              </div>

              <div className="max-h-[280px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {filteredTasks.length > 0 ? (
                  filteredTasks.slice(0, 5).map(task => (
                    <div key={task.id} className="p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-white transition-all group flex justify-between items-center">
                      <div className="flex-1 pr-4">
                        <p className="text-sm font-bold text-gray-700 group-hover:text-[#185ADB] transition-colors line-clamp-1">{task.taskName || task.taskContent}</p>
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <span className="flex-shrink-0 text-gray-400">
                            <ClockFading size={14} />
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wide leading-none">
                            {task.startTime || '00:00'} — {task.endTime || '23:59'}
                          </span>
                        </div>
                      </div>
                      <div className="text-[10px] px-2 py-1 rounded-lg bg-white border border-gray-100 text-gray-400 shrink-0">
                        #{task.slug ? task.slug.substring(0, 10) : 'no-slug'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-gray-50/30 rounded-2xl border border-dashed border-gray-100">
                    <p className="text-3xl mb-2">🔭</p>
                    <p className="text-sm text-gray-400 italic">Không tìm thấy nhiệm vụ nào...</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsSearchModalOpen(false)}
              className="w-full mt-8 py-4 bg-[#185ADB] text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
            >
              Xem trên danh sách chính
            </button>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              {/* Icon cảnh báo */}
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <Trash2 size={32} />
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">Xác nhận xóa?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Sếp có chắc chắn muốn xóa nhiệm vụ <br />
                <span className="font-bold text-gray-700">"{taskToDelete?.taskName || taskToDelete?.taskContent}"</span>?
                <br />Hành động này không thể hoàn tác.
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 font-bold text-gray-600 hover:bg-gray-200 transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={loadingId !== null}
                  className="flex-1 py-3 rounded-2xl bg-red-500 font-bold text-white shadow-lg shadow-red-100 hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                >
                  {loadingId === taskToDelete?.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : "Xóa ngay"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};