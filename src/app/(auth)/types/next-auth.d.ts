// src/types/next-auth.d.ts

import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

// JWT එකේ තියෙන types define කරනවා
declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    permissions: string[];
    companyId: string;
  }
}

// Session එකේ තියෙන types define කරනවා
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      permissions: string[];
      companyId: string;
    } & DefaultSession["user"];
  }

  // User එකේ තියෙන types define කරනවා
  interface User extends DefaultUser {
    role: string;
    permissions: string[];
    companyId: string;
  }
}