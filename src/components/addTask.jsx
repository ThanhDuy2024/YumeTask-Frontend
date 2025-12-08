/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createTask } from "@/services/tasks/createTaskService";

const AddTask = ({ handleNewTaskAdded }) => {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const addTask = async () => {
    const data = {
      taskContent: newTaskTitle,
      status: "init"
    }

    try {
      createTask(data);
      toast.success(`Tạo nhiệm vụ ${data.taskContent} thành công`)
      handleNewTaskAdded();
      setNewTaskTitle("");
    } catch (error) {
      toast.error("Tạo nhiệm vụ thất bại");
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      addTask();
    }
  };

  return (
    <Card className="p-6 border-0 bg-gradient-card shadow-custom-lg">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="text"
          placeholder="Cần phải làm gì?"
          className="h-12 text-base bg-slate-50 sm:flex-1 border-border/50 focus:border-primary/50 focus:ring-primary/20"
          value={newTaskTitle}
          onChange={(even) => setNewTaskTitle(even.target.value)}
          onKeyPress={handleKeyPress}
        />

        <Button
          size="xl"
          className="px-6 cursor-pointer"
          onClick={addTask}
          disabled={!newTaskTitle.trim()}
        >
          <Plus className="size-5" />
          Thêm
        </Button>
      </div>
    </Card>
  );
};

export default AddTask;