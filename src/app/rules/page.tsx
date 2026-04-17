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
      console.error("Fetch rules error:", err);

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
          return "Dòng cuối cùng phải có điểm cuối để trống (null).";
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
      console.error("Save rules error:", err);

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
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Quản lý rule tính tiền vé</h1>

      <div style={{ marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <select
          value={carType}
          disabled={loading || saving || isEditing}
          onChange={(e) => setCarType(e.target.value as CarType)}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        >
          <option value="SEAT_9">SEAT_9</option>
          <option value="SEAT_16">SEAT_16</option>
          <option value="LIMOUSINE_11">LIMOUSINE_11</option>
        </select>

        <button
          onClick={() => fetchRules(carType)}
          style={secondaryButtonStyle}
          disabled={loading || saving}
        >
          Tải lại
        </button>

        {!isEditing ? (
          <button
            onClick={handleEdit}
            style={primaryButtonStyle}
            disabled={loading || saving}
            type="button"
          >
            Chỉnh sửa
          </button>
        ) : (
          <>
            <button
              onClick={handleSave}
              style={successButtonStyle}
              disabled={loading || saving}
              type="button"
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>

            <button
              onClick={handleCancelEdit}
              style={secondaryButtonStyle}
              disabled={loading || saving}
              type="button"
            >
              Hủy
            </button>
          </>
        )}
      </div>

      {loading && <p>Đang tải dữ liệu...</p>}

      {!loading && error && <p style={{ color: "red", marginBottom: 12 }}>{error}</p>}

      {!loading && !error && message && (
        <p style={{ color: "green", marginBottom: 8 }}>{message}</p>
      )}

      {!loading && (
        <>
          <p style={{ marginBottom: 16 }}>
            <strong>Tổng số rule:</strong> {totalCount}
          </p>

          {rules.length > 0 ? (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "#fff",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>Loại xe</th>
                  <th style={thStyle}>Điểm đầu</th>
                  <th style={thStyle}>Điểm cuối</th>
                  <th style={thStyle}>Giá vé</th>
                  {isEditing && <th style={thStyle}></th>}
                  {isEditing && <th style={thStyle}></th>}
                </tr>
              </thead>
              <tbody>
                {rules.map((rule, index) => {
                  const isLastRow = index === rules.length - 1;

                  return (
                    <tr
                      key={`${rule.id}-${index}`}
                      style={isEditing && isLastRow ? { background: "#fff7e6" } : {}}
                    >
                      <td style={tdStyle}>{rule.carType}</td>

                      <td style={tdStyle}>
                        <input
                          type="number"
                          value={rule.minKm}
                          disabled={!isEditing}
                          onChange={(e) => updateRuleField(index, "minKm", e.target.value)}
                          style={{
                            ...inputStyle,
                            backgroundColor: !isEditing ? "#f5f5f5" : "#fff",
                          }}
                        />
                      </td>

                      <td style={tdStyle}>
                        <input
                          type="number"
                          value={rule.maxKm}
                          disabled={!isEditing || (!isLastRow && false)}
                          placeholder={isLastRow ? "Không giới hạn" : ""}
                          onChange={(e) => updateRuleField(index, "maxKm", e.target.value)}
                          style={{
                            ...inputStyle,
                            backgroundColor: !isEditing ? "#f5f5f5" : "#fff",
                          }}
                        />
                      </td>

                      <td style={tdStyle}>
                        <input
                          type="number"
                          value={rule.price}
                          disabled={!isEditing}
                          onChange={(e) => updateRuleField(index, "price", e.target.value)}
                          style={{
                            ...inputStyle,
                            backgroundColor: !isEditing ? "#f5f5f5" : "#fff",
                          }}
                        />
                        <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                          {rule.price.trim() !== "" && !Number.isNaN(Number(rule.price))
                            ? formatPrice(Number(rule.price))
                            : ""}
                        </div>
                      </td>

                      {isEditing && (
                        <td style={tdStyle}>
                          {isLastRow ? (
                            <button
                              onClick={handleAddLastRule}
                              style={actionButtonStyle}
                              type="button"
                            >
                              +
                            </button>
                          ) : null}
                        </td>
                      )}

                      {isEditing && (
                        <td style={tdStyle}>
                          {isLastRow ? (
                            <button
                              onClick={handleRemoveLastRule}
                              style={dangerButtonStyle}
                              type="button"
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
          ) : (
            <div>
              <p>Chưa có dữ liệu rule.</p>

              {isEditing && (
                <button onClick={handleAddLastRule} style={secondaryButtonStyle} type="button">
                  Tạo dòng đầu tiên
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "12px",
  textAlign: "left",
  background: "#f5f5f5",
};

const tdStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "12px",
  verticalAlign: "top",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #ccc",
  borderRadius: 6,
  boxSizing: "border-box",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  border: "1px solid #1677ff",
  borderRadius: 6,
  cursor: "pointer",
  background: "#1677ff",
  color: "#fff",
};

const successButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  border: "1px solid #389e0d",
  borderRadius: 6,
  cursor: "pointer",
  background: "#52c41a",
  color: "#fff",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  border: "1px solid #ccc",
  borderRadius: 6,
  cursor: "pointer",
  background: "#fff",
};

const actionButtonStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  border: "1px solid #ccc",
  borderRadius: 6,
  cursor: "pointer",
  background: "#fff",
  fontSize: 18,
};

const dangerButtonStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  border: "1px solid #ffccc7",
  borderRadius: 6,
  cursor: "pointer",
  background: "#fff1f0",
  color: "#cf1322",
  fontSize: 18,
};
