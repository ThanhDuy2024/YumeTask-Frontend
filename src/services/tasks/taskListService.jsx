import { axiosInstance } from "../axios.service"

export const taskList = async (status, time, page) => {
  const res = await axiosInstance.get(`task/list?status=${status}&time=${time}&skip=0&limit=4&page=${page}`);
  return res.data;
}

export const taskAll = async () => {
  const res = await axiosInstance.get('task/all/list')
  return res.data
}