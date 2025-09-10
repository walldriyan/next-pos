// src/lib/auth/authOptions.ts

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { prisma } from "@/app/lib/prisma/prisma";

export const authOptions: NextAuthOptions = {
  // Provider එක හැම login type එකකටම වෙනස් වෙනවා
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // මේ function එක තමයි user ගේ details check කරන්නේ
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("ඊමේල් සහ මුරපදය අවශ්‍යයි.");
        }

        // 1. Prisma Global Client එක පාවිච්චි කරලා user කෙනෙක්ව හොයමු
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        // 2. User කෙනෙක් නැත්නම් error එකක් දෙමු
        if (!user) {
          throw new Error("අවලංගු ඊමේල් හෝ මුරපදය.");
        }

        // 3. User ගේ password එක compare කරලා check කරමු
        const isPasswordCorrect = await compare(
          credentials.password,
          user.password
        );

        // 4. Password එක වැරදි නම් error එකක් දෙමු
        if (!isPasswordCorrect) {
          throw new Error("අවලංගු ඊමේල් හෝ මුරපදය.");
        }

        // 5. හැමදේම හරි නම් user ගේ data ටික return කරමු
        // අපි මෙතන user ගේ role සහ permissions add කරන්න ඕන
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // role-based permissions වලට
          permissions: user.permissions, // attribute-based permissions වලට
          companyId: user.companyId, // multi-company support එකට
        };
      },
    }),
  ],

  // session management
  session: {
    strategy: "jwt", // අපි JWT පාවිච්චි කරනවා
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // JWT Callback
  callbacks: {
    // මේක තමයි JWT එකට role සහ permissions එකතු කරන්නේ
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.permissions = user.permissions;
        token.companyId = user.companyId;
      }
      return token;
    },

    // Session Callback
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role as string;
        session.user.permissions = token.permissions as string[];
        session.user.companyId = token.companyId as string;
      }
      return session;
    },
  },

  // login, logout වගේ pages
  pages: {
    signIn: "/auth/login",
  },
};