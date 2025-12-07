import { axiosInstance } from "../axios.service"

export const taskList = async () => {
  const res = await axiosInstance.get("task/list?skip=0&limit=5&page=1");
  return res.data;
}