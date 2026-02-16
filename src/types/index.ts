export interface User {
  _id: string;
  name: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  key: string;
  plan: 'free' | 'premium';
  status: 'active' | 'inactive' | 'canceled';
}

export interface UserProfile {
  user: User;
  subscription: Subscription;
}

export interface FileItem {
  _id: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  url: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  userID: string;
}

export interface ApiError {
  message: string;
  status: number;
}

export type FileFilter = 'all' | 'images' | 'videos' | 'documents' | 'others';
export type ViewMode = 'grid' | 'list';
