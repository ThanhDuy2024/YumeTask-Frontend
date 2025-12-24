/* eslint-disable no-unused-vars */
import { create } from "zustand";
import { toast } from "sonner";
import { register } from "@/services/auth/registerService";
import { login } from "@/services/auth/loginService";
import { profile } from "@/services/auth/profileService";

export const useAuthStore = create((set) => ({
  user: null,
  loading: null,  // FIX
  error: null,

  registerApi: async (data) => {
    set({ loading: true, error: null });

    try {
      const res = await register(data);
      toast.success("Đăng ký thành công");
      return res
    } catch (error) {
      set({ error: error.response?.data?.message || "Đăng ký thất bại" });
      toast.error(error.response?.data?.message);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  loginApi: async (data) => {
    set({ loading: true, error: null });

    try {
      const res = await login(data);
      toast.success("Đăng nhập thành công");
      return res;
    } catch (error) {
      set({ error: error?.response?.data?.message || "" });
      toast.error(error?.response?.data?.message);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  profileApi: async () => {
    set({ loading: true, error: null });  // FIX

    try {
      const res = await profile();
      set({ user: res.data, loading: false });
      return res
    } catch (error) {
      set({ user: null, loading: false }); // FIX
      return null;
    }
  }
}));