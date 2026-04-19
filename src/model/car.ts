export interface CarBranch {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  id: number;
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  imageUrl: string;
}

export interface Car {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  id: number;
  licensePlate: string;
  branch: CarBranch;
  carType: string;
  totalSeat: number;
  status: string;
  manufactureYear: number;
  description: string;
}

export interface CarListResponse {
  cars: Car[];
  message: string;
  totalCount: number;
}
