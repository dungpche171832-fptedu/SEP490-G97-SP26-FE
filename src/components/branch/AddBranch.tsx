"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Select, Switch, Button, message, Spin } from "antd";
import {
  InfoCircleOutlined,
  EnvironmentOutlined,
  LockOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { createBranch, getManagers } from "@/lib/branch/branch.service";
import type { CreateBranchPayload, BranchManagerAccount } from "@/lib/branch/branch.types";
import styles from "@/app/admin/branch/add/AddBranch.module.css";

const { Option } = Select;
const { TextArea } = Input;

export default function AddBranch() {
  const [form] = Form.useForm();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [managers, setManagers] = useState<BranchManagerAccount[]>([]);
  const [fetchingManagers, setFetchingManagers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce search for managers
  useEffect(() => {
    const fetchMangersData = async () => {
      setFetchingManagers(true);
      try {
        const data = await getManagers(searchTerm);
        setManagers(data);
      } catch (error) {
        console.error("Error fetching managers:", error);
      } finally {
        setFetchingManagers(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchMangersData();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = async (values: any) => {
    try {
      setSubmitting(true);
      const payload: CreateBranchPayload = {
        code: values.code,
        name: values.name,
        phone: values.phone,
        email: values.email,
        province: values.province,
        ward: values.ward,
        detailedAddress: values.detailedAddress,
        managerId: values.managerId || null,
        isActive: values.isActive ?? true,
      };

      await createBranch(payload);
      message.success("Thêm chi nhánh thành công!");
      router.push("/admin/branch");
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra khi thêm chi nhánh. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>THÊM MỚI CHI NHÁNH</h1>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ isActive: true }}
        requiredMark={false}
      >
        {/* Thông tin chi nhánh */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <InfoCircleOutlined className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Thông tin chi nhánh</h2>
          </div>

          <div className={styles.formGrid}>
            <Form.Item
              label={
                <span className={styles.formLabel}>
                  Mã chi nhánh <span style={{ color: "red" }}>*</span>
                </span>
              }
              name="code"
              rules={[
                { required: true, message: "Vui lòng nhập mã chi nhánh" },
                { pattern: /^\S+$/, message: "Mã chi nhánh không được chứa khoảng trắng" },
              ]}
              extra={
                <span className={styles.helperText}>Mã chi nhánh là duy nhất trong hệ thống</span>
              }
            >
              <Input placeholder="VD: CN-HN-01" size="large" />
            </Form.Item>

            <Form.Item
              label={
                <span className={styles.formLabel}>
                  Tên chi nhánh <span style={{ color: "red" }}>*</span>
                </span>
              }
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên chi nhánh" }]}
            >
              <Input placeholder="VD: Chi nhánh Hà Nội 1" size="large" />
            </Form.Item>

            <Form.Item
              label={
                <span className={styles.formLabel}>
                  Số điện thoại <span style={{ color: "red" }}>*</span>
                </span>
              }
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                {
                  pattern: /^(0)[0-9]{9}$/,
                  message: "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)",
                },
              ]}
            >
              <Input placeholder="024 xxxx xxxx" size="large" />
            </Form.Item>

            <Form.Item
              label={
                <span className={styles.formLabel}>
                  Email chi nhánh <span style={{ color: "red" }}>*</span>
                </span>
              }
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không đúng định dạng" },
              ]}
            >
              <Input placeholder="chinhanh@velimou.vn" size="large" />
            </Form.Item>
          </div>
        </div>

        {/* Địa chỉ */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <EnvironmentOutlined className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Địa chỉ</h2>
          </div>

          <div className={styles.formGrid}>
            <Form.Item
              label={<span className={styles.formLabel}>Tỉnh/Thành phố</span>}
              name="province"
            >
              <Select placeholder="Chọn Tỉnh/Thành phố" size="large" allowClear>
                <Option value="Hà Nội">Hà Nội</Option>
                <Option value="Hồ Chí Minh">Hồ Chí Minh</Option>
                <Option value="Đà Nẵng">Đà Nẵng</Option>
              </Select>
            </Form.Item>

            <Form.Item label={<span className={styles.formLabel}>Phường/Xã</span>} name="ward">
              <Select placeholder="Chọn Phường/Xã" size="large" allowClear>
                <Option value="Hoàng Mai">Hoàng Mai</Option>
                <Option value="Ba Đình">Ba Đình</Option>
                <Option value="Cầu Giấy">Cầu Giấy</Option>
              </Select>
            </Form.Item>

            <Form.Item
              className={styles.fullWidth}
              label={<span className={styles.formLabel}>Địa chỉ cụ thể</span>}
              name="detailedAddress"
            >
              <TextArea placeholder="Số nhà, tên đường..." rows={3} size="large" />
            </Form.Item>
          </div>
        </div>

        {/* Quản lý & Trạng thái */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <LockOutlined className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Quản lý & Trạng thái</h2>
          </div>

          <div className={styles.formGrid}>
            <Form.Item
              className={styles.fullWidth}
              label={<span className={styles.formLabel}>Tài khoản quản lý chi nhánh</span>}
              name="managerId"
            >
              <Select
                showSearch
                placeholder="Tìm kiếm & Chọn nhân viên"
                size="large"
                allowClear
                filterOption={false}
                onSearch={(val) => setSearchTerm(val)}
                notFoundContent={fetchingManagers ? <Spin size="small" /> : null}
              >
                {managers.map((manager) => (
                  <Option key={manager.id} value={manager.id}>
                    {manager.fullName} - {manager.email}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <div className={styles.fullWidth}>
              <div className={styles.switchWrapper}>
                <div className={styles.switchLabel}>
                  <span className={styles.switchTitle}>Trạng thái hoạt động</span>
                  <span className={styles.switchDesc}>Cho phép chi nhánh vận hành ngay</span>
                </div>
                <Form.Item name="isActive" valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.actionRow}>
          <Button
            size="large"
            className={styles.btnCancel}
            onClick={() => router.push("/admin/branch")}
          >
            Hủy bỏ
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className={styles.btnSubmit}
            icon={<SaveOutlined />}
            loading={submitting}
          >
            Lưu chi nhánh
          </Button>
        </div>
      </Form>
    </div>
  );
}
