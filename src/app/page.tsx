"use client";

import { Button } from "@radix-ui/themes";


import { AuthGuard } from "./(auth)/AuthGuard";
import { signIn, signOut, useSession } from "next-auth/react";
import { useDrawer } from "../../useDrawer";


// Drawer එකේ content එක ලෙස පෙන්වන component එක
const DrawerContent = () => (
  <div className="p-4">
    <h2 className="text-lg font-semibold">My Drawer Content</h2>
    <p>This is some content inside the drawer.</p>
  </div>
);


export default function Home() {
  const { data: session, status } = useSession();
const { openDrawer } = useDrawer();

const handleOpenDrawer = () => {
    openDrawer(<DrawerContent />, {
      title: "My Drawer", // Accessibility සඳහා title එකක්
      width: 700, // Custom width (optional)
      overlayClosable: true, // Overlay click එකෙන් close වීමට (optional)
    });
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

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

  return (
    <>
    <div>{session?.user?.name}</div>
    <div>{session?.user?.permissions}</div>
      <AuthGuard requiredRoles={["ADMIN", "MANAGER"]}>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-4xl font-bold">Welcome to the Dashboard</h1>
          {/* <p className="mt-4 text-lg text-gray-600">You are logged in as {session?.user?.name}.</p> */}
          <button
            onClick={() => signOut()}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>

          <Button onClick={handleOpenDrawer} className="mt-4">
        Open Drawer
      </Button>
        </div>
      </AuthGuard>
    </>
  );
}
