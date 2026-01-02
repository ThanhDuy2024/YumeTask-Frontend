import { axiosInstance } from "../axios.service"

export const createTask = async (data) => {
  const res = await axiosInstance.post("task/create", data);
  return res.data;
}

export const createTaskAdvan = async (data) => {
  const res = await axiosInstance.post("task/create/advan", data);
  return res.data;
}