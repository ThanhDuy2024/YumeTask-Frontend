import { axiosInstance } from "../axios.service";

export const login = async (data) => {
  const res = await axiosInstance.post("account/login", data);
  return res.data;
}