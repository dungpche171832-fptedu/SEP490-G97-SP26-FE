"use client";

import { useEffect, useState } from "react";
import { Table, Button, Tag, Spin, Alert, Pagination } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import type { Branch } from "@/lib/branch/branch.types";
import { getAllBranches } from "@/lib/branch/branch.service";
import styles from "./ListBranch.module.css";

const PAGE_SIZE = 4;

export default function ListBranch() {
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
  const pagedBranches = branches.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const columns: ColumnsType<Branch> = [
    {
      title: "MÃ CHI NHÁNH",
      dataIndex: "code",
      key: "code",
      width: 110,
      render: (code: string) => <span className={styles.branchCode}>{code}</span>,
    },
    {
      title: "TÊN CHI NHÁNH",
      dataIndex: "name",
      key: "name",
      width: 150,
      render: (name: string) => <span className={styles.branchName}>{name}</span>,
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
      render: (phone: string) => <span style={{ fontSize: 14 }}>{phone}</span>,
    },
    {
      title: "EMAIL CHI NHÁNH",
      dataIndex: "email",
      key: "email",
      width: 200,
      render: (email: string) => <span style={{ fontSize: 14, color: "#374151" }}>{email}</span>,
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
          <span className={styles.statusInactive}>Tạm nghi</span>
        ),
    },
    {
      title: "TÀI KHOẢN QUẢN LÝ",
      key: "managerAccount",
      width: 150,
      render: (_: unknown, record: Branch) => (
        <span style={{ fontSize: 14, color: "#374151" }}>
          {record.managerAccount?.fullName ?? "—"}
        </span>
      ),
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
          <button className={`${styles.actionBtn} ${styles.actionBtnDelete}`} title="Xóa">
            <DeleteOutlined />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Danh sách chi nhánh</h1>
          <p>Quản lý mạng lưới văn phòng và điểm đón khách trên toàn quốc</p>
        </div>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          className={styles.addButton}
          style={{ background: "#4a90e2", borderColor: "#4a90e2" }}
        >
          Thêm chi nhánh
        </Button>
      </div>

      {/* Error */}
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

      {/* Table */}
      <div className={styles.tableWrapper}>
        <Spin spinning={loading} tip="Đang tải dữ liệu...">
          <Table<Branch>
            columns={columns}
            dataSource={pagedBranches}
            rowKey="id"
            pagination={false}
            bordered={false}
            style={{ minHeight: 200 }}
          />

          {/* Custom Pagination */}
          {!loading && totalBranches > 0 && (
            <div className={styles.pagination}>
              <span className={styles.paginationInfo}>
                Hiển thị {startIndex}-{endIndex} trong tổng số {totalBranches} nhánh
              </span>
              <Pagination
                current={currentPage}
                total={totalBranches}
                pageSize={PAGE_SIZE}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
                simple={false}
              />
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
}
