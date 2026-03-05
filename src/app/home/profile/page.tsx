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
import { getAccountInfo } from "@/services/account.service";

type Profile = {
    fullName?: string;
    email?: string;
    phone?: string;
};

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await getAccountInfo();
                setProfile(data);
            } catch (e: any) {
                message.error(e?.message || "Không tải được hồ sơ");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const fullName = useMemo(() => profile?.fullName || "", [profile]);
    const email = useMemo(() => profile?.email || "", [profile]);
    const phone = useMemo(() => profile?.phone || "", [profile]);

    return (
        <div style={{ minHeight: "100vh", background: "#f5f7fb" }}>
            {/* ✅ Header  + Tabs nằm trong Header, lấy fullName từ API */}
            <ProfileHeader fullName={fullName} subtitle="Khách hàng thân thiết" />

            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 18px 40px" }}>
                {/* Title */}
                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 26, fontWeight: 700, color: "#111827" }}>
                        Hồ sơ cá nhân
                    </div>
                    <div style={{ marginTop: 6, color: "#6b7280" }}>
                        Quản lý thông tin tài khoản và thiết lập bảo mật của bạn.
                    </div>
                </div>

                <Spin spinning={loading} tip="Đang tải...">
                    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 18 }}>
                        {/* Left card */}
                        <Card style={{ borderRadius: 14 }}>
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

                                <div style={{ marginTop: 14, fontSize: 18, fontWeight: 700 }}>
                                    {fullName || "—"}
                                </div>
                                <div style={{ marginTop: 4, color: "#6b7280", fontSize: 12 }}>
                                    Thành viên từ 03/2026
                                </div>
                            </div>

                            <Divider style={{ margin: "16px 0" }} />

                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                <div style={{ display: "flex", gap: 10, alignItems: "center", color: "#374151" }}>
                                    <MailOutlined style={{ color: "#2563eb" }} />
                                    <span style={{ fontSize: 13 }}>{email || "—"}</span>
                                </div>

                                <div style={{ display: "flex", gap: 10, alignItems: "center", color: "#374151" }}>
                                    <PhoneOutlined style={{ color: "#2563eb" }} />
                                    <span style={{ fontSize: 13 }}>{phone || "—"}</span>
                                </div>

                                <div style={{ display: "flex", gap: 10, alignItems: "center", color: "#374151" }}>
                                    <SafetyCertificateOutlined style={{ color: "#2563eb" }} />
                                    <span style={{ fontSize: 13 }}>Tài khoản đã xác thực</span>
                                </div>
                            </div>
                        </Card>

                        {/* Right side */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                            {/* Personal info */}
                            <Card
                                title={<span style={{ fontWeight: 700 }}>Thông tin cá nhân</span>}
                                style={{ borderRadius: 14 }}
                                extra={
                                    <Button
                                        type="primary"
                                        style={{ borderRadius: 8 }}
                                        onClick={() => message.info("Chức năng đang phát triển")}
                                    >
                                        Cập nhật thông tin
                                    </Button>
                                }
                            >
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                    <div style={{ gridColumn: "1 / span 2" }}>
                                        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                                            Họ tên
                                        </div>
                                        <Input value={fullName} readOnly />
                                    </div>

                                    <div>
                                        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                                            Email
                                        </div>
                                        <Input value={email} readOnly />
                                    </div>

                                    <div>
                                        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                                            Số điện thoại
                                        </div>
                                        <Input value={phone} readOnly />
                                    </div>
                                </div>


                            </Card>

                            {/* Change password (fixed UI) */}
                            <Card
                                title={
                                    <span style={{ fontWeight: 700 }}>
                                        <LockOutlined style={{ marginRight: 8 }} />
                                        Đổi mật khẩu
                                    </span>
                                }
                                style={{ borderRadius: 14 }}
                            >
                                <div style={{ maxWidth: 520, display: "flex", flexDirection: "column", gap: 12 }}>
                                    <div>
                                        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                                            Mật khẩu hiện tại
                                        </div>
                                        <Input.Password
                                            placeholder="Nhập mật khẩu hiện tại"
                                            visibilityToggle={false}
                                        />
                                    </div>

                                    <div>
                                        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                                            Mật khẩu mới
                                        </div>
                                        <Input.Password placeholder="Nhập mật khẩu mới" />
                                    </div>

                                    <div>
                                        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                                            Xác nhận mật khẩu mới
                                        </div>
                                        <Input.Password placeholder="Xác nhận mật khẩu mới" />
                                    </div>


                                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                                        <Button
                                            type="default"
                                            size="large"
                                            style={{ borderRadius: 8 }}
                                            icon={<img src="/icons/changepasswork.png" style={{ width: 14 }} />}
                                            onClick={() => message.info("Chức năng đang phát triển")}
                                        >
                                            Đổi mật khẩu
                                        </Button>
                                    </div>
                                </div>
                            </Card>

                            <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 12, marginTop: 6 }}>
                                © 2024 Xe Limou Việt Trung. All rights reserved.
                            </div>
                        </div>
                    </div>
                </Spin>
            </div>
        </div>
    );
}