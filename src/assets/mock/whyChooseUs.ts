export interface WhyChooseUsItem {
  iconType: "dollar" | "shield" | "clock";
  iconColor: string;
  title: string;
  description: string;
}

export const whyChooseUs: WhyChooseUsItem[] = [
  {
    iconType: "dollar",
    iconColor: "text-blue-600",
    title: "Giá vé tốt nhất, ưu đãi hấp dẫn",
    description:
      "Đặt vé máy bay với giá rẻ nhất thị trường, nhiều chương trình khuyến mãi hấp dẫn",
  },
  {
    iconType: "shield",
    iconColor: "text-green-600",
    title: "Đặt vé dễ dàng, thanh toán đa dạng",
    description:
      "Giao diện thân thiện, quy trình đặt vé đơn giản, hỗ trợ nhiều hình thức thanh toán",
  },
  {
    iconType: "clock",
    iconColor: "text-orange-600",
    title: "Thông báo tình trạng vé nhanh",
    description:
      "Cập nhật tình trạng chuyến bay realtime, thông báo nhanh chóng qua email và SMS",
  },
];
