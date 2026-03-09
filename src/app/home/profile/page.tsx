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

    const pageFont = 'var(--font-geist-sans), Arial, Helvetica, sans-serif';

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
                                        <Input value={fullName} readOnly style={inputStyle} />
                                    </div>

                                    <div>
                                        <div style={labelStyle}>Email</div>
                                        <Input value={email} readOnly style={inputStyle} />
                                    </div>

                                    <div>
                                        <div style={labelStyle}>Số điện thoại</div>
                                        <Input value={phone} readOnly style={inputStyle} />
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                                    <Button
                                        type="primary"
                                        size="large"
                                        style={buttonStyle}
                                        icon={
                                            <img
                                                src="/icons/contacts.svg"
                                                alt="icon"
                                                style={{ width: 16 }}
                                            />
                                        }
                                        onClick={() => message.info("Chức năng đang phát triển")}
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
                                        <Input.Password
                                            placeholder="Nhập mật khẩu mới"
                                            style={inputStyle}
                                        />
                                    </div>

                                    <div>
                                        <div style={labelStyle}>Xác nhận mật khẩu mới</div>
                                        <Input.Password
                                            placeholder="Xác nhận mật khẩu mới"
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                                    <Button
                                        type="primary"
                                        size="large"
                                        style={buttonStyle}
                                        icon={
                                            <img
                                                src="/icons/changepasswork.png"
                                                alt="icon"
                                                style={{ width: 15 }}
                                            />
                                        }
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