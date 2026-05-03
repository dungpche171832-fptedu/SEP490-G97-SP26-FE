"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Empty, Input, Spin, message } from "antd";
import { useRouter } from "next/navigation";
import {
  DeleteOutlined,
  EditOutlined,
  LeftOutlined,
  PlusOutlined,
  RightOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { RouteTableItem } from "@/model/route";
import { getRole } from "@/lib/auth/auth.service";
import { getRouteTableItems } from "@/services/routeService";

const ITEMS_PER_PAGE = 5;

const normalizeRole = (role?: string | null): string => {
  return role?.replace("ROLE_", "").toLowerCase() || "";
};

export default function ManageRoutePage() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  const [routes, setRoutes] = useState<RouteTableItem[]>([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentRole, setCurrentRole] = useState("");

  const canCreateRoute = currentRole === "admin" || currentRole === "manager";

  useEffect(() => {
    setCurrentRole(normalizeRole(getRole()));
  }, []);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data = await getRouteTableItems();

        const sortedRoutes = [...data].sort(
          (firstRoute, secondRoute) => secondRoute.id - firstRoute.id,
        );

        setRoutes(sortedRoutes);
      } catch (error) {
        const messageText =
          error instanceof Error ? error.message : "Không thể tải danh sách tuyến đường";

        setErrorMessage(messageText);
        messageApi.error(messageText);
      } finally {
        setLoading(false);
      }
    };

    void fetchRoutes();
  }, [messageApi]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText]);

  const filteredRoutes = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) {
      return routes;
    }

    return routes.filter((route) => {
      const searchableText = [route.code, route.name, route.routeRevertCode, String(route.id)]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(keyword);
    });
  }, [routes, searchText]);

  const totalPages = Math.max(1, Math.ceil(filteredRoutes.length / ITEMS_PER_PAGE));

  const paginatedRoutes = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    return filteredRoutes.slice(startIndex, endIndex);
  }, [currentPage, filteredRoutes]);

  const startItem = filteredRoutes.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;

  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredRoutes.length);

  const handleCreateRoute = () => {
    router.push("/admin/manageRoute/create");
  };
  const handleEditRoute = (routeId: number) => {
    router.push(`/admin/manageRoute/${routeId}`);
  };

  const handleDeleteRoute = (routeId: number) => {
    messageApi.info(` tuyến ${routeId} không thể xóa vì đang sử dụng trong lịch trình hoạt động`);
  };

  return (
    <>
      {contextHolder}

      <main className="min-h-screen bg-[#f7f9fd] px-6 py-6">
        <section className="mb-7 rounded-3xl border border-[#eef3f8] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Input
              size="large"
              allowClear
              prefix={<SearchOutlined className="text-[#8ba0bd]" />}
              placeholder="Tìm mã, tên tuyến..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="h-14 max-w-[900px] rounded-2xl border-none bg-[#f7faff] px-4 text-sm shadow-none"
            />

            {canCreateRoute && (
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={handleCreateRoute}
                className="h-14 min-w-[220px] rounded-xl bg-[#1677ff] px-6 text-sm font-semibold shadow-[0_8px_18px_rgba(22,119,255,0.28)]"
              >
                Thêm Tuyến Đường
              </Button>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-[#edf2f7] bg-white shadow-[0_12px_35px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] table-fixed border-collapse">
              <thead>
                <tr className="h-[72px] bg-[#f8fbff] text-left text-xs font-bold uppercase tracking-[0.18em] text-[#71809a]">
                  <th className="w-[18%] px-8">Mã Tuyến</th>
                  <th className="w-[32%] px-8">Tên Tuyến</th>
                  <th className="w-[20%] px-8">Tuyến Ngược</th>
                  <th className="w-[14%] px-8 text-center">Số Trạm</th>
                  <th className="w-[16%] px-8 text-center">Quản Lý</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="h-[320px] text-center">
                      <Spin />
                    </td>
                  </tr>
                )}

                {!loading && errorMessage && (
                  <tr>
                    <td colSpan={5} className="h-[320px] px-8 text-center">
                      <div className="text-sm font-medium text-red-500">{errorMessage}</div>
                    </td>
                  </tr>
                )}

                {!loading && !errorMessage && paginatedRoutes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="h-[320px] px-8 text-center">
                      <Empty description="Không có tuyến đường phù hợp" />
                    </td>
                  </tr>
                )}

                {!loading &&
                  !errorMessage &&
                  paginatedRoutes.map((route) => (
                    <tr
                      key={route.id}
                      className="h-[86px] border-t border-[#f0f4f8] text-sm text-[#172033]"
                    >
                      <td className="px-8">
                        <span className="inline-flex rounded-md bg-[#eaf4ff] px-3 py-2 text-xs font-bold text-[#1677ff]">
                          {route.code}
                        </span>
                      </td>

                      <td className="px-8 font-bold">{route.name}</td>

                      <td className="px-8">
                        <span className="inline-flex rounded-full bg-[#eaf4ff] px-4 py-2 text-xs font-bold text-[#1677ff]">
                          {route.routeRevertCode}
                        </span>
                      </td>

                      <td className="px-8 text-center">
                        <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl bg-[#eef4fa] px-3 font-bold text-[#172033]">
                          {route.stationCount}
                        </span>
                      </td>

                      <td className="px-8">
                        <div className="flex items-center justify-center gap-5">
                          <button
                            type="button"
                            aria-label="Chỉnh sửa tuyến đường"
                            onClick={() => handleEditRoute(route.id)}
                            className="text-lg text-[#1677ff] transition hover:scale-110"
                          >
                            <EditOutlined />
                          </button>

                          <button
                            type="button"
                            aria-label="Xóa tuyến đường"
                            onClick={() => handleDeleteRoute(route.id)}
                            className="text-lg text-[#ef2323] transition hover:scale-110"
                          >
                            <DeleteOutlined />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="flex min-h-[76px] flex-col gap-4 border-t border-[#f0f4f8] px-8 py-5 md:flex-row md:items-center md:justify-between">
            <p className="text-sm italic text-[#63748e]">
              Hiển thị {startItem}-{endItem} trên {filteredRoutes.length} tuyến
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8ba0bd] transition hover:bg-[#edf4ff] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <LeftOutlined />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`h-10 w-10 rounded-xl text-sm font-bold transition ${
                    currentPage === page
                      ? "bg-[#1677ff] text-white shadow-[0_8px_18px_rgba(22,119,255,0.28)]"
                      : "text-[#334155] hover:bg-[#edf4ff]"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8ba0bd] transition hover:bg-[#edf4ff] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RightOutlined />
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
