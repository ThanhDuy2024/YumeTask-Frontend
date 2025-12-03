import { axiosInstance } from "../axios.service";

export const register = async (data) => {
  const res = await axiosInstance.post("account/create", data);
  return res.data;
} 