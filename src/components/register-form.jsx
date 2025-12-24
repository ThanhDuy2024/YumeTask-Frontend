import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner"; // ✅ THÊM

// Schema Zod
const schema = z.object({
  userName: z.string().nonempty("Họ và tên bắt buộc phải có!"),
  email: z
    .string()
    .email("Email không hợp lệ")
    .nonempty("Email bắt buộc phải có!"),
  password: z
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .nonempty("Password bắt buộc phải có!"),
});

export function RegisterForm(props) {
  const { registerApi } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await registerApi(data);
      if (res) {
        navigate("/login");
      }
    } catch (error) {
      // ✅ FIX QUAN TRỌNG: CHỈ HIỂN THỊ STRING
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Đăng ký thất bại, vui lòng thử lại";

      toast.error(message);
    }
  };

  return (
    <div className="flex flex-col gap-6" {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* FORM */}
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold text-[#185ADB]">
                  Chào mừng bạn đến với Yume
                </h1>
                <p className="text-muted-foreground">
                  Đăng ký để cùng nhau lập kế hoạch nào!!!
                </p>
              </div>

              <Field>
                <FieldLabel>Họ và tên</FieldLabel>
                <Input
                  placeholder="VD: Nguyễn Văn A"
                  {...register("userName")}
                />
                {errors.userName && (
                  <p className="text-red-500 text-sm">
                    {errors.userName.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">
                    {errors.email.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel>Password</FieldLabel>
                <Input type="password" {...register("password")} />
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </Field>

              <Button
                type="submit"
                className="bg-blue-500 text-white hover:bg-blue-700"
              >
                Đăng ký
              </Button>

              <FieldSeparator>Hoặc tiếp tục với</FieldSeparator>

              <Field className="grid grid-cols-3 gap-4">
                <Button variant="outline" type="button">Apple</Button>
                <Button variant="outline" type="button">Google</Button>
                <Button variant="outline" type="button">Meta</Button>
              </Field>

              <FieldDescription className="text-center">
                Bạn đã có tài khoản?{" "}
                <Link to="/login" className="text-blue-500 hover:underline">
                  Đăng nhập ngay
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          {/* IMAGE */}
          <div className="bg-muted relative hidden md:block">
            <img
              src="/d035b2b1891c5a3d9ced344c33a77f94.jpg"
              alt="Register"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}