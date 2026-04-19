"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Table, Input, Button, Tag, Pagination, Space, ConfigProvider, message } from "antd";
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { planService } from "@/services/planService";
import type { Plan, PlanResponse } from "@/model/plan";

interface PlanTableItem {
  id: number;
  key: string;
  code: string;
  carPlate: string;
  driver: string;
  startTime: string;
  status: string;
}

export default function PlanManagementPage() {
  const router = useRouter();

  const [plans, setPlans] = useState<PlanTableItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);

      const response: PlanResponse = await planService.getListPlans();

      if (response?.plans) {
        const mappedData: PlanTableItem[] = response.plans.map((item: Plan) => ({
          id: item.id,
          key: String(item.id),
          code: item.code,
          carPlate: item.carLicensePlate,
          driver: item.driverName,
          startTime: item.startTime,
          status: item.status,
        }));

        setPlans(mappedData);
        setTotalCount(response.totalCount || mappedData.length);
      }
    } catch (error: unknown) {
      let errorMsg = "Không thể tải danh sách lịch trình";
      if (error instanceof Error) {
        errorMsg = error.message;
      }
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const filteredData = useMemo(() => {
    const keyword = searchText.toLowerCase().trim();
    if (!keyword) return plans;

    return plans.filter(
      (item) =>
        item.code.toLowerCase().includes(keyword) ||
        item.carPlate.toLowerCase().includes(keyword) ||
        item.driver.toLowerCase().includes(keyword),
    );
  }, [plans, searchText]);

  const columns: ColumnsType<PlanTableItem> = [
    {
      title: "MÃ LỊCH TRÌNH",
      dataIndex: "code",
      key: "code",
      align: "center",
      render: (text: string) => <span className="font-bold text-slate-700">{text}</span>,
    },
    {
      title: "BIỂN SỐ XE",
      dataIndex: "carPlate",
      key: "carPlate",
      render: (text: string) => <span className="font-medium text-slate-600">{text}</span>,
    },
    {
      title: "TÀI XẾ",
      dataIndex: "driver",
      key: "driver",
      render: (text: string) => <span className="text-slate-600">{text}</span>,
    },
    {
      title: "THỜI GIAN ĐI",
      dataIndex: "startTime",
      key: "startTime",
      align: "center",
      render: (text: string) => <span className="text-sm text-slate-500">{text}</span>,
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status: string) => {
        const normalizedStatus = status?.toUpperCase();

        const isActive = normalizedStatus === "ACTIVE" || status === "Hoạt động";
        const isComplete = normalizedStatus === "COMPLETE" || status === "Hoàn thành";
        const isScheduled = normalizedStatus === "SCHEDULED" || status === "Đã lên lịch";

        let bgColor = "#F1F5F9";
        let textColor = "#64748B";

        if (isActive) {
          bgColor = "#E6FFFA";
          textColor = "#059669";
        } else if (isComplete) {
          bgColor = "#F2F4F7";
          textColor = "#344054";
        } else if (isScheduled) {
          bgColor = "#EFF8FF";
          textColor = "#1570EF";
        }

        return (
          <Tag
            className="rounded-full border-none px-4 py-0.5 font-medium"
            color={bgColor}
            style={{ color: textColor }}
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: "THAO TÁC",
      key: "action",
      align: "center",
      render: (_value, record) => (
        <Space size="middle">
          <Button
            type="text"
            onClick={() => router.push(`/admin/managePlan/${record.id}`)}
            icon={
              <EditOutlined className="text-lg text-slate-400 transition-colors hover:text-blue-500" />
            }
          />
          <Button
            type="text"
            icon={
              <DeleteOutlined className="text-lg text-slate-400 transition-colors hover:text-red-500" />
            }
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-extrabold uppercase tracking-tight text-slate-800">
              QUẢN LÝ LỊCH TRÌNH
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Hệ thống quản lý vận tải Việt Trung
            </p>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push("/admin/managePlan/create")}
            className="h-11 rounded-lg border-none bg-blue-600 px-6 font-bold shadow-md transition-all hover:bg-blue-700"
          >
            Thêm lịch trình
          </Button>
        </div>

        <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <Input
            placeholder="Tìm kiếm mã, biển số, tài xế..."
            prefix={<SearchOutlined className="mr-2 text-slate-400" />}
            className="h-11 max-w-md rounded-lg border-slate-200 bg-slate-50/50"
            value={searchText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
            allowClear
          />

          <Button
            onClick={fetchPlans}
            className="h-11 rounded-lg border-slate-200 font-medium text-slate-600 transition-colors hover:text-blue-600"
          >
            Làm mới
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <ConfigProvider
            theme={{
              components: {
                Table: {
                  headerBg: "#F8FAFC",
                  headerColor: "#64748B",
                  rowHoverBg: "#F1F5F9",
                },
              },
            }}
          >
            <Table
              columns={columns}
              dataSource={filteredData}
              pagination={false}
              loading={loading}
              rowKey="key"
              className="custom-table"
            />
          </ConfigProvider>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 pb-10 sm:flex-row">
          <span className="text-sm font-medium text-slate-500">
            Hiển thị {filteredData.length} trên {totalCount} lịch trình
          </span>

          <Pagination
            defaultCurrent={1}
            total={totalCount}
            pageSize={10}
            showSizeChanger={false}
            className="custom-pagination"
          />
        </div>
      </div>

      <style jsx global>{`
        .custom-table .ant-table-thead > tr > th {
          font-size: 12px;
          font-weight: 700;
          padding: 16px;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .custom-table .ant-table-tbody > tr > td {
          padding: 18px 16px;
          border-bottom: 1px solid #f1f5f9;
        }

        .custom-pagination .ant-pagination-item-active {
          border-color: #2563eb !important;
          background: #2563eb !important;
        }

        .custom-pagination .ant-pagination-item-active a {
          color: white !important;
        }
      `}</style>
    </div>
  );
}
