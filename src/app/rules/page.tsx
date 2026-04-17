"use client";

import { useEffect, useState } from "react";
import { ruleService, Rule, CarType } from "@/services/ruleService";

export default function RulesPage() {
  const [carType, setCarType] = useState<CarType>("SEAT_9");
  const [rules, setRules] = useState<Rule[]>([]);
  const [message, setMessage] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRules = async (selectedCarType: CarType) => {
    try {
      setLoading(true);
      setError("");

      const data = await ruleService.getRules(selectedCarType);

      setRules(data.rules ?? []);
      setMessage(data.message ?? "");
      setTotalCount(data.totalCount ?? 0);
    } catch (err: unknown) {
      console.error("Fetch rules error:", err);

      let errorMessage = "Không tải được danh sách rule.";

      // Nếu lỗi từ service (throw new Error)
      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
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

  const formatKmRange = (minKm: number, maxKm: number | null) => {
    if (maxKm === null) return `Từ ${minKm} km trở lên`;
    return `${minKm} - ${maxKm} km`;
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Quản lý rule tính tiền vé</h1>

      <div style={{ marginBottom: 16, display: "flex", gap: 12 }}>
        <select
          value={carType}
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
          style={{
            padding: "8px 16px",
            border: "1px solid #ccc",
            borderRadius: 6,
            cursor: "pointer",
            background: "#fff",
          }}
        >
          Tải lại
        </button>
      </div>

      {loading && <p>Đang tải dữ liệu...</p>}

      {!loading && error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          {message && <p style={{ color: "green", marginBottom: 8 }}>{message}</p>}

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
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Loại xe</th>
                  <th style={thStyle}>Khoảng km</th>
                  <th style={thStyle}>Giá vé</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id}>
                    <td style={tdStyle}>{rule.id}</td>
                    <td style={tdStyle}>{rule.carType}</td>
                    <td style={tdStyle}>{formatKmRange(rule.minKm, rule.maxKm)}</td>
                    <td style={tdStyle}>{formatPrice(rule.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Chưa có dữ liệu rule.</p>
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
};
