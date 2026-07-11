export type UserStatus = "active" | "away" | "inactive";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  image: string;
  role: string;
  companyName: string;
  department: string;
  country: string;
  status: UserStatus;
  indexedAt: string;
}

export interface UserDataset {
  items: User[];
  total: number;
}
