"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Select, Switch, Button, message, Spin, Alert } from "antd";
import {
  InfoCircleOutlined,
  EnvironmentOutlined,
  LockOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  createBranch,
  updateBranch,
  getBranchById,
  getManagers,
} from "@/lib/branch/branch.service";
import type {
  CreateBranchPayload,
  UpdateBranchPayload,
  BranchManagerAccount,
  Branch,
} from "@/lib/branch/branch.types";

// User requested the CSS to live in the edit package folder
import styles from "@/app/admin/branch/[id]/edit/EditBranch.module.css";

const { Option } = Select;
const { TextArea } = Input;

interface BranchFormProps {
  mode: "add" | "edit";
  branchId?: string; // Passed when mode="edit"
}

export default function BranchForm({ mode, branchId }: BranchFormProps) {
  const [form] = Form.useForm();
  const router = useRouter();

  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [managers, setManagers] = useState<BranchManagerAccount[]>([]);
  const [fetchingManagers, setFetchingManagers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const pageTitle = mode === "add" ? "THÊM MỚI CHI NHÁNH" : "Chỉnh sửa chi nhánh";
  const pageSubtitle =
    mode === "add" ? null : "Cập nhật thông tin chi tiết của chi nhánh trong hệ thống";

  // Load existing data if mode === edit
  useEffect(() => {
    if (mode === "edit" && branchId) {
      const loadBranch = async () => {
        try {
          setLoading(true);
          const data = await getBranchById(branchId);
          setBranch(data);

          form.setFieldsValue({
            code: data.code,
            name: data.name,
            phone: data.phone,
            email: data.email,
            province: data.province,
            ward: data.ward,
            detailedAddress: data.detailedAddress || data.address,
            managerId: data.managerAccount?.id || null,
            isActive: data.isActive,
          });

          if (data.managerAccount) {
            setManagers([data.managerAccount]);
          }
        } catch (err) {
          console.error(err);
          setError("Không thể tải thông tin chi nhánh!");
          message.error("Không thể tải thông tin chi nhánh!");
        } finally {
          setLoading(false);
        }
      };
      loadBranch();
    }
  }, [mode, branchId, form]);

  // Debounce search for managers
  useEffect(() => {
    const fetchMangersData = async () => {
      setFetchingManagers(true);
      try {
        const data = await getManagers(searchTerm);
        setManagers(data);
      } catch (err) {
        console.error("Error fetching managers:", err);
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

      if (mode === "add") {
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
      } else {
        const payload: UpdateBranchPayload = {
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
        if (branchId) {
          await updateBranch(branchId, payload);
        }
        message.success("Cập nhật chi nhánh thành công!");
      }

      router.push("/admin/branch");
    } catch (err) {
      console.error(err);
      message.error(`Có lỗi xảy ra khi ${mode === "add" ? "thêm" : "cập nhật"} chi nhánh!`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className={styles.container}
        style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Spin size="large" tip="Đang tải dữ liệu chi nhánh..." />
      </div>
    );
  }

  if (mode === "edit" && error) {
    return (
      <div className={styles.container}>
        <Alert message={error} type="error" />
      </div>
    );
  }

  // Determine main layout style (2 columns for edit, 1 column for add)
  const layoutClass = mode === "edit" ? styles.mainLayout : styles.mainLayoutAdd;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>{pageTitle}</h1>
        {pageSubtitle && <p className={styles.subtitle}>{pageSubtitle}</p>}
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={mode === "add" ? { isActive: true } : {}}
        requiredMark={false}
      >
        <div className={layoutClass}>
          {/* Left Column: Form Fields used by both Edit and Add */}
          <div className={styles.leftColumn}>
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
                    <span className={styles.helperText}>
                      Mã chi nhánh là duy nhất trong hệ thống
                    </span>
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
                  label={
                    <span className={styles.formLabel}>
                      Tỉnh/Thành phố <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  name="province"
                  rules={[{ required: true, message: "Vui lòng chọn Tỉnh/Thành phố" }]}
                >
                  <Select placeholder="Chọn Tỉnh/Thành phố" size="large" allowClear>
                    <Option value="Hà Nội">Hà Nội</Option>
                    <Option value="Hồ Chí Minh">Hồ Chí Minh</Option>
                    <Option value="Đà Nẵng">Đà Nẵng</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label={
                    <span className={styles.formLabel}>
                      Phường/Xã <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  name="ward"
                  rules={[{ required: true, message: "Vui lòng chọn Phường/Xã" }]}
                >
                  <Select placeholder="Chọn Phường/Xã" size="large" allowClear>
                    <Option value="Hoàng Mai">Hoàng Mai</Option>
                    <Option value="Ba Đình">Ba Đình</Option>
                    <Option value="Cầu Giấy">Cầu Giấy</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  className={styles.fullWidth}
                  label={
                    <span className={styles.formLabel}>
                      Địa chỉ cụ thể <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  name="detailedAddress"
                  rules={[{ required: true, message: "Vui lòng nhập địa chỉ cụ thể" }]}
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
                  label={
                    <span className={styles.formLabel}>
                      Tài khoản quản lý chi nhánh <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  name="managerId"
                  rules={[{ required: true, message: "Vui lòng chọn tài khoản quản lý chi nhánh" }]}
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
          </div>

          {/* Right Column: System Info (ONLY RENDERED IN EDIT MODE) */}
          {mode === "edit" && branch && (
            <div className={styles.rightColumn}>
              <div className={styles.sysInfoCard}>
                <div style={{ marginBottom: "16px" }}>
                  <span className={styles.formLabel}>THÔNG TIN HỆ THỐNG</span>
                </div>

                <div className={styles.sysInfoBlock} style={{ marginBottom: "16px" }}>
                  <span className={styles.sysInfoLabel}>ID Chi nhánh (UUID)</span>
                  <Input.TextArea
                    value={branch.id}
                    readOnly
                    autoSize
                    className={styles.uuidInput}
                  />
                </div>

                <div className={styles.sysInfoGrid}>
                  <div className={styles.sysInfoBlock}>
                    <span className={styles.sysInfoLabel}>Ngày tạo</span>
                    <span className={styles.sysInfoValue}>{branch.createdAt || "—"}</span>
                  </div>
                  <div className={styles.sysInfoBlock}>
                    <span className={styles.sysInfoLabel}>Ngày cập nhật</span>
                    <span className={styles.sysInfoValue}>{branch.updatedAt || "—"}</span>
                  </div>
                </div>

                <div className={styles.sysInfoGrid}>
                  <div className={styles.sysInfoBlock}>
                    <span className={styles.sysInfoLabel}>Người tạo</span>
                    {branch.createdBy ? (
                      <div className={styles.userBlock}>
                        <div className={styles.userAvatar}>
                          {branch.createdBy.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className={styles.sysInfoValue}>{branch.createdBy.fullName}</span>
                      </div>
                    ) : (
                      <span className={styles.sysInfoValue}>—</span>
                    )}
                  </div>

                  <div className={styles.sysInfoBlock}>
                    <span className={styles.sysInfoLabel}>Người cập nhật</span>
                    {branch.updatedBy ? (
                      <div className={styles.userBlock}>
                        <div className={styles.userAvatar}>
                          {branch.updatedBy.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className={styles.sysInfoValue}>{branch.updatedBy.fullName}</span>
                      </div>
                    ) : branch.managerAccount ? (
                      <div className={styles.userBlock}>
                        <div className={styles.userAvatar}>
                          {branch.managerAccount.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className={styles.sysInfoValue}>
                          {branch.managerAccount.fullName}
                        </span>
                      </div>
                    ) : (
                      <span className={styles.sysInfoValue}>—</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Row */}
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
