import { Outlet, Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { logout } from "@/services/auth/logoutService";
import { toast } from "sonner";
import { useState, useEffect } from "react"; // Gom chung import
import { profile } from "@/services/auth/profileService";

export const MainLayout = () => {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const data = await profile();
        // Kiểm tra cấu trúc data trả về từ API của bạn
        setUser(data.data); 
      } catch (error) {
        console.error("Lỗi lấy profile:", error);
        // Nếu lỗi do hết hạn token, nên điều hướng về login
        // navigate("/login");
      }
    };

    fetchUserProfile();
  }, []);

  const funclogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      toast.success("Đăng xuất thành công");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Đăng xuất thất bại");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-1">
          <Link to="/" className="ml-2 font-bold text-xl text-[#185ADB]">
            Yume task
          </Link>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative hidden md:block w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm nhiệm vụ..."
              className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* SỬA LỖI TẠI ĐÂY: Dùng user?.userName để không bị crash khi user chưa load xong */}
            <span className="hidden sm:block font-medium text-gray-700 text-sm">
              {user ? user.userName : "Đang tải..."}
            </span>

            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full border border-gray-200">
                  <img
                    alt="User avatar"
                    /* Nếu API có trả về avatar thì dùng, không thì dùng ảnh mặc định */
                    src={user?.avatar || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                  />
                </div>
              </div>
              <ul
                tabIndex={-1}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow"
              >
                <li>
                  <Link to="/profile" className="justify-between">
                    Profile
                    <span className="badge">New</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={funclogout}
                    disabled={loggingOut}
                    className="w-full text-left text-red-500"
                  >
                    {loggingOut ? "Đang đăng xuất..." : "Logout"}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Nội dung các trang con sẽ hiển thị ở đây */}
      <main className="min-h-screen bg-gray-50">
        <Outlet />
      </main>
    </>
  );
};