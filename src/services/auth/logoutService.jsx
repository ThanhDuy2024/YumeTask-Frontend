import { axiosInstance } from "../axios.service"

export const logout = async () => {
  const res = await axiosInstance.get("account/logout");
  return res.data;
}