"use client"

import { signIn, useSession } from "next-auth/react";
import { useUserStore } from "./states/userStore";
import { useEffect } from "react";
import { AuthGuard } from "./(auth)/AuthGuard";

export default function Home() {

   const { data: session, status } = useSession();
  const { login, logout } = useUserStore();

  // NextAuth session එක Zustand store එකට sync කරනවා
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const { user } = session;
      
      // Make sure all required properties exist before logging in
      if (user.id && user.email && user.name && user.role && user.permissions && user.companyId) {
        login({
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          companyId: user.companyId,
        });
      }
    } else if (status === "unauthenticated") {
      logout();
      // Unauthenticated user කෙනෙක් නම් login page එකට redirect කරනවා
      signIn();
    }
  }, [status, session, login, logout]);

  // Loading state එක
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // AuthGuard එක පාවිච්චි කරලා page එක ආරක්ෂා කරනවා
  return (
    <AuthGuard requiredRoles={["ADMIN", "MANAGER"]}>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-4xl font-bold">Welcome to the Dashboard</h1>
        <p className="mt-4 text-lg text-gray-600">You are logged in as {session?.user?.name}.</p>
      </div>
    </AuthGuard>
  );
};