export enum UserRole {
    USER = "USER",
    STAFF = "STAFF",
    ADMIN = "ADMIN",
  }
  
  export type User = {
    id: string
    email: string
    password: string
    name?: string
    role: UserRole
    createdAt: Date
    updatedAt: Date
  }
  
  