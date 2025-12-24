import { sendOtp } from "@/services/auth/otpService";
import { useMutation } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

export const OtpInput = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);
  const navigate = useNavigate(); // ✅ FIX TÊN BIẾN

  const mutation = useMutation({
    mutationFn: sendOtp,
    onSuccess: () => {
      toast.success("Xác thực thành công!");
      navigate("/login");
    },
    onError: () => {
      toast.error("Mã OTP không chính xác hoặc đã hết hạn");
    },
  });

  const handleChange = (value, index) => {
    if (!/^[a-zA-Z0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.toUpperCase(); // ✅ chuẩn hoá OTP
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault(); // ✅ chặn paste ngoài ý muốn
    const data = e.clipboardData
      .getData("text")
      .trim()
      .slice(0, 6)
      .toUpperCase();

    if (!/^[A-Z0-9]{1,6}$/.test(data)) return;

    const newOtp = data.split("").concat(Array(6 - data.length).fill(""));
    setOtp(newOtp);

    inputRefs.current[Math.min(data.length, 5)]?.focus();
  };

  const handleSubmit = () => {
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      toast.warning("Vui lòng nhập đủ 6 ký tự OTP!");
      return;
    }

    mutation.mutate({ otp: otpValue });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">
            Xác thực mã OTP
          </h2>
          <p className="text-slate-500 mt-2">
            Nhập mã xác nhận gồm 6 ký tự
          </p>
        </div>

        <div
          className="flex justify-between gap-2 mb-8"
          onPaste={handlePaste}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-14 text-center text-xl font-bold uppercase
                         border-2 rounded-xl outline-none
                         focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={otp.includes("") || mutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700
                     disabled:bg-slate-300 text-white font-semibold
                     py-3 rounded-xl transition cursor-pointer"
        >
          {mutation.isPending ? "Đang xác thực..." : "Xác nhận"}
        </button>

        <p className="text-center mt-6 text-sm text-slate-500">
          Không nhận được mã?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-medium hover:underline"
          >
            Quay về trang đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
};