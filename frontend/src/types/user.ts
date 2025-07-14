export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface UserProfile extends User {
  bio?: string;
  avatarUrl?: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
}