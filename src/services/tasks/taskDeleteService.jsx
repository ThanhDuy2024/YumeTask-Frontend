import { axiosInstance } from "../axios.service"

export const taskDelete = async (id) => {
  const res = await axiosInstance.delete(`task/delete/${id}`);
  return res.data;
} 