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

export const deleteEmployee = async (id: number) => {
  const token = localStorage.getItem("token");

  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
