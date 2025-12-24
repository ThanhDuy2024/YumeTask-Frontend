import { axiosInstance } from "../axios.service"

export const sendOtp = async (data) => {
  console.log(data);
  const res = await axiosInstance.post("account/otp", data);
  return res.data
}