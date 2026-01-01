import { FilterType } from "@/lib/data";
import { Filter, CalendarDays } from "lucide-react"; // Thêm icon lịch cho đẹp
import { Button } from "./ui/button";

const TimeFilterType = {
  all: "Tất cả",
  today: "Hôm nay",
  week: "Tuần này",
  month: "Tháng này",
};

const StatsAndFilters = ({
  filter = "all",
  setFilter,
  timeRange = "all", // Props mới
  setTimeRange,       // Props mới
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Nhóm 1: Lọc theo Trạng thái (Code cũ của bạn) */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          {Object.keys(FilterType).map((type) => (
            <Button
              key={type}
              variant={filter === type ? "gradient" : "ghost"}
              size="sm"
              className="capitalize"
              onClick={() => setFilter(type)}
            >
              <Filter className="mr-2 size-4" />
              {FilterType[type]}
            </Button>
          ))}
        </div>
      </div>

      {/* Nhóm 2: Lọc theo Thời gian (Phần thêm mới) */}
      <div className="flex flex-wrap items-center gap-2 p-1 border rounded-lg bg-gray-50/50 w-fit">
        <span className="px-3 text-sm font-medium text-gray-500">Thời gian:</span>
        {Object.keys(TimeFilterType).map((time) => (
          <Button
            key={time}
            variant={timeRange === time ? "default" : "ghost"} // Hoặc "outline" tùy theme của bạn
            size="sm"
            className="h-8 text-xs transition-all"
            onClick={() => setTimeRange(time)}
          >
            <CalendarDays className="mr-1 size-3" />
            {TimeFilterType[time]}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default StatsAndFilters;