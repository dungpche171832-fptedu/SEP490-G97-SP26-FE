"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Table, Button, Spin, Alert, Pagination } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined, PlusCircleOutlined, EyeOutlined } from "@ant-design/icons";

import { getAllBranches, type Branch } from "@/services/branch.service";

import styles from "./ListBranch.module.css";
import Link from "next/link";

const PAGE_SIZE = 4;

/* ================= COMPONENTS ================= */
const NavItem = ({ icon, label, href, active }: { icon: React.ReactNode; label: string; href: string; active?: boolean }) => {
    return (
        <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${active ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"}`}>
            {icon}
            <span>{label}</span>
        </Link>
    );
};

/* ================= COMPONENTS ================= */
export default function BranchPage() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await getAllBranches();
                setBranches(data);
            } catch {
                setError("Không thể tải danh sách chi nhánh. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const totalBranches = branches.length;
    const startIndex = (currentPage - 1) * PAGE_SIZE + 1;
    const endIndex = Math.min(currentPage * PAGE_SIZE, totalBranches);
    const pagedBranches = branches.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const columns: ColumnsType<Branch> = [
        {
            title: "MÃ CHI NHÁNH",
            dataIndex: "code",
            key: "code",
            width: 110,
            render: (code: string) => (
                <span className={styles.branchCode}>{code}</span>
            ),
        },
        {
            title: "TÊN CHI NHÁNH",
            dataIndex: "name",
            key: "name",
            width: 150,
            render: (name: string) => (
                <span className={styles.branchName}>{name}</span>
            ),
        },
        {
            title: "ĐỊA CHỈ",
            dataIndex: "address",
            key: "address",
            width: 180,
            render: (address: string) => (
                <span style={{ fontSize: 14, color: "#374151" }}>{address}</span>
            ),
        },
        {
            title: "SỐ ĐIỆN THOẠI",
            dataIndex: "phone",
            key: "phone",
            width: 130,
        },
        {
            title: "EMAIL CHI NHÁNH",
            dataIndex: "email",
            key: "email",
            width: 200,
        },
        {
            title: "TRẠNG THÁI",
            dataIndex: "isActive",
            key: "isActive",
            width: 110,
            render: (isActive: boolean) =>
                isActive ? (
                    <span className={styles.statusActive}>Hoạt động</span>
                ) : (
                    <span className={styles.statusInactive}>Tạm ngưng</span>
                ),
        },
        {
            title: "TÀI KHOẢN QUẢN LÝ",
            key: "managerAccount",
            width: 150,
            render: (_: unknown, record: Branch) =>
                record.managerAccount?.fullName ?? "—",
        },
        {
            title: "THAO TÁC",
            key: "action",
            width: 90,
            render: () => (
                <div style={{ display: "flex", gap: 4 }}>
                    <button className={styles.actionBtn} title="Chỉnh sửa">
                        <EditOutlined />
                    </button>
                    <button className={styles.actionBtn} title="Xem chi tiết">
                        <EyeOutlined />
                    </button>
                    <button
                        className={`${styles.actionBtn} ${styles.actionBtnDelete} `}
                        title="Xóa"
                    >
                        <DeleteOutlined />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* ================= SIDEBAR ================= */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Image src="/icons/xeicon.svg" alt="Bus Icon" width={24} height={24} />
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-800 text-sm leading-tight">
                            Xe Limou Việt Trung
                        </h1>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                            Management System
                        </p>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    <NavItem
                        icon={<Image src="/icons/nhanvien.svg" alt="Nhanvien" width={20} height={20} />}
                        label="Nhân viên"
                        href="/admin/employees"

                    />
                    <NavItem
                        icon={<Image src="/icons/location.svg" alt="Chinhanh" width={20} height={20} />}
                        label="Chi nhánh"
                        href="/admin/branch"
                        active
                    />
                    <NavItem
                        icon={<Image src="/icons/xeicon.svg" alt="Xe" width={20} height={20} />}
                        label="Xe"
                        href="/admin/car"
                    />
                </nav>
            </aside>

            {/* ================= MAIN ================= */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
                    {/* Search */}
                    <div className="relative w-96">
                        <input
                            type="text"
                            placeholder="Tìm kiếm chi nhánh..."
                            className="w-full bg-slate-100 rounded-full py-2 pl-4 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-6">
                        {/* Notification */}
                        <button className="relative text-slate-400 hover:text-slate-600">
                            <Image
                                src="/icons/notifi.svg"
                                alt="Notification"
                                width={20}
                                height={20}
                            />
                            <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full border-2 border-white"></span>
                        </button>

                        {/* User Info */}
                        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-800">
                                    Admin Việt Trung
                                </p>
                                <p className="text-[11px] text-slate-500 font-medium">
                                    QUẢN TRỊ VIÊN
                                </p>
                            </div>

                            <img
                                src="https://ui-avatars.com/api/?name=Admin+Viet+Trung&background=random"
                                alt="Avatar"
                                className="w-9 h-9 rounded-full object-cover shadow-sm"
                            />

                            {/* Logout */}
                            <button
                                onClick={() => {
                                    localStorage.removeItem("token");
                                    window.location.href = "/login";
                                }}
                                className="text-slate-400 hover:text-red-500 transition-colors ml-2"
                            >
                                <Image
                                    src="/icons/muitenCheckout.svg"
                                    alt="Logout"
                                    width={20}
                                    height={20}
                                />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-8 h-full overflow-y-auto">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 uppercase">
                                Danh sách chi nhánh
                            </h2>
                            <p className="text-slate-500 mt-1">
                                Quản lý mạng lưới văn phòng và điểm đón khách trên toàn quốc
                            </p>
                        </div>

                        <Link href="/admin/branch/add">
                            <Button
                                type="primary"
                                icon={<PlusCircleOutlined />}
                                size="large"
                                style={{ background: "#4a90e2", borderColor: "#4a90e2", borderRadius: "8px" }}
                            >
                                Thêm chi nhánh
                            </Button>
                        </Link>
                    </div>

                    {error && (
                        <Alert
                            message={error}
                            type="error"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <Spin spinning={loading} tip="Đang tải dữ liệu...">
                            <Table<Branch>
                                columns={columns}
                                dataSource={pagedBranches}
                                rowKey="id"
                                pagination={false}
                            />

                            {!loading && totalBranches > 0 && (
                                <div className="px-6 py-4 bg-slate-50/30 flex items-center justify-between border-t border-slate-200">
                                    <span className="text-sm text-slate-500 font-medium">
                                        Hiển thị {startIndex}-{endIndex} / {totalBranches}
                                    </span>

                                    <Pagination
                                        current={currentPage}
                                        total={totalBranches}
                                        pageSize={PAGE_SIZE}
                                        onChange={(page) => setCurrentPage(page)}
                                        showSizeChanger={false}
                                    />
                                </div>
                            )}
                        </Spin>
                    </div>
                </div>
            </main>
        </div>
    );
}