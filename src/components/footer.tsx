import React from "react";
import { ShareAltOutlined, LikeOutlined } from "@ant-design/icons"; // Nếu bạn dùng Ant Design Icons

export default function Footer() {
  return (
    <footer className="w-full bg-[#0b1120] text-gray-400 py-12 px-6 md:px-20">
      {/* Container chính - Giới hạn 1440px và căn giữa, nhưng nội dung bên trong dạt 2 bên */}
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between gap-10">
        {/* Cột 1: Thông tin thương hiệu (Bên trái) */}
        <div className="max-w-xs">
          <h2 className="text-white text-2xl font-bold mb-4">Xe Limou Việt Trung</h2>
          <p className="text-sm leading-relaxed">
            Dịch vụ vận chuyển hành khách cao cấp, mang lại trải nghiệm 5 sao trên mọi nẻo đường.
          </p>
        </div>

        {/* Cột 2 & 3: Links (Ở giữa/Phải) */}
        <div className="flex flex-wrap gap-16 md:gap-32">
          {/* Liên hệ */}
          <div>
            <h3 className="text-white font-bold uppercase mb-4 tracking-wider">Liên hệ</h3>
            <ul className="space-y-2 text-sm">
              <li>Hotline: 1900 xxxx</li>
              <li>Email: contact@limouviettrung.vn</li>
            </ul>
          </div>

          {/* Chính sách */}
          <div>
            <h3 className="text-white font-bold uppercase mb-4 tracking-wider">Chính sách</h3>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-white cursor-pointer transition">Điều khoản sử dụng</li>
              <li className="hover:text-white cursor-pointer transition">Chính sách bảo mật</li>
            </ul>
          </div>
        </div>

        {/* Cột 4: Social Icons (Bên phải) */}
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-gray-800 cursor-pointer transition text-white">
            <ShareAltOutlined />
          </div>
          <div className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-gray-800 cursor-pointer transition text-white">
            <LikeOutlined />
          </div>
        </div>
      </div>

      {/* Dòng bản quyền dưới cùng */}
      <div className="max-w-[1440px] mx-auto border-t border-gray-800 mt-12 pt-6 text-center text-xs text-gray-500">
        © 2024 Xe Limou Việt Trung. An toàn • Đúng giờ • Chất lượng
      </div>
    </footer>
  );
}
