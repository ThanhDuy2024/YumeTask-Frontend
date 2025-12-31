import { axiosInstance } from "../axios.service"

export const taskList = async (status, page) => {
  const res = await axiosInstance.get(`task/list?status=${status}&skip=0&limit=4&page=${page}`);
  return res.data;
}