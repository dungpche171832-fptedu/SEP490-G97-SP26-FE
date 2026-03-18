"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Spin, Alert } from "antd";
import {
  InfoCircleOutlined,
  EnvironmentOutlined,
  SettingOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { Branch } from "@/lib/branch/branch.types";
import { getBranchById } from "@/lib/branch/branch.service";
import styles from "@/app/admin/branch/[id]/BranchDetail.module.css";

interface BranchDetailProps {
  id: string;
}

export default function BranchDetail({ id }: BranchDetailProps) {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBranch = async () => {
      try {
        setLoading(true);
        const data = await getBranchById(id);
        setBranch(data);
      } catch (err) {
        setError("Không thể tải thông tin chi nhánh. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    loadBranch();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.container} style={{ justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className={styles.container}>
        <Alert message={error || "Không tìm thấy chi nhánh"} type="error" showIcon />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/admin/branch" className={styles.breadcrumbLink}>
          Chi nhánh
        </Link>
        <span>&gt;</span>
        <span className={styles.breadcrumbCurrent}>Chi tiết chi nhánh</span>
      </div>

      {/* Thông tin cơ bản */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleWrapper}>
            <InfoCircleOutlined className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Thông tin cơ bản</h2>
          </div>
          <div className={branch.isActive ? styles.statusActive : styles.statusInactive}>
            <span className={styles.dot}></span>
            {branch.isActive ? "Đang hoạt động" : "Tạm nghỉ"}
          </div>
        </div>

        <div className={styles.grid3}>
          <div className={styles.field}>
            <span className={styles.label}>MÃ CHI NHÁNH</span>
            <span className={styles.value}>{branch.code}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>TÊN CHI NHÁNH</span>
            <span className={styles.value}>{branch.name}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>QUẢN LÝ CHI NHÁNH</span>
            <span className={styles.value}>{branch.managerAccount?.fullName || "—"}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>SỐ ĐIỆN THOẠI</span>
            <span className={styles.value}>{branch.phone || "—"}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>EMAIL CHI NHÁNH</span>
            <span className={styles.value}>{branch.email || "—"}</span>
          </div>
        </div>
      </div>

      <div className={styles.bottomSection}>
        {/* Địa chỉ */}
        <div className={styles.card}>
          <div className={styles.cardHeader} style={{ marginBottom: "16px" }}>
            <div className={styles.cardTitleWrapper}>
              <EnvironmentOutlined className={styles.cardIcon} />
              <h2 className={styles.cardTitle}>Địa chỉ</h2>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className={styles.field}>
              <span className={styles.label}>TỈNH/THÀNH PHỐ</span>
              <span className={styles.value}>{branch.province || "—"}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>PHƯỜNG/XÃ</span>
              <span className={styles.value}>{branch.ward || "—"}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>ĐỊA CHỈ CHI TIẾT</span>
              <span className={styles.value}>
                {branch.detailedAddress || branch.address || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Thông tin hệ thống */}
        <div className={styles.card}>
          <div className={styles.cardHeader} style={{ marginBottom: "16px" }}>
            <div className={styles.cardTitleWrapper}>
              <SettingOutlined className={styles.cardIcon} />
              <h2 className={styles.cardTitle}>Thông tin hệ thống</h2>
            </div>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>ID CHI NHÁNH (UUID)</span>
            <div className={styles.valueBox}>{branch.id}</div>
          </div>

          <div className={styles.gridSystem}>
            <div className={styles.field}>
              <span className={styles.label}>NGÀY TẠO</span>
              <span className={styles.value}>{branch.createdAt || "—"}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>NGÀY CẬP NHẬT</span>
              <span className={styles.value}>{branch.updatedAt || "—"}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>NGƯỜI TẠO</span>
              <div className={styles.value}>
                {branch.createdBy ? (
                  <span className={styles.userBadge}>
                    <div className={styles.userAvatar}>
                      {branch.createdBy.fullName.charAt(0).toUpperCase()}
                    </div>
                    {branch.createdBy.fullName}
                  </span>
                ) : (
                  "—"
                )}
              </div>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>NGƯỜI CẬP NHẬT</span>
              <div className={styles.value}>
                {branch.updatedBy ? (
                  <span className={styles.userBadge}>
                    <div className={styles.userAvatar}>
                      {branch.updatedBy.fullName.charAt(0).toUpperCase()}
                    </div>
                    {branch.updatedBy.fullName}
                  </span>
                ) : branch.managerAccount ? (
                  <span className={styles.userBadge}>
                    <div className={styles.userAvatar}>
                      {branch.managerAccount.fullName.charAt(0).toUpperCase()}
                    </div>
                    {branch.managerAccount.fullName}
                  </span>
                ) : (
                  "—"
                )}
              </div>
            </div>
          </div>

          <div className={styles.infoAlert}>
            <InfoCircleOutlined className={styles.infoAlertIcon} />
            <div className={styles.infoAlertText}>
              Dữ liệu này được ghi lại tự động bởi hệ thống cho mục đích đối soát và lịch sử thay
              đổi. Không thể sửa đổi trực tiếp các thông tin này.
            </div>
          </div>
        </div>
      </div>

      <div className={styles.actionRow}>
        <button className={styles.editButton}>
          Chỉnh sửa <EditOutlined />
        </button>
      </div>
    </div>
  );
}
