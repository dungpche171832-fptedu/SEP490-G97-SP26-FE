import { PlanResponse } from "../model/plan";

// services/planService.ts
export const planService = {
  getListPlans: async (): Promise<PlanResponse> => {
    // Lấy token từ nơi bạn lưu trữ (ví dụ localStorage)
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:8080/api/plans", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Thêm Authorization Header nếu có ổ khóa
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error("Phiên đăng nhập hết hạn hoặc không có quyền.");
    }

    if (!response.ok) throw new Error("Lỗi kết nối API");

    return await response.json();
  },
};
