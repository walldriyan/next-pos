// src/components/auth/AuthGuard.tsx
"use client";
import { ReactNode, useEffect, useState } from "react";
import { useUserStore } from "../states/userStore";

interface AuthGuardProps {
  children: ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
}

export const AuthGuard = ({ children, requiredRoles, requiredPermissions }: AuthGuardProps) => {
  const { isLoggedIn, user } = useUserStore();
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user) {
      let roleMatch = true;
      let permissionMatch = true;

      // Role එක check කරනවා
      if (requiredRoles && requiredRoles.length > 0) {
        roleMatch = requiredRoles.includes(user.role);
      }

      // Permission එක check කරනවා
      if (requiredPermissions && requiredPermissions.length > 0) {
        permissionMatch = requiredPermissions.every(permission => user.permissions.includes(permission));
      }

      setHasPermission(roleMatch && permissionMatch);
    } else {
      setHasPermission(false);
    }
  }, [isLoggedIn, user, requiredRoles, requiredPermissions]);

  if (!hasPermission) {
    return null; // Permission නැත්නම් component එක hide කරනවා
  }

  return <>{children}</>;
};