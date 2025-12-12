
import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: "USER" | "ADMIN" | "SUPERADMIN"; 
  }

  interface Session {
    user: User & {
      id?: string;
      role?: "USER" | "ADMIN" | "SUPERADMIN"; 
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "USER" | "ADMIN" | "SUPERADMIN"; 
  }
}

