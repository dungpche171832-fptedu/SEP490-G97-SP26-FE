const API_URL = "http://localhost:8080/api/employees";

export const getEmployees = async (page = 1) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}?page=${page}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch employees");

  return res.json();
};

export const getEmployeeById = async (id: number) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`http://localhost:8080/api/employees/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch employee");

  return res.json();
};

export const createEmployee = async (data: EmployeeForm) => {
  const token = localStorage.getItem("token");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create employee");

  return res.json();
};

export const deleteEmployee = async (id: number) => {
  const token = localStorage.getItem("token");

  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

interface EmployeeForm {
  fullName: string;
  email: string;
  password: string;
  role: string;
  branchId: number;
}
