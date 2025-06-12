export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  USER = 'USER'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}
