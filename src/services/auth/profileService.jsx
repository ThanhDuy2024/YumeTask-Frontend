import { axiosInstance } from "../axios.service";

export const profile = async () => {
  const res = await axiosInstance.get("account/profile");
  return res.data;
}