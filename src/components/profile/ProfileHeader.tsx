"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
    fullName?: string;
    subtitle?: string; // ví dụ: "Khách hàng thân thiết"
};

export default function ProfileHeader({ fullName, subtitle = "Khách hàng thân thiết" }: Props) {
    const pathname = usePathname();

    const tabs = [
        { label: "Tổng quan", href: "/home/overview" },
        { label: "Lịch sử", href: "/home/history" },
        { label: "Đánh giá", href: "/home/reviews" },
        { label: "Hồ sơ", href: "/home/profile" },
    ];

    return (
        <div className="bg-white border-b">
            {/* Top bar */}
            <div className="max-w-[1100px] mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img
                        src="/icons/busicon.svg"
                        alt="logo"
                        style={{
                            width: 36,
                            height: 36,
                        }}
                    />
                    <div className="font-semibold text-gray-900">Xe Limou Việt Trung</div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right leading-tight">
                        <div className="font-semibold text-gray-900">{fullName || "—"}</div>
                        <div className="text-xs text-gray-500">{subtitle}</div>
                    </div>
                    <img
                        src="/images/image.png"
                        alt="avatar"
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            objectFit: "cover"
                        }}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-[1100px] mx-auto px-6">
                <div className="flex gap-6">
                    {tabs.map((t) => {
                        const active = pathname === t.href;
                        return (
                            <Link
                                key={t.href}
                                href={t.href}
                                className={[
                                    "py-3 text-sm",
                                    active ? "text-blue-600 font-semibold border-b-2 border-blue-600" : "text-gray-500",
                                ].join(" ")}
                            >
                                {t.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}