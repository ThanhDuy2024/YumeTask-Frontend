import { create } from "zustand";
import { toast } from "sonner";
import { register } from "@/services/auth/loginService";

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
      const res = register(data);
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