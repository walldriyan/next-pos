// src/components/auth/AuthGuard.tsx
"use client";
import { useSession } from "next-auth/react";
import { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
}
export const AuthGuard = ({
  children,
  requiredRoles,
  requiredPermissions,
}: AuthGuardProps) => {
  const { data: session } = useSession();
  // session එක null නම් හෝ user object එක නැත්නම්, කිසිවක් render නොකරන්න.
  if (!session || !session.user) {
    return null;
  }
  const { user } = session;
  let roleMatch = true;
  let permissionMatch = true;
  // Role එක check කරනවා
  if (requiredRoles && requiredRoles.length > 0) {
    // user.role එක string එකක් බවට ಖಚಿತ කරගන්නවා.
    roleMatch = requiredRoles.includes(user.role as string);
  }
  // Permission එක check කරනවා
  if (requiredPermissions && requiredPermissions.length > 0) {
    // user.permissions array එකක් බවට ಖಚಿತ කරගන්නවා.
    permissionMatch = requiredPermissions.every((permission) =>
      (user.permissions as string[]).includes(permission)
    );
  }
  // Role සහ Permission යන දෙකම match වෙනවා නම් පමණක් children render කරනවා.
  if (roleMatch && permissionMatch) {
    return <>{children}</>;
  }
  // Permission නැත්නම් component එක hide කරනවා
  return null;
};
