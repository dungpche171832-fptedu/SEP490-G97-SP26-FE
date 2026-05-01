"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  Input,
  Button,
  Tag,
  Pagination,
  Space,
  ConfigProvider,
  message,
  Select,
} from "antd";
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { planService } from "@/services/planService";
import type { Plan, PlanResponse, PlanStationResponse, PlanStatus } from "@/model/plan";

interface PlanTableItem {
  id: number;
  key: string;
  code: string;
  driver: string;
  driverPhone: string;
  routeName: string;
  startStation: string;
  endStation: string;
  startTime: string;
  rawStartTime: string;
  status: PlanStatus;
}

function formatDateTime(value: string): string {
  if (!value) return "-";

  const normalizedValue = value.replace("T", " ");

  return normalizedValue.slice(0, 16);
}

function getTimeValue(value: string): number {
  if (!value) return 0;

  const time = new Date(value).getTime();

  return Number.isNaN(time) ? 0 : time;
}

function sortPlansByStartTime(a: PlanTableItem, b: PlanTableItem): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTime = today.getTime();

  const aTime = getTimeValue(a.rawStartTime);
  const bTime = getTimeValue(b.rawStartTime);

  const aIsPast = aTime < todayTime;
  const bIsPast = bTime < todayTime;

  if (aIsPast !== bIsPast) {
    return aIsPast ? 1 : -1;
  }

  return bTime - aTime;
}

function getSortedStations(stations: PlanStationResponse[] = []): PlanStationResponse[] {
  return [...stations].sort((a, b) => a.order - b.order);
}

function getStatusLabel(status: PlanStatus): string {
  switch (status) {
    case "ACTIVE":
      return "Hoạt động";
    case "INACTIVE":
      return "Không hoạt động";
    case "RUNNING":
      return "Đang chạy";
    case "COMPLETE":
      return "Hoàn thành";
    default:
      return status;
  }
}

export default function PlanManagementPage() {
  const router = useRouter();

  const [plans, setPlans] = useState<PlanTableItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<PlanStatus | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const pageSize = 10;

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);

      const response: PlanResponse = await planService.getListPlans();

      const mappedData: PlanTableItem[] = (response.plans || []).map((item: Plan) => {
        const sortedStations = getSortedStations(item.stations);
        const startStation = sortedStations[0]?.stationName || "-";
        const endStation = sortedStations[sortedStations.length - 1]?.stationName || "-";

        return {
          id: item.id,
          key: String(item.id),
          code: item.code,
          driver: item.driverName,
          driverPhone: item.driverPhone || "-",
          routeName: item.routeName || "-",
          startStation,
          endStation,
          startTime: formatDateTime(item.startTime),
          rawStartTime: item.startTime,
          status: item.status,
        };
      });

      setPlans([...mappedData].sort(sortPlansByStartTime));
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

    return plans.filter((item) => {
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;

      const matchesKeyword =
        !keyword ||
        item.code.toLowerCase().includes(keyword) ||
        item.driver.toLowerCase().includes(keyword) ||
        item.driverPhone.toLowerCase().includes(keyword) ||
        item.routeName.toLowerCase().includes(keyword) ||
        item.startStation.toLowerCase().includes(keyword) ||
        item.endStation.toLowerCase().includes(keyword);

      return matchesStatus && matchesKeyword;
    });
  }, [plans, searchText, statusFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, statusFilter]);

  const columns: ColumnsType<PlanTableItem> = [
    {
      title: "MÃ LỊCH TRÌNH",
      dataIndex: "code",
      key: "code",
      align: "center",
      render: (text: string) => <span className="font-bold text-slate-700">{text}</span>,
    },
    {
      title: "TUYẾN",
      dataIndex: "routeName",
      key: "routeName",
      render: (text: string, record) => (
        <div>
          <div className="font-semibold text-slate-700">{text}</div>
          <div className="text-xs text-slate-400">
            {record.startStation} → {record.endStation}
          </div>
        </div>
      ),
    },
    {
      title: "TÀI XẾ",
      dataIndex: "driver",
      key: "driver",
      render: (text: string, record) => (
        <div>
          <div className="font-medium text-slate-700">{text}</div>
          <div className="text-xs text-slate-400">{record.driverPhone}</div>
        </div>
      ),
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
      render: (status: PlanStatus) => {
        let bgColor = "#F1F5F9";
        let textColor = "#64748B";

        if (status === "ACTIVE") {
          bgColor = "#E6FFFA";
          textColor = "#059669";
        }

        if (status === "RUNNING") {
          bgColor = "#EFF8FF";
          textColor = "#1570EF";
        }

        if (status === "COMPLETE") {
          bgColor = "#F2F4F7";
          textColor = "#344054";
        }

        if (status === "INACTIVE") {
          bgColor = "#FEF3F2";
          textColor = "#D92D20";
        }

        return (
          <Tag
            className="rounded-full border-none px-4 py-0.5 font-medium"
            color={bgColor}
            style={{ color: textColor }}
          >
            {getStatusLabel(status)}
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

        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Input
              placeholder="Tìm kiếm mã, tài xế, tuyến..."
              prefix={<SearchOutlined className="mr-2 text-slate-400" />}
              className="h-11 w-full rounded-lg border-slate-200 bg-slate-50/50 sm:w-[420px]"
              value={searchText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
              allowClear
            />

            <Select<PlanStatus | "ALL">
              value={statusFilter}
              onChange={(value: PlanStatus | "ALL") => setStatusFilter(value)}
              className="h-11 w-full sm:w-56"
              options={[
                { value: "ALL", label: "Tất cả trạng thái" },
                { value: "ACTIVE", label: "Hoạt động" },
                { value: "INACTIVE", label: "Không hoạt động" },
                { value: "RUNNING", label: "Đang chạy" },
                { value: "COMPLETE", label: "Hoàn thành" },
              ]}
            />
          </div>

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
              dataSource={paginatedData}
              pagination={false}
              loading={loading}
              rowKey="key"
              className="custom-table"
            />
          </ConfigProvider>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 pb-10 sm:flex-row">
          <span className="text-sm font-medium text-slate-500">
            Hiển thị {paginatedData.length} trên {filteredData.length} lịch trình
          </span>

          <Pagination
            current={currentPage}
            total={filteredData.length}
            pageSize={pageSize}
            showSizeChanger={false}
            className="custom-pagination"
            onChange={(page: number) => setCurrentPage(page)}
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
