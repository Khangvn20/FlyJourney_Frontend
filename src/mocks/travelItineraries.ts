import type { TravelItinerary } from "../shared/types";

export const travelItineraries: TravelItinerary[] = [
  {
    id: "hcm-hanoi-3days",
    title: "Hành trình khám phá Hà Nội 3 ngày 2 đêm từ TP.HCM",
    description:
      "Trải nghiệm đầy đủ vẻ đẹp thủ đô nghìn năm tuổi với lịch trình được sắp xếp tối ưu, từ những khu phố cổ đến các địa danh lịch sử nổi tiếng.",
    duration: "3 ngày 2 đêm",
    priceRange: {
      min: 1299000,
      max: 1449000,
    },
    currency: "VND",
    image:
      "https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop",
    highlights: [
      "Khám phá Phố cổ Hà Nội với 36 phố phường",
      "Thưởng thức ẩm thực đường phố authentic",
      "Tham quan Lăng Bác và Chùa Một Cột",
      "Dạo quanh Hồ Hoàn Kiếm và nghe huyền thoại Gươm Thiêng",
      "Shopping tại Chợ Đồng Xuân và Night Market",
    ],
    itinerary: [
      {
        day: 1,
        title: "Khởi hành từ TP.HCM - Khám phá Phố cổ Hà Nội",
        description:
          "Bắt đầu hành trình với chuyến bay sáng từ TP.HCM đến Hà Nội",
        activities: [
          "06:00 - Khởi hành từ sân bay Tân Sơn Nhất",
          "08:30 - Đến sân bay Nội Bài, di chuyển về trung tâm",
          "10:00 - Check-in khách sạn, nghỉ ngơi",
          "14:00 - Khám phá Phố cổ Hà Nội (Phố Hàng Mã, Hàng Bạc, Hàng Bông)",
          "16:00 - Thưởng thức cà phê trứng tại Café Giảng",
          "18:00 - Dạo quanh Hồ Hoàn Kiếm và Cầu Thê Húc",
          "19:30 - Ăn tối với món bún chả Obama",
        ],
        tips: "Mang theo áo ấm vì thời tiết Hà Nội có thể lạnh hơn TP.HCM",
      },
      {
        day: 2,
        title: "Tham quan các di tích lịch sử",
        description:
          "Khám phá những địa danh văn hóa, lịch sử nổi tiếng của Hà Nội",
        activities: [
          "08:00 - Ăn sáng với phở Hà Nội tại phố Lý Quốc Sư",
          "09:00 - Tham quan Lăng Chủ tịch Hồ Chí Minh",
          "10:30 - Thăm Chùa Một Cột và Văn Miếu Quốc Tử Giám",
          "14:00 - Ăn trưa và nghỉ ngơi",
          "15:30 - Khám phá Bảo tàng Dân tộc học Việt Nam",
          "17:00 - Shopping tại Chợ Đồng Xuân",
          "19:00 - Thưởng thức bia hơi và nem nướng tại phố Tạ Hiện",
        ],
        tips: "Lăng Bác đóng cửa vào thứ 2 và thứ 6, hãy lên kế hoạch phù hợp",
      },
      {
        day: 3,
        title: "Trải nghiệm cuối cùng và trở về TP.HCM",
        description: "Những giờ cuối cùng tại Hà Nội với shopping và ẩm thực",
        activities: [
          "08:00 - Ăn sáng với bánh mì Hà Nội",
          "09:00 - Dạo chợ Weekend Night Market (nếu là cuối tuần)",
          "10:30 - Mua sắm quà lưu niệm tại phố Hàng Ma",
          "12:00 - Ăn trưa với bún bò Nam Bộ",
          "14:00 - Check-out khách sạn và di chuyển ra sân bay",
          "16:00 - Làm thủ tục tại sân bay Nội Bài",
          "18:00 - Khởi hành về TP.HCM",
          "20:30 - Đến sân bay Tân Sơn Nhất",
        ],
        tips: "Dành thời gian mua đặc sản Hà Nội như chả cá, bánh com, chè",
      },
    ],
    tips: [
      "Thời tiết Hà Nội có thể thay đổi đột ngột, nên mang theo áo khoác",
      "Giao thông Hà Nội đông đúc, nên sử dụng Grab hoặc taxi",
      "Thử các món ăn đường phố nhưng chọn những quán có đông khách",
      "Mặc cả khi mua sắm tại chợ và các cửa hàng nhỏ",
      "Mang theo máy ảnh để chụp lại những khoảnh khắc đẹp",
    ],
    includedServices: [
      "Vé máy bay khứ hồi TP.HCM - Hà Nội",
      "Khách sạn 3 sao trung tâm (2 đêm)",
      "Bữa sáng tại khách sạn",
      "Tour guide trong ngày thứ 2",
      "Vé tham quan các điểm đến",
      "Bảo hiểm du lịch",
    ],
    flightPrices: {
      economy: 2500000,
      business: 4800000,
    },
    author: "Nguyễn Minh Anh",
    publishedDate: "10/01/2025",
    readTime: "8 phút đọc",
  },
  {
    id: "hcm-danang-4days",
    title: "Khám phá Đà Nẵng - Hội An 4 ngày 3 đêm",
    description:
      "Hành trình tuyệt vời khám phá thành phố Đà Nẵng hiện đại và phố cổ Hội An thơ mộng.",
    duration: "4 ngày 3 đêm",
    priceRange: {
      min: 1599000,
      max: 1899000,
    },
    currency: "VND",
    image:
      "https://images.pexels.com/photos/5207262/pexels-photo-5207262.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop",
    highlights: [
      "Chinh phục Bà Nà Hills và cầu Vàng nổi tiếng",
      "Khám phá phố cổ Hội An với đèn lồng rực rỡ",
      "Thưởng thức hải sản tươi ngon tại bãi biển Mỹ Khê",
      "Tham quan Ngũ Hành Sơn và chùa Linh Ứng",
      "Trải nghiệm làng nghề truyền thống Tra Que",
    ],
    itinerary: [
      {
        day: 1,
        title: "TP.HCM - Đà Nẵng - Bà Nà Hills",
        description: "Khởi đầu hành trình với Bà Nà Hills huyền thoại",
        activities: [
          "06:30 - Khởi hành từ sân bay Tân Sơn Nhất",
          "08:45 - Đến sân bay Đà Nẵng",
          "09:30 - Di chuyển đến Bà Nà Hills",
          "10:30 - Trải nghiệm cáp treo dài nhất thế giới",
          "11:00 - Khám phá French Village và Cầu Vàng",
          "13:00 - Ăn trưa tại Bà Nà",
          "15:00 - Tham quan Le Jardin D'Amour và Fantasy Park",
          "17:30 - Trở về Đà Nẵng, check-in khách sạn",
          "19:30 - Ăn tối hải sản tại bãi biển Mỹ Khê",
        ],
      },
      {
        day: 2,
        title: "Đà Nẵng - Ngũ Hành Sơn - Hội An",
        description: "Từ Đà Nẵng di chuyển đến Hội An qua Ngũ Hành Sơn",
        activities: [
          "08:00 - Ăn sáng và check-out",
          "09:00 - Tham quan Ngũ Hành Sơn",
          "11:00 - Chùa Linh Ứng và hang Huyền Không",
          "13:00 - Ăn trưa tại Đà Nẵng",
          "14:30 - Di chuyển đến Hội An (45 phút)",
          "15:30 - Check-in khách sạn tại Hội An",
          "16:30 - Khám phá phố cổ Hội An",
          "18:00 - Thưởng thức cao lầu và white rose",
          "20:00 - Ngắm đèn lồng về đêm tại sông Thu Bồn",
        ],
      },
      {
        day: 3,
        title: "Làng rau Tra Que - Bãi biển An Bàng",
        description: "Trải nghiệm văn hóa nông nghiệp và thư giãn bên bờ biển",
        activities: [
          "08:00 - Ăn sáng tại khách sạn",
          "09:00 - Tham quan làng rau Tra Que",
          "10:30 - Trải nghiệm trồng rau và nấu ăn với người dân địa phương",
          "12:30 - Ăn trưa với các món ăn vừa nấu",
          "14:00 - Di chuyển đến bãi biển An Bàng",
          "14:30 - Tắm biển và thư giãn",
          "17:00 - Trở về Hội An",
          "18:30 - Ăn tối và dạo phố cổ",
          "20:30 - Mua sắm đồ lưu niệm",
        ],
      },
      {
        day: 4,
        title: "Hội An - Đà Nẵng - TP.HCM",
        description: "Kết thúc hành trình và bay về TP.HCM",
        activities: [
          "08:00 - Ăn sáng và check-out",
          "09:00 - Mua sắm cuối cùng tại chợ Hội An",
          "11:00 - Di chuyển về sân bay Đà Nẵng",
          "13:00 - Ăn trưa tại sân bay",
          "14:30 - Làm thủ tục bay",
          "16:30 - Khởi hành về TP.HCM",
          "18:45 - Đến sân bay Tân Sơn Nhất",
        ],
      },
    ],
    tips: [
      "Mang theo kem chống nắng vì miền Trung nắng rất mạnh",
      "Chuẩn bị giày đi bộ thoải mái cho việc khám phá",
      "Thời tiết có thể thay đổi, mang theo áo mưa nhẹ",
      "Thử các món đặc sản: cao lầu, mì Quảng, bánh bèo",
    ],
    includedServices: [
      "Vé máy bay khứ hồi TP.HCM - Đà Nẵng",
      "Khách sạn 4 sao (3 đêm)",
      "Bữa sáng hàng ngày",
      "Xe ôtô đưa đón và tham quan",
      "Vé tham quan các điểm đến",
      "Hướng dẫn viên tiếng Việt",
      "Bảo hiểm du lịch",
    ],
    flightPrices: {
      economy: 2200000,
      business: 4200000,
    },
    author: "Trần Việt Hùng",
    publishedDate: "08/01/2025",
    readTime: "10 phút đọc",
  },
];

// Helper functions
export const getTravelItineraryById = (
  id: string
): TravelItinerary | undefined => {
  return travelItineraries.find((itinerary) => itinerary.id === id);
};

export const getTravelItinerariesForHomepage = (
  limit: number = 2
): TravelItinerary[] => {
  return travelItineraries.slice(0, limit);
};

export default travelItineraries;
