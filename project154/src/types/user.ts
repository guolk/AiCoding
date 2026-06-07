export type UserRole = 'user' | 'verified' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  role: UserRole;
  bio: string;
  totalRides: number;
  totalDistance: number;
  createdAt: string;
}

export interface UserFilters {
  role?: UserRole;
  search?: string;
}
