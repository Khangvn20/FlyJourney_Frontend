import type { NewsItem } from "../../shared/types";

export const newsData: NewsItem[] = [
  {
    id: 1,
    title:
      "Hà Nội mở cửa trở lại các điểm du lịch sau mùa dịch - Cơ hội vàng cho du khách",
    summary:
      "Sau thời gian tạm đóng cửa, các điểm du lịch nổi tiếng tại Hà Nội đã chính thức mở cửa đón khách trở lại với nhiều chương trình ưu đãi hấp dẫn.",
    content:
      "Thủ đô Hà Nội đã chính thức mở cửa trở lại các điểm du lịch, khu vui chơi giải trí sau thời gian dài tạm đóng cửa do ảnh hưởng của dịch bệnh. Đây được xem là cơ hội vàng cho du khách trong và ngoài nước có thể trở lại khám phá vẻ đẹp của thủ đô nghìn năm tuổi...",
    image:
      "https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop",
    author: "Nguyễn Văn An",
    date: "15/01/2025",
    readTime: "5 phút đọc",
    views: "2.5K",
    category: "Tin tức du lịch",
    isFeatured: true,
  },
  {
    id: 2,
    title: "TP.HCM ra mắt tour du lịch đêm khám phá phố cổ Sài Gòn",
    summary:
      "Chương trình tour mới giúp du khách khám phá vẻ đẹp Sài Gòn về đêm với những trải nghiệm độc đáo.",
    image:
      "https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
    author: "Trần Thị Bình",
    date: "14/01/2025",
    readTime: "4 phút đọc",
    views: "1.8K",
    category: "Điểm đến",
  },
  {
    id: 3,
    title: "Giá vé máy bay nội địa giảm mạnh trong tháng 2/2025",
    summary:
      "Các hãng hàng không đồng loạt giảm giá vé để kích thích nhu cầu du lịch dịp đầu năm.",
    image:
      "https://images.pexels.com/photos/358319/pexels-photo-358319.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
    author: "Lê Hoàng Minh",
    date: "13/01/2025",
    readTime: "3 phút đọc",
    views: "3.2K",
    category: "Hàng không",
  },
  {
    id: 4,
    title: "Đà Nẵng chuẩn bị cho mùa du lịch 2025 với nhiều sự kiện hấp dẫn",
    summary:
      "Thành phố Đà Nẵng công bố kế hoạch tổ chức nhiều lễ hội, sự kiện văn hóa phục vụ khách du lịch.",
    image:
      "https://images.pexels.com/photos/5207262/pexels-photo-5207262.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
    author: "Phạm Thị Cúc",
    date: "12/01/2025",
    readTime: "6 phút đọc",
    views: "1.9K",
    category: "Sự kiện",
  },
  {
    id: 5,
    title: "Phú Quốc đạt kỷ lục đón khách quốc tế trong tháng đầu năm",
    summary:
      "Đảo ngọc Phú Quốc tiếp tục khẳng định vị thế là điểm đến hàng đầu của Việt Nam.",
    image:
      "https://images.pexels.com/photos/3355788/pexels-photo-3355788.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
    author: "Hoàng Văn Đức",
    date: "11/01/2025",
    readTime: "4 phút đọc",
    views: "2.7K",
    category: "Thống kê",
  },
  {
    id: 6,
    title: "Nha Trang ra mắt khu du lịch sinh thái mới với công nghệ AR/VR",
    summary:
      "Công viên chủ đề mới tại Nha Trang hứa hẹn mang đến trải nghiệm du lịch hiện đại và thú vị.",
    image:
      "https://images.pexels.com/photos/23529021/pexels-photo-23529021.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
    author: "Vũ Thị Em",
    date: "10/01/2025",
    readTime: "5 phút đọc",
    views: "1.4K",
    category: "Công nghệ",
  },
  {
    id: 7,
    title: "Hạ Long được bình chọn là vịnh đẹp nhất thế giới năm 2025",
    summary:
      "Vịnh Hạ Long một lần nữa khẳng định vị thế trên bản đồ du lịch thế giới.",
    image:
      "https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
    author: "Đỗ Văn Phước",
    date: "09/01/2025",
    readTime: "3 phút đọc",
    views: "4.1K",
    category: "Vinh danh",
  },
  {
    id: 8,
    title: "Việt Nam được vinh danh điểm đến an toàn nhất Đông Nam Á",
    summary:
      "Theo báo cáo mới nhất, Việt Nam dẫn đầu khu vực về các tiêu chí an toàn du lịch.",
    image:
      "https://images.pexels.com/photos/5207262/pexels-photo-5207262.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
    author: "Mai Thị Lan",
    date: "08/01/2025",
    readTime: "4 phút đọc",
    views: "3.8K",
    category: "Vinh danh",
  },
];

// Helper functions để lọc data
export const getFeaturedNews = (): NewsItem | undefined => {
  return newsData.find((news) => news.isFeatured);
};

export const getNewsList = (excludeFeatured: boolean = true): NewsItem[] => {
  return excludeFeatured
    ? newsData.filter((news) => !news.isFeatured)
    : newsData;
};

export const getNewsByCategory = (category: string): NewsItem[] => {
  return newsData.filter((news) => news.category === category);
};

export const getNewsForHomepage = (limit: number = 3): NewsItem[] => {
  return newsData.filter((news) => !news.isFeatured).slice(0, limit);
};
