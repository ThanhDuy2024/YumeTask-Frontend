import { axiosInstance } from "../axios.service"

export const updateOneTask = async (id, data) => {
  const res = await axiosInstance.put(`task/update/${id}`, data);
  return res.data;
}

export const updateStatus = async (id, data) => {
  const res = await axiosInstance.put(`task/update/status/${id}`, data);
  return res.data;
}