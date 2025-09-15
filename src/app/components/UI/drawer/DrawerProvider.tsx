"use client";

import React, { createContext, useState, useCallback, ReactNode } from "react";

interface DrawerProps {
  title?: string;
  width?: number;
  overlayClosable?: boolean;
}

interface DrawerContextType {
  isOpen: boolean;
  isLoading: boolean;
  content: ReactNode | null;
  props: DrawerProps;
  setLoading: (loading: boolean) => void;
  openDrawer: (content: ReactNode, props?: DrawerProps) => void;
  closeDrawer: () => void;
}

export const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export const DrawerProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);
  const [props, setProps] = useState<DrawerProps>({});

  const openDrawer = useCallback((newContent: ReactNode, newProps: DrawerProps = {}) => {
    setIsLoading(false); // Drawer එක විවෘත කරන විට loading state එක reset කරන්න
    setContent(newContent);
    setProps(newProps);
    setIsOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    // Animation එක අවසන් වූ පසු content එක ඉවත් කිරීමට చిన్న delay එකක්.
    setTimeout(() => {
      setIsLoading(false);
      setContent(null);
      setProps({});
    }, 150);
  }, []);

  const setLoading = useCallback((loading: boolean) => setIsLoading(loading), []);

  return <DrawerContext.Provider value={{ isOpen, isLoading, content, props, openDrawer, closeDrawer, setLoading }}>{children}</DrawerContext.Provider>;
};