export type UserRole = 'admin' | 'editor' | 'viewer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  roles: UserRole[];
  status: 'active' | 'disabled';
  createdAt?: Date;
  updatedAt?: Date;
}

export type WithId<T> = T & { id: string };
