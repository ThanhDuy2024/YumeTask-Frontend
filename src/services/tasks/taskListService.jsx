import { axiosInstance } from "../axios.service"

export const taskList = async (status) => {
  const res = await axiosInstance.get(`task/list?status=${status}&skip=0&limit=5&page=1`);
  return res.data;
}