export interface PopularDestination {
  id: number;
  title: string;
  subtitle: string;
  price: string;
  image: string;
  badge: string;
  isLarge?: boolean;
}

export const popularDestinations: PopularDestination[] = [
  {
    id: 1,
    title: "Hồ Chí Minh ✈ Hà Nội",
    subtitle: "Thời gian khởi hành: 06/01/2025 - 03/01/2025",
    price: "299.000 đ",
    image:
      "https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    badge: "LỊCH BAY SÀI GÒN - HÀ NỘI",
    isLarge: true,
  },
  {
    id: 2,
    title: "Hồ Chí Minh ✈ Hà Nội",
    subtitle: "Thời gian khởi hành: 06/01/2025 - 03/01/2025",
    price: "299.000 đ/chiều",
    image:
      "https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    badge: "LỊCH BAY SÀI GÒN - HÀ NỘI",
  },
  {
    id: 3,
    title: "Hà Nội ✈ Vinh",
    subtitle: "Thời gian khởi hành: 06/01/2025 - 03/01/2025",
    price: "299.000 đ/chiều",
    image:
      "https://images.pexels.com/photos/23529021/pexels-photo-23529021.jpeg",
    badge: "LỊCH BAY HÀ NỘI - VINH",
  },
  {
    id: 4,
    title: "Sài Gòn ✈ Phú Quốc",
    subtitle: "Thời gian khởi hành: 06/01/2025 - 03/01/2025",
    price: "299.000 đ/chiều",
    image:
      "https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    badge: "LỊCH BAY SÀI GÒN - PHÚ QUỐC",
  },
  {
    id: 5,
    title: "Hà Nội ✈ Đà Nẵng",
    subtitle: "Thời gian khởi hành: 06/01/2025 - 03/01/2025",
    price: "686.868 đ/chiều",
    image:
      "https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    badge: "LỊCH BAY HÀ NỘI - ĐÀ NẴNG",
  },
];
