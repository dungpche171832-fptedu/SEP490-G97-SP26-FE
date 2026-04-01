"use client";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { Card, Input, Button, Spin, message, Divider } from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
} from "@ant-design/icons";

import ProfileHeader from "@/components/profile/ProfileHeader";
import { getAccountInfo, updateProfile } from "@/services/account.service";

type Profile = {
  fullName: string;
  email: string;
  phone: string;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Dữ liệu gốc đang hiển thị ở header + card trái
  const [profile, setProfile] = useState<Profile | null>(null);

  // Dữ liệu đang nhập trong form bên phải
  const [formData, setFormData] = useState<Profile>({
    fullName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const data = await getAccountInfo();

        const mappedData: Profile = {
          fullName: data?.fullName || "",
          email: data?.email || "",
          phone: data?.phone || "",
        };

        setProfile(mappedData);
        setFormData(mappedData);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Không tải được hồ sơ";
        message.error(errorMessage);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (field: keyof Profile, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateProfile = async () => {
    if (!formData.fullName.trim()) {
      message.warning("Vui lòng nhập họ tên");
      return;
    }

    if (!formData.phone.trim()) {
      message.warning("Vui lòng nhập số điện thoại");
      return;
    }

    try {
      setUpdating(true);

      const data = await updateProfile({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
      });

      const updatedData: Profile = {
        fullName: data?.fullName || "",
        email: data?.email || formData.email,
        phone: data?.phone || "",
      };

      // Chỉ sau khi update thành công mới cập nhật phần hiển thị
      setProfile(updatedData);
      setFormData(updatedData);

      message.success("Cập nhật thông tin thành công");
    } catch (e: unknown) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "Cập nhật thông tin thất bại";
      message.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  // Dữ liệu hiển thị cố định ở header + card trái
  const fullName = useMemo(() => profile?.fullName || "", [profile]);
  const email = useMemo(() => profile?.email || "", [profile]);
  const phone = useMemo(() => profile?.phone || "", [profile]);

  // Dữ liệu đang nhập trong form
  const formFullName = useMemo(() => formData.fullName || "", [formData]);
  const formEmail = useMemo(() => formData.email || "", [formData]);
  const formPhone = useMemo(() => formData.phone || "", [formData]);

  const pageFont = "var(--font-geist-sans), Arial, Helvetica, sans-serif";

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 700,
    color: "#334155",
    marginBottom: 6,
    lineHeight: 1.4,
    fontFamily: pageFont,
  };

  const inputStyle: React.CSSProperties = {
    height: 42,
    borderRadius: 8,
    fontSize: 14,
    color: "#0F172A",
    fontFamily: pageFont,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontWeight: 700,
    fontSize: 16,
    color: "#0F172A",
    fontFamily: pageFont,
  };

  const buttonStyle: React.CSSProperties = {
    borderRadius: 8,
    minWidth: 170,
    height: 38,
    fontWeight: 700,
    fontSize: 14,
    fontFamily: pageFont,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        fontFamily: pageFont,
        color: "#0F172A",
      }}
    >
      <ProfileHeader fullName={fullName} subtitle="Khách hàng thân thiết" />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 18px 40px" }}>
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#111827",
              fontFamily: pageFont,
            }}
          >
            Hồ sơ cá nhân
          </div>
          <div
            style={{
              marginTop: 6,
              color: "#6b7280",
              fontSize: 14,
              fontFamily: pageFont,
            }}
          >
            Quản lý thông tin tài khoản và thiết lập bảo mật của bạn.
          </div>
        </div>

        <Spin spinning={loading} tip="Đang tải...">
          <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 18 }}>
            <Card
              style={{ borderRadius: 14, fontFamily: pageFont }}
              styles={{ body: { fontFamily: pageFont } }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    width: 92,
                    height: 92,
                    borderRadius: "50%",
                    overflow: "hidden",
                    marginTop: 6,
                  }}
                >
                  <Image
                    src="/images/avatar.png"
                    alt="avatar"
                    width={92}
                    height={92}
                    style={{ objectFit: "cover" }}
                  />
                </div>

                <div
                  style={{
                    marginTop: 14,
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#0F172A",
                    fontFamily: pageFont,
                  }}
                >
                  {fullName || "—"}
                </div>

                <div
                  style={{
                    marginTop: 4,
                    color: "#64748B",
                    fontSize: 12,
                    fontWeight: 500,
                    fontFamily: pageFont,
                  }}
                >
                  Thành viên từ 03/2026
                </div>
              </div>

              <Divider style={{ margin: "16px 0" }} />

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", color: "#334155" }}>
                  <MailOutlined style={{ color: "#2563eb" }} />
                  <span style={{ fontSize: 13, fontFamily: pageFont }}>{email || "—"}</span>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center", color: "#334155" }}>
                  <PhoneOutlined style={{ color: "#2563eb" }} />
                  <span style={{ fontSize: 13, fontFamily: pageFont }}>{phone || "—"}</span>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center", color: "#334155" }}>
                  <SafetyCertificateOutlined style={{ color: "#2563eb" }} />
                  <span style={{ fontSize: 13, fontFamily: pageFont }}>Tài khoản đã xác thực</span>
                </div>
              </div>
            </Card>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <Card
                title={<span style={sectionTitleStyle}>Thông tin cá nhân</span>}
                style={{ borderRadius: 14, fontFamily: pageFont }}
                styles={{ body: { fontFamily: pageFont } }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ gridColumn: "1 / span 2" }}>
                    <div style={labelStyle}>Họ tên</div>
                    <Input
                      value={formFullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <div style={labelStyle}>Email</div>
                    <Input value={formEmail} readOnly style={inputStyle} />
                  </div>

                  <div>
                    <div style={labelStyle}>Số điện thoại</div>
                    <Input
                      value={formPhone}
                      onChange={(e) => handleChange("phone", e.target.value.replace(/\D/g, ""))}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                  <Button
                    type="primary"
                    size="large"
                    style={buttonStyle}
                    loading={updating}
                    icon={<img src="/icons/contacts.svg" alt="icon" style={{ width: 16 }} />}
                    onClick={handleUpdateProfile}
                  >
                    Cập nhật thông tin
                  </Button>
                </div>
              </Card>

              <Card
                title={
                  <span style={sectionTitleStyle}>
                    <LockOutlined style={{ marginRight: 8 }} />
                    Đổi mật khẩu
                  </span>
                }
                style={{ borderRadius: 14, fontFamily: pageFont }}
                styles={{ body: { fontFamily: pageFont } }}
              >
                <div style={{ maxWidth: 520, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <div style={labelStyle}>Mật khẩu hiện tại</div>
                    <Input.Password
                      placeholder="Nhập mật khẩu hiện tại"
                      visibilityToggle={false}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <div style={labelStyle}>Mật khẩu mới</div>
                    <Input.Password placeholder="Nhập mật khẩu mới" style={inputStyle} />
                  </div>

                  <div>
                    <div style={labelStyle}>Xác nhận mật khẩu mới</div>
                    <Input.Password placeholder="Xác nhận mật khẩu mới" style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                  <Button
                    type="primary"
                    size="large"
                    style={buttonStyle}
                    icon={<img src="/icons/changepasswork.png" alt="icon" style={{ width: 15 }} />}
                    onClick={() => message.info("Chức năng đang phát triển")}
                  >
                    Đổi mật khẩu
                  </Button>
                </div>
              </Card>

              <div
                style={{
                  textAlign: "center",
                  color: "#94A3B8",
                  fontSize: 12,
                  marginTop: 6,
                  fontWeight: 500,
                  fontFamily: pageFont,
                }}
              >
                © 2024 Xe Limou Việt Trung. All rights reserved.
              </div>
            </div>
          </div>
        </Spin>
      </div>
    </div>
  );
}
