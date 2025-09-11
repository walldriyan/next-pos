"use client"

import { useEffect } from "react";
import { AuthGuard } from "./(auth)/AuthGuard";
import { useUserStore } from "./states/userStore";
import { signIn, signOut, useSession } from "next-auth/react";
import Sidebar from "./components/dashbord/Sidebar";

// ඔයාගේ page.tsx file එකේ
export default function Home() {
  const { data: session, status } = useSession();
  const { login, logout } = useUserStore();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const { user } = session;
      
      if (user.id && user.email && user.name && user.role && user.permissions && user.companyId) {
        login({
          id: user.id, // .toString() remove කරන්න
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          companyId: user.companyId,
        });
      }
    } else if (status === "unauthenticated") {
      logout();
      // Auto redirect remove කරන්න - user manually login කරන්න ඕන
      // signIn(); // මේක comment කරන්න
    }
  }, [status, session, login, logout]);

  // Loading state
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // Not authenticated නම් login page එකට redirect කරන්න
  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Please Login</h1>
        <button 
          onClick={() => signIn()}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // AuthGuard එක පාවිච්චි කරන්න
  return (
    <>
    <AuthGuard requiredRoles={["ADMIN", "MANAGER"]}>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-4xl font-bold">Welcome to the Dashboard</h1>
        <p className="mt-4 text-lg text-gray-600">You are logged in as {session?.user?.name}.</p>
        <button 
          onClick={() => signOut()}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
       
      </div>
    </AuthGuard> 
    
    <Sidebar />
    
    </>
  );
}