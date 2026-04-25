"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { ruleService, Rule, CarType, ReplaceRuleRequest } from "@/services/ruleService";

type EditableRule = {
  id: number;
  carType: CarType;
  minKm: string;
  maxKm: string;
  price: string;
};

export default function RulesPage() {
  const [carType, setCarType] = useState<CarType>("SEAT_9");
  const [rules, setRules] = useState<EditableRule[]>([]);
  const [message, setMessage] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const getNextId = () => {
    if (rules.length === 0) return 1;
    return Math.max(...rules.map((r) => r.id)) + 1;
  };

  const mapApiRulesToEditableRules = (apiRules: Rule[]): EditableRule[] => {
    return apiRules.map((rule) => ({
      id: rule.id,
      carType: rule.carType,
      minKm: String(rule.minKm ?? ""),
      maxKm: rule.maxKm === null ? "" : String(rule.maxKm),
      price: String(rule.price ?? 0),
    }));
  };

  const fetchRules = async (selectedCarType: CarType) => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const data = await ruleService.getRules(selectedCarType);

      setRules(mapApiRulesToEditableRules(data.rules ?? []));
      setMessage(data.message ?? "");
      setTotalCount(data.totalCount ?? 0);
      setIsEditing(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Không tải được danh sách rule.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules(carType);
  }, [carType]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("vi-VN").format(value) + " VNĐ";
  };

  const updateRuleField = (index: number, field: "minKm" | "maxKm" | "price", value: string) => {
    if (!isEditing) return;

    setRules((prev) => {
      const next = [...prev];
      const current = next[index];

      if (!current) return prev;

      next[index] = {
        ...current,
        [field]: value,
      };

      return next;
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
    setMessage("");
  };

  const handleCancelEdit = async () => {
    await fetchRules(carType);
  };

  const handleAddLastRule = () => {
    if (!isEditing) return;

    if (rules.length === 0) {
      const firstRule: EditableRule = {
        id: 1,
        carType,
        minKm: "0",
        maxKm: "",
        price: "0",
      };

      setRules([firstRule]);
      setTotalCount(1);
      setError("");
      return;
    }

    const lastRule = rules[rules.length - 1];

    if (lastRule.maxKm.trim() === "") {
      setError("Bạn cần nhập điểm cuối cho hàng cuối hiện tại trước khi thêm hàng mới.");
      return;
    }

    const minKm = Number(lastRule.minKm);
    const maxKm = Number(lastRule.maxKm);

    if (Number.isNaN(minKm) || Number.isNaN(maxKm)) {
      setError("Điểm đầu và điểm cuối phải là số hợp lệ.");
      return;
    }

    if (maxKm <= minKm) {
      setError("Điểm cuối phải lớn hơn điểm đầu.");
      return;
    }

    const newRule: EditableRule = {
      id: getNextId(),
      carType,
      minKm: String(maxKm),
      maxKm: "",
      price: "0",
    };

    setRules((prev) => [...prev, newRule]);
    setTotalCount((prev) => prev + 1);
    setError("");
  };

  const handleRemoveLastRule = () => {
    if (!isEditing) return;
    if (rules.length === 0) return;

    if (rules.length === 1) {
      setRules([]);
      setTotalCount(0);
      setError("");
      return;
    }

    const nextRules = [...rules];
    nextRules.pop();

    nextRules[nextRules.length - 1] = {
      ...nextRules[nextRules.length - 1],
      maxKm: "",
    };

    setRules(nextRules);
    setTotalCount(nextRules.length);
    setError("");
  };

  const validateRulesBeforeSave = (): string | null => {
    if (rules.length === 0) {
      return "Danh sách rule không được để trống.";
    }

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      const isLast = i === rules.length - 1;

      if (rule.minKm.trim() === "") {
        return `Điểm đầu của dòng ${i + 1} không được để trống.`;
      }

      if (rule.price.trim() === "") {
        return `Giá vé của dòng ${i + 1} không được để trống.`;
      }

      const minKm = Number(rule.minKm);
      const price = Number(rule.price);

      if (Number.isNaN(minKm) || minKm < 0) {
        return `Điểm đầu của dòng ${i + 1} không hợp lệ.`;
      }

      if (Number.isNaN(price) || price < 0) {
        return `Giá vé của dòng ${i + 1} không hợp lệ.`;
      }

      if (isLast) {
        if (rule.maxKm.trim() !== "") {
          return "Dòng cuối cùng phải để trống điểm cuối.";
        }
      } else {
        if (rule.maxKm.trim() === "") {
          return `Điểm cuối của dòng ${i + 1} không được để trống.`;
        }

        const maxKm = Number(rule.maxKm);

        if (Number.isNaN(maxKm)) {
          return `Điểm cuối của dòng ${i + 1} không hợp lệ.`;
        }

        if (maxKm <= minKm) {
          return `Điểm cuối của dòng ${i + 1} phải lớn hơn điểm đầu.`;
        }

        const nextMinKm = Number(rules[i + 1].minKm);

        if (maxKm !== nextMinKm) {
          return `Điểm cuối của dòng ${i + 1} phải bằng điểm đầu của dòng ${i + 2}.`;
        }
      }
    }

    return null;
  };

  const handleSave = async () => {
    try {
      setError("");
      setMessage("");

      const validationError = validateRulesBeforeSave();
      if (validationError) {
        setError(validationError);
        return;
      }

      setSaving(true);

      const payload: ReplaceRuleRequest = {
        carType,
        rules: rules.map((rule, index) => ({
          minKm: Number(rule.minKm),
          maxKm: index === rules.length - 1 ? null : Number(rule.maxKm),
          price: Number(rule.price),
        })),
      };

      const response = await ruleService.replaceRules(payload);

      setRules(mapApiRulesToEditableRules(response.rules ?? []));
      setMessage(response.message ?? "Lưu bộ rule thành công.");
      setTotalCount(response.totalCount ?? response.rules?.length ?? 0);
      setIsEditing(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Không thể lưu bộ rule.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Header />

      <main className="ml-64 pt-16 p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Quản lý rule tính tiền vé</h1>
            <p className="text-sm text-slate-500 mt-1">
              Thiết lập khoảng cách và giá vé theo loại xe
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <select
              value={carType}
              disabled={loading || saving || isEditing}
              onChange={(e) => setCarType(e.target.value as CarType)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100"
            >
              <option value="SEAT_9">SEAT_9</option>
              <option value="SEAT_16">SEAT_16</option>
              <option value="LIMOUSINE_11">LIMOUSINE_11</option>
            </select>

            <button
              onClick={() => fetchRules(carType)}
              disabled={loading || saving}
              type="button"
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              Tải lại
            </button>

            {!isEditing ? (
              <button
                onClick={handleEdit}
                disabled={loading || saving}
                type="button"
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                Chỉnh sửa
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading || saving}
                  type="button"
                  className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? "Đang lưu..." : "Lưu"}
                </button>

                <button
                  onClick={handleCancelEdit}
                  disabled={loading || saving}
                  type="button"
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                >
                  Hủy
                </button>
              </>
            )}
          </div>

          {loading && <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>}

          {!loading && error && <p className="text-sm text-red-500 mb-3">{error}</p>}

          {!loading && !error && message && (
            <p className="text-sm text-green-600 mb-3">{message}</p>
          )}

          {!loading && (
            <>
              <p className="text-sm text-slate-700 mb-4">
                <strong>Tổng số rule:</strong> {totalCount}
              </p>

              {rules.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full border-collapse bg-white">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="text-left px-4 py-3 text-sm font-bold text-slate-700 border-b border-slate-200">
                          Loại xe
                        </th>
                        <th className="text-left px-4 py-3 text-sm font-bold text-slate-700 border-b border-slate-200">
                          Điểm đầu
                        </th>
                        <th className="text-left px-4 py-3 text-sm font-bold text-slate-700 border-b border-slate-200">
                          Điểm cuối
                        </th>
                        <th className="text-left px-4 py-3 text-sm font-bold text-slate-700 border-b border-slate-200">
                          Giá vé
                        </th>
                        {isEditing && (
                          <th className="text-left px-4 py-3 text-sm font-bold text-slate-700 border-b border-slate-200">
                            Cộng
                          </th>
                        )}
                        {isEditing && (
                          <th className="text-left px-4 py-3 text-sm font-bold text-slate-700 border-b border-slate-200">
                            Trừ
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {rules.map((rule, index) => {
                        const isLastRow = index === rules.length - 1;

                        return (
                          <tr
                            key={`${rule.id}-${index}`}
                            className={isEditing && isLastRow ? "bg-amber-50" : "bg-white"}
                          >
                            <td className="px-4 py-3 border-b border-slate-200 text-sm text-slate-700">
                              {rule.carType}
                            </td>

                            <td className="px-4 py-3 border-b border-slate-200">
                              <input
                                type="number"
                                value={rule.minKm}
                                disabled={!isEditing}
                                onChange={(e) => updateRuleField(index, "minKm", e.target.value)}
                                className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${
                                  !isEditing
                                    ? "bg-slate-100 border-slate-200 text-slate-500"
                                    : "bg-white border-slate-300 focus:ring-2 focus:ring-blue-500/20"
                                }`}
                              />
                            </td>

                            <td className="px-4 py-3 border-b border-slate-200">
                              <input
                                type="number"
                                value={rule.maxKm}
                                disabled={!isEditing}
                                placeholder={isLastRow ? "Không giới hạn" : ""}
                                onChange={(e) => updateRuleField(index, "maxKm", e.target.value)}
                                className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${
                                  !isEditing
                                    ? "bg-slate-100 border-slate-200 text-slate-500"
                                    : "bg-white border-slate-300 focus:ring-2 focus:ring-blue-500/20"
                                }`}
                              />
                            </td>

                            <td className="px-4 py-3 border-b border-slate-200 align-top h-[72px]">
                              <div className="flex flex-col justify-between h-full">
                                {/* Input */}
                                <input
                                  type="number"
                                  value={rule.price}
                                  disabled={!isEditing}
                                  onChange={(e) => updateRuleField(index, "price", e.target.value)}
                                  className={`w-full h-10 px-3 py-2 rounded-xl border text-sm outline-none ${
                                    !isEditing
                                      ? "bg-slate-100 border-slate-200 text-slate-500"
                                      : "bg-white border-slate-300 focus:ring-2 focus:ring-blue-500/20"
                                  }`}
                                />

                                {/* VND */}
                                <span className="text-xs text-slate-500 leading-none text-left">
                                  {rule.price.trim() !== "" && !Number.isNaN(Number(rule.price))
                                    ? formatPrice(Number(rule.price))
                                    : "\u00A0"}
                                </span>
                              </div>
                            </td>

                            {isEditing && (
                              <td className="px-4 py-3 border-b border-slate-200">
                                {isLastRow ? (
                                  <button
                                    onClick={handleAddLastRule}
                                    type="button"
                                    className="w-9 h-9 rounded-xl border border-slate-300 bg-white text-slate-700 text-lg hover:bg-slate-50"
                                  >
                                    +
                                  </button>
                                ) : null}
                              </td>
                            )}

                            {isEditing && (
                              <td className="px-4 py-3 border-b border-slate-200">
                                {isLastRow ? (
                                  <button
                                    onClick={handleRemoveLastRule}
                                    type="button"
                                    className="w-9 h-9 rounded-xl border border-red-200 bg-red-50 text-red-600 text-lg hover:bg-red-100"
                                  >
                                    -
                                  </button>
                                ) : null}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-slate-500">Chưa có dữ liệu rule.</p>

                  {isEditing && (
                    <button
                      onClick={handleAddLastRule}
                      type="button"
                      className="mt-3 px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50"
                    >
                      Tạo dòng đầu tiên
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
