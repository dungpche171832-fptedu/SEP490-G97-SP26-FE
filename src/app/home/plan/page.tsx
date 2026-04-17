"use client";

import React, { useEffect, useState } from "react";
import { Plan, PlanResponse } from "src/model/plan";
import { planService } from "src/services/planService";
import ScheduleCard from "src/components/plan/plan_card";

export default function ListPlanPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await planService.getListPlans();
        setPlans(data.plans);
      } catch (err) {
        setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại localhost:8080.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  if (error) return <div className="p-10 text-center text-red-500 font-medium">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 md:p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans?.map((plan) => (
          <ScheduleCard key={plan.id} plan={plan} />
        ))}
      </div>

      {plans?.length === 0 && (
        <div className="text-center py-20 text-slate-400">Không có dữ liệu lịch trình.</div>
      )}
    </div>
  );
}
