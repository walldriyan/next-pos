"use client";

import { useContext } from "react";
import { DrawerContext } from "./src/app/components/UI/drawer/DrawerProvider";

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) throw new Error("useDrawer must be used within a DrawerProvider");
  return context;
};