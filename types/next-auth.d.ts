import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: "user" | "admin" | "superadmin";
  }

  interface Session {
    user: User & {
      id?: string;
      role?: "user" | "admin" | "superadmin";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "user" | "admin" | "superadmin";
  }
}
