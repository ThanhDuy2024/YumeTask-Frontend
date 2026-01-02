import React, { useState } from "react";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "./ui/button";
import { Calendar, CheckCircle2, Circle, SquarePen, Trash2, Clock, AlignLeft } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea"; // Giả định bạn có component này
import { toast } from "sonner";
import { taskDelete } from "@/services/tasks/taskDeleteService";
import { updateStatus, updateTaskAdvan } from "@/services/tasks/updateTaskService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import moment from "moment/moment";

const TaskCard = ({ task, index, handleTaskChanged }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Khởi tạo State (Hãy dùng tên key trùng với Backend yêu cầu)
  const [formData, setFormData] = useState({
    taskContent: task.taskContent || "",
    taskNote: task.taskNote || "",
    dateTime: task.dateTime || new Date().toISOString().split('T')[0], // Đổi startDate thành dateTime cho đồng bộ
    startTime: task.startTime || "00:00",
    endTime: task.endTime || "23:59",
  });

  const deleteTask = async (taskId) => {
    try {
      await taskDelete(taskId);
      toast.success("Xóa nhiệm vụ thành công");
      await handleTaskChanged();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateTaskAdvan(task.id, formData);
      toast.success("Cập nhật nhiệm vụ thành công");
      setIsModalOpen(false);
      await handleTaskChanged();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật");
    }
  };

  const toggleTaskCompleteButton = async () => {
    const newStatus = task.status === "init" ? "complete" : "init";
    try {
      await updateStatus(task.id, { status: newStatus });
      toast.success("Cập nhật trạng thái thành công");
      await handleTaskChanged();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Card
        className={cn(
          "p-4 bg-gradient-card border-0 shadow-custom-md hover:shadow-custom-lg transition-all duration-200 animate-fade-in group",
          task.status === "complete" && "opacity-75"
        )}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "flex-shrink-0 size-8 rounded-full",
              task.status === "complete" ? "text-success" : "text-muted-foreground"
            )}
            onClick={toggleTaskCompleteButton}
          >
            {task.status === "complete" ? <CheckCircle2 className="size-5" /> : <Circle className="size-5" />}
          </Button>

          <div className="flex-1 min-w-0">
            <p className={cn("text-base font-medium", task.status === "complete" && "line-through text-muted-foreground")}>
              {task.taskContent}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="size-3" /> {`Ngày bắt đầu làm ${moment(task.dateTime).format("DD/MM/YYYY")}` || `Ngày tạo: ${task.createdAt}`}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3" /> Thời gian làm: {task.startTime || "00:00"} - {task.endTime || "23:59"}
              </span>
            </div>
          </div>

          <div className="hidden gap-2 group-hover:inline-flex animate-slide-up">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-info"
              onClick={() => setIsModalOpen(true)}
            >
              <SquarePen className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-destructive"
              onClick={() => deleteTask(task.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* MODAL CHỈNH SỬA CHI TIẾT */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <SquarePen className="size-5 text-primary" />
              Chỉnh sửa nhiệm vụ
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Tên nhiệm vụ */}
            <div className="grid gap-2">
              <label className="text-sm font-semibold flex items-center gap-2">Tên nhiệm vụ</label>
              <Input
                value={formData.taskContent}
                onChange={(e) => setFormData({ ...formData, taskContent: e.target.value })}
                placeholder="Nhập tên nhiệm vụ..."
                className="rounded-xl"
              />
            </div>

            {/* Ghi chú */}
            <div className="grid gap-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <AlignLeft className="size-4" /> Ghi chú
              </label>
              <Textarea
                value={formData.taskNote}
                onChange={(e) => setFormData({ ...formData, taskNote: e.target.value })}
                placeholder="Thêm mô tả chi tiết..."
                className="rounded-xl min-h-[100px]"
              />
            </div>

            {/* Thời gian */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-semibold flex items-center gap-2">Bắt đầu</label>
                <Input
                  type="time"
                  value={formData.startTime || "00:00"}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold flex items-center gap-2">Kết thúc</label>
                <Input
                  type="time"
                  value={formData.endTime || "23:59"}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="size-4" /> Ngày thực hiện
            </label>
            <Input
              type="date"
              // 1. Sửa value trỏ đúng về dateTime
              value={formData.dateTime || new Date().toISOString().split('T')[0]}
              // 2. onChange cập nhật đúng vào dateTime
              onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
              className="rounded-xl"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl">
              Hủy
            </Button>
            <Button onClick={handleUpdate} className="rounded-xl" variant="default">
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskCard;