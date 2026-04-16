export type AuthMode = "login" | "register";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    fullName: string;
    role: string;
    branchId: number | null;
  };
};

export type MessageResponse = {
  message: string;
};
