import { create } from "zustand";
import { axiosInstance } from "@/services/axios.service";
import { toast } from "sonner";

export const useAuthStore = create((set) => ({
  user: null,
  loading: null,
  error: null,

  registerApi: async (data) => {
    set({
      loading: true, 
      error: null
    });

    try {
      const res = await axiosInstance.post("account/create", data);
      toast.success("Đăng ký thành công!");
      return res.data;
    } catch (error) {
      set({error: error.response?.data?.message || "Đăng ký thất bại" });
      toast.error(error.response?.data?.message);
      return null
    } finally {
      set({ loading: false });
    }
  },
}))