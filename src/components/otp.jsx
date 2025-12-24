import { sendOtp } from "@/services/auth/otpService";
import { useMutation } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export const OtpInput = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);
  const naviagte = useNavigate();
  const mutation = useMutation({
    mutationFn: sendOtp,
    onSuccess: () => {
      toast.success("Xác thực thành công!");
      naviagte("/login")
    },
    onError: (error) => {
      toast.error("Mã OTP không chính xác hoặc đã hết hạn");
      console.error('Error:', error);
    }
  });

  const handleChange = (value, index) => {
    // 1. CẬP NHẬT REGEX: Cho phép chữ và số (a-z, A-Z, 0-9)
    // Nếu muốn chỉ chữ in hoa, có thể dùng value.toUpperCase()
    if (!/^[a-zA-Z0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const data = e.clipboardData.getData("text").slice(0, 6);
    // 2. CẬP NHẬT REGEX KHI PASTE: Chấp nhận chữ và số
    if (!/^[a-zA-Z0-9]+$/.test(data)) return;

    const newOtp = data.split("").concat(Array(6 - data.length).fill(""));
    setOtp(newOtp);
    
    const nextFocusIndex = Math.min(data.length, 5);
    inputRefs.current[nextFocusIndex].focus();
  };

  const getOtpValue = () => {
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      toast.warning("Vui lòng nhập đầy đủ 6 ký tự!");
      return;
    }
    mutation.mutate({
      otp: otpValue
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Xác thực mã OTP</h2>
          <p className="text-slate-500 mt-2">Nhập mã xác nhận (bao gồm chữ và số)</p>
        </div>

        <div className="flex justify-between gap-2 mb-8" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              // 3. THAY ĐỔI: Bỏ inputMode="numeric" để hiện bàn phím đầy đủ trên mobile
              inputMode="text" 
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-14 text-center text-xl font-bold uppercase
                         border-2 rounded-xl transition-all duration-200
                         focus:border-blue-500 focus:ring-4 focus:ring-blue-100 
                         outline-none border-slate-200 text-slate-700
                         hover:border-slate-300"
            />
          ))}
        </div>

        <button
          onClick={getOtpValue}
          disabled={otp.some(v => v === "") || mutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 
                     disabled:cursor-not-allowed text-white font-semibold 
                     py-3 rounded-xl transition-all duration-200 shadow-lg 
                     shadow-blue-200 active:scale-[0.98] cursor-pointer"
        >
          {mutation.isPending ? "Đang xác thực..." : "Xác nhận"}
        </button>
        
        <p className="text-center mt-6 text-sm text-slate-500">
          Không nhận được mã? <Link className="text-blue-600 font-medium hover:underline" to={"/register"}>Quay về trang đăng ký</Link>
        </p>
      </div>
    </div>
  );
};