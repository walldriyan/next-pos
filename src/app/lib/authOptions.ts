// src/app/lib/authOptions.ts

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { prisma } from "@/app/lib/prisma/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("🔐 Authorize function called with:", credentials?.email);

          if (!credentials?.email || !credentials.password) {
            console.log("❌ Missing credentials");
            return null;
          }

          // Database connection test
          const userCount = await prisma.user.count();
          console.log("📊 Total users in database:", userCount);

          // Database එකෙන් user හොයන්න
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          console.log("👤 User found:", user ? "Yes" : "No");
          if (user) {
            console.log("👤 User details:", {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              hasPassword: !!user.password
            });
          }

          if (!user) {
            console.log("User not found in database");
            return null;
          }

          // Password check කරන්න
          const isPasswordCorrect = await compare(
            credentials.password,
            user.password
          );

          console.log("Password correct:", isPasswordCorrect);

          if (!isPasswordCorrect) {
            console.log("Password incorrect");
            return null;
          }

          // Permissions parse කරන්න
          let permissions: string[] = [];
          try {
            permissions = JSON.parse(user.permissions || '[]');
          } catch (e) {
            console.log("Error parsing permissions:", e);
            permissions = [];
          }

          console.log("Login successful for user:", user.email);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            permissions: permissions,
            companyId: user.companyId,
          };

        } catch (error) {
          console.error("Authorize function error:", error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.permissions = user.permissions;
        token.companyId = user.companyId;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        (session.user as any).role = token.role;
        (session.user as any).permissions = token.permissions;
        (session.user as any).companyId = token.companyId;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login", // Correct path
    error: "/login", // Error page redirect කරන්න
  },

  debug: process.env.NODE_ENV === "development", // Development mode එකේ debug on කරන්න
};