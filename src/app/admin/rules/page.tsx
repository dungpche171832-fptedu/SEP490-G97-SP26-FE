"use client";

import { useEffect, useState } from "react";
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
    <main className="min-h-screen bg-slate-50 px-6 py-6 text-slate-900">
      <div className="mx-auto w-full max-w-[1280px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Quản lý rule tính tiền vé</h1>
          <p className="mt-1 text-sm font-medium text-slate-900">
            Thiết lập khoảng cách và giá vé theo loại xe
          </p>
        </div>

        <div className="mb-4 flex flex-wrap gap-3">
          <select
            value={carType}
            disabled={loading || saving || isEditing}
            onChange={(e) => setCarType(e.target.value as CarType)}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100 disabled:text-slate-900 disabled:opacity-100"
          >
            <option value="SEAT_9">SEAT_9</option>
            <option value="SEAT_16">SEAT_16</option>
            <option value="SEAT_45">SEAT_45</option>
          </select>

          <button
            onClick={() => fetchRules(carType)}
            disabled={loading || saving}
            type="button"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-50"
          >
            Tải lại
          </button>

          {!isEditing ? (
            <button
              onClick={handleEdit}
              disabled={loading || saving}
              type="button"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold !text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Chỉnh sửa
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={loading || saving}
                type="button"
                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold !text-white hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>

              <button
                onClick={handleCancelEdit}
                disabled={loading || saving}
                type="button"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-50"
              >
                Hủy
              </button>
            </>
          )}
        </div>

        {loading && <p className="text-sm font-medium text-slate-900">Đang tải dữ liệu...</p>}

        {!loading && error && <p className="mb-3 text-sm font-medium text-red-600">{error}</p>}

        {!loading && !error && message && (
          <p className="mb-3 text-sm font-medium text-green-700">{message}</p>
        )}

        {!loading && (
          <>
            <p className="mb-4 text-sm text-slate-900">
              <strong>Tổng số rule:</strong> {totalCount}
            </p>

            {rules.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-bold text-slate-900">
                        Loại xe
                      </th>
                      <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-bold text-slate-900">
                        Điểm đầu
                      </th>
                      <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-bold text-slate-900">
                        Điểm cuối
                      </th>
                      <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-bold text-slate-900">
                        Giá vé
                      </th>
                      {isEditing && (
                        <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-bold text-slate-900">
                          Cộng
                        </th>
                      )}
                      {isEditing && (
                        <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-bold text-slate-900">
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
                          <td className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
                            {rule.carType}
                          </td>

                          <td className="border-b border-slate-200 px-4 py-3">
                            <input
                              type="number"
                              value={rule.minKm}
                              disabled={!isEditing}
                              onChange={(e) => updateRuleField(index, "minKm", e.target.value)}
                              className={`w-full rounded-xl border px-3 py-2 text-sm font-semibold outline-none ${
                                !isEditing
                                  ? "border-slate-200 bg-slate-100 text-slate-900 disabled:text-slate-900 disabled:opacity-100"
                                  : "border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                              }`}
                            />
                          </td>

                          <td className="border-b border-slate-200 px-4 py-3">
                            <input
                              type="number"
                              value={rule.maxKm}
                              disabled={!isEditing}
                              placeholder={isLastRow ? "Không giới hạn" : ""}
                              onChange={(e) => updateRuleField(index, "maxKm", e.target.value)}
                              className={`w-full rounded-xl border px-3 py-2 text-sm font-semibold outline-none placeholder:text-slate-500 ${
                                !isEditing
                                  ? "border-slate-200 bg-slate-100 text-slate-900 disabled:text-slate-900 disabled:opacity-100"
                                  : "border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                              }`}
                            />
                          </td>

                          <td className="h-[72px] border-b border-slate-200 px-4 py-3 align-top">
                            <div className="flex h-full flex-col justify-between">
                              <input
                                type="number"
                                value={rule.price}
                                disabled={!isEditing}
                                onChange={(e) => updateRuleField(index, "price", e.target.value)}
                                className={`h-10 w-full rounded-xl border px-3 py-2 text-sm font-semibold outline-none ${
                                  !isEditing
                                    ? "border-slate-200 bg-slate-100 text-slate-900 disabled:text-slate-900 disabled:opacity-100"
                                    : "border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                                }`}
                              />

                              <span className="text-left text-xs font-semibold leading-none text-slate-900">
                                {rule.price.trim() !== "" && !Number.isNaN(Number(rule.price))
                                  ? formatPrice(Number(rule.price))
                                  : "\u00A0"}
                              </span>
                            </div>
                          </td>

                          {isEditing && (
                            <td className="border-b border-slate-200 px-4 py-3">
                              {isLastRow ? (
                                <button
                                  onClick={handleAddLastRule}
                                  type="button"
                                  className="h-9 w-9 rounded-xl border border-slate-300 bg-white text-lg font-semibold text-slate-900 hover:bg-slate-50"
                                >
                                  +
                                </button>
                              ) : null}
                            </td>
                          )}

                          {isEditing && (
                            <td className="border-b border-slate-200 px-4 py-3">
                              {isLastRow ? (
                                <button
                                  onClick={handleRemoveLastRule}
                                  type="button"
                                  className="h-9 w-9 rounded-xl border border-red-200 bg-red-50 text-lg font-semibold text-red-600 hover:bg-red-100"
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
                <p className="text-sm font-medium text-slate-900">Chưa có dữ liệu rule.</p>

                {isEditing && (
                  <button
                    onClick={handleAddLastRule}
                    type="button"
                    className="mt-3 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
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
  );
}
