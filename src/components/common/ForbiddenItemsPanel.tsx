import React from "react";
import { Sword, Flame, Scissors, BatteryCharging, Droplet } from "lucide-react";

interface ItemCategory {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  items: string[];
}

const categories: ItemCategory[] = [
  {
    icon: Sword,
    label: "Vũ khí",
    items: [
      "Súng, đạn, dao găm bị cấm tuyệt đối.",
      "Đồ chơi mô phỏng vũ khí cũng bị từ chối.",
    ],
  },
  {
    icon: Flame,
    label: "Chất cháy/nổ",
    items: [
      "Pháo, xăng, khí gas hay hóa chất dễ cháy nổ.",
      "Bật lửa, sơn aerosol cần hãng chấp thuận trước.",
    ],
  },
  {
    icon: Scissors,
    label: "Vật sắc nhọn",
    items: [
      "Dao, kéo, dụng cụ cắt gọt chỉ được ký gửi.",
      "Gậy golf, mũi tên và đồ thể thao sắc nhọn cấm xách tay.",
    ],
  },
  {
    icon: BatteryCharging,
    label: "Pin lithium",
    items: [
      "Pin rời trên 100Wh không được ký gửi.",
      "Pin hỏng, biến dạng bị từ chối vận chuyển.",
    ],
  },
  {
    icon: Droplet,
    label: "Chất lỏng > 100ml",
    items: [
      "Chất lỏng, gel, kem vượt 100ml cấm mang xách tay.",
      "Tổng tối đa 1 lít, đựng trong túi zip trong suốt.",
    ],
  },
];

const ForbiddenItemsPanel: React.FC = () => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">
        Vật phẩm cấm mang lên máy bay
      </h3>
      <div className="bg-white border rounded-lg divide-y">
        {categories.map(({ icon: Icon, label, items }) => (
          <details key={label} className="group">
            <summary className="flex items-center gap-2 p-4 cursor-pointer list-none">
              <Icon className="w-5 h-5 text-red-600" />
              <span className="font-medium">{label}</span>
            </summary>
            <ul className="px-4 pb-4 text-sm text-gray-600 list-disc ml-6">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
};

export default ForbiddenItemsPanel;

