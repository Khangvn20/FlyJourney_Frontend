/**
 * Reusable seat copy texts
 */
export const EXIT_ROW_CONDITIONS = [
  "Hành khách từ 15 đến 65 tuổi",
  "Không mang thai",
  "Không đi cùng trẻ sơ sinh (infant)",
  "Không hạn chế di chuyển hoặc cần hỗ trợ đặc biệt",
  "Có khả năng mở cửa thoát hiểm và hỗ trợ khi khẩn cấp",
] as const;

export const SEAT_COPY = {
  extraLegroom: "Extra-legroom: khoảng chân rộng, có phụ thu…",
  exitRowConditions: EXIT_ROW_CONDITIONS,
} as const;

export default SEAT_COPY;
