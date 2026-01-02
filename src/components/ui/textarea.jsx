import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({
  className,
  ...props
}) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Cấu trúc cơ bản và màu nền
        "flex min-h-24 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-all outline-none md:text-sm",
        "placeholder:text-muted-foreground dark:bg-input/30",
        
        //Focus màu xanh nước biển đồng bộ (#185ADB)
        "focus-visible:border-[#185ADB] focus-visible:ring-[#185ADB]/20 focus-visible:ring-[4px]",
        
        //Trạng thái lỗi
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        
        // Vô hiệu hóa
        "disabled:cursor-not-allowed disabled:opacity-50",
        
        className
      )}
      {...props} />
  );
}

export { Textarea }