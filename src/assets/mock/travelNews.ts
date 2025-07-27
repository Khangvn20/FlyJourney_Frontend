export interface TravelNews {
  id: number;
  title: string;
  description: string;
  image: string;
  date: string;
}

export const travelNews: TravelNews[] = [
  {
    id: 1,
    title: "Vietjet đồng hành cùng All gọi thiều và tôi...",
    description:
      "Hành khách sẽ được tận hưởng Thần Chú Chăm Sóc từ đội ngũ tiếp viên hàng không chuyên nghiệp của Vietjet...",
    image:
      "https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
    date: "15/01/2025",
  },
  {
    id: 2,
    title: "Vietnam Airlines khát vọng đưng bay thẳng...",
    description:
      "Ngày 04/10, đường bay thẳng đầu tiên của Vietnam Airlines từ Hà Nội đến phố cổ Hội An chính thức được khai trương...",
    image:
      "https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
    date: "12/01/2025",
  },
  {
    id: 3,
    title: "Chuyến bay mang thông điệp bảo vệ của...",
    description:
      "Chuyến bay mang ý nghĩa VN1157 từ TP.HCM đi Paris đã khởi hành thành công từ sân bay Tân Sơn Nhất trong hành trình...",
    image:
      "https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
    date: "10/01/2025",
  },
];
