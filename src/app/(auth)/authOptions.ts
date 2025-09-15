// src/app/lib/authOptions.ts
import { NextAuthOptions, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcrypt";
import { prisma } from "@/app/lib/prisma/prisma";
import * as speakeasy from "speakeasy";
import { JWT } from "next-auth/jwt";

// TODO: නිෂ්පාදන පරිසරය සඳහා, මෙය Upstash Redis වැනි ස්ථිර cache එකක් සමඟ ප්‍රතිස්ථාපනය කරන්න.
// උදාහරණයක් ලෙස: import { Ratelimit } from "@upstash/ratelimit";
// const ratelimit = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(5, "10 m") });
const loginAttempts = new Map<string, { count: number; expiry: number }>();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        // 2FA සඳහා අමතර code එකක්
        rememberMe: { label: "Remember Me", type: "checkbox" },
        otp: { label: "One-Time Password", type: "text", required: false },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials.password) {
            console.log("❌ Missing credentials.");
            return null;
          }

          // **ආරක්ෂාව 1: Rate Limiting**
          // එකම IP address එකකින් හෝ email එකකින් එන login requests සීමා කරයි.
          const now = Date.now();
          const attemptInfo = loginAttempts.get(credentials.email) || { count: 0, expiry: 0 };

          if (now < attemptInfo.expiry) {
            // තවමත් lock වී ඇත්නම්
            console.warn("🔒 Rate limit still active for:", credentials.email);
            return null;
          }

          if (attemptInfo.count >= 5) {
            console.warn("🔒 Rate limit exceeded for:", credentials.email);
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log("❌ User not found.");
            // වැරදි email එකක් දැම්මත්, rate limiting සඳහා ගණන් කරන්න. 10 நிமிட lock එකක්.
            loginAttempts.set(credentials.email, {
              count: attemptInfo.count + 1,
              // 5 වතාවට වඩා උත්සාහ කළහොත් මිනිත්තු 10ක් lock කරන්න
              expiry: attemptInfo.count + 1 >= 5 ? now + 10 * 60 * 1000 : 0,
            });
            return null;
          }

          // **ආරක්ෂාව 2: Hashed Password එකක් සමග සසඳනවා**
          const isPasswordCorrect = await compare(credentials.password, user.password as string);
          if (!isPasswordCorrect) {
            console.log("❌ Password incorrect.");
            loginAttempts.set(credentials.email, {
              count: attemptInfo.count + 1,
              // 5 වතාවට වඩා උත්සාහ කළහොත් මිනිත්තු 10ක් lock කරන්න
              expiry: attemptInfo.count + 1 >= 5 ? now + 10 * 60 * 1000 : 0,
            });
            return null;
          }

          // **ආරක්ෂාව 3: 2-Factor Authentication (2FA)**
          if (user.is2FAEnabled) {
            if (!credentials.otp) {
              console.log("⚠️ 2FA required but OTP is missing.");
              // 2FA අවශ්‍ය බව client-side එකට දැනුම් දෙන්න පුළුවන්
              return null;
            }
            // මෙහිදී ඔබගේ 2FA verification logic එක ක්‍රියාවට නැංවිය යුතුය.
            // TODO: සැබෑ OTP validation logic එකක් මෙතනට යොදන්න.
            const isOTPValid = speakeasy.totp.verify({
              secret: user.twoFactorSecret!, // Database එකේ ඇති පරිශීලකයාගේ 2FA රහස
              encoding: "base32",
              token: credentials.otp,
              window: 1, // කාලය sync වීමේ ප්‍රමාදයන් සඳහා දෙපසටම එක් පියවරක් (30s) වලංගු කරයි
            });

            if (!isOTPValid) {
                console.log("❌ Invalid OTP.");
                return null;
            }
          }

          // සාර්ථක ලොග් වීමකදී, login attempts ගණන reset කරයි.
          loginAttempts.delete(credentials.email);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            permissions: JSON.parse(user.permissions), // JSON string එක array එකක් බවට පත් කරයි
            companyId: user.companyId,
            rememberMe: credentials?.rememberMe,
          };
        } catch (error) {
          console.error("🚨 Authorize function error:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // OAuth logins (Google) සහ Credentials logins යන දෙකටම පොදුවේ දත්ත එකතු කරයි.
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        // අමතර දත්ත (role, permissions) CredentialsProvider එකෙන් එන user ට පමණක් එකතු කරයි.
        if (account?.provider === "credentials") {
          token.role = user.role;
          token.permissions = user.permissions;
          // "Remember Me" තේරුවා නම් session එක දින 30ක්, නැත්නම් දින 1ක් තබාගන්න.
          if ((user as any).rememberMe) {
            token.exp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days
          } else {
            token.exp = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 hours
          }
          token.companyId = user.companyId;
          // token.is_authenticated = true; // මෙම property එක JWT type එකේ define කර නැත.
        }
        // OAuth logins වලට අවශ්‍ය නම් ඔබට මෙහිදී අමතර දත්ත එකතු කළ හැකිය.
        if (account?.provider === "google") {
          // token.is_authenticated = true; // මෙම property එක JWT type එකේ define කර නැත.
          token.role = 'user'; // උදාහරණයක් ලෙස
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        // Client-side එකේ session object එකට දත්ත එකතු කරයි.
        session.user.id = token.id as string;
        session.user.role = token.role as string; // Ensure token.role is treated as string
        session.user.permissions = token.permissions as string[];
        session.user.companyId = token.companyId;
        // session.user.is_authenticated = token.is_authenticated; // මෙම property එක Session type එකේ define කර නැත.
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  debug: process.env.NODE_ENV === "development",
};