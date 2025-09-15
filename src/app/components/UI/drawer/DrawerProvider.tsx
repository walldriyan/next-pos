"use client";

import React, { createContext, useState, useCallback, ReactNode } from "react";

interface DrawerProps {
  title?: string;
  width?: string;
  overlayClosable?: boolean;
}

interface DrawerContextType {
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  content: ReactNode | null;
  props: DrawerProps;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  openDrawer: (content: ReactNode, props?: DrawerProps) => void;
  closeDrawer: () => void;
}

export const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export const DrawerProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<ReactNode | null>(null);
  const [props, setProps] = useState<DrawerProps>({});

  const openDrawer = useCallback((newContent: ReactNode, newProps: DrawerProps = {}) => {
    setIsLoading(false); // Drawer එක විවෘත කරන විට loading state එක reset කරන්න
    setError(null); // Drawer එක විවෘත කරන විට error state එක reset කරන්න
    setContent(newContent);
    setProps(newProps);
    setIsOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    // Animation එක අවසන් වූ පසු content එක ඉවත් කිරීමට చిన్న delay එකක්.
    setTimeout(() => {
      setIsLoading(false);
      setError(null);
      setContent(null);
      setProps({});
    }, 150);
  }, []);

  const setLoading = useCallback((loading: boolean) => setIsLoading(loading), []);
  const setDrawerError = useCallback((error: string | null) => setError(error), []);

  return <DrawerContext.Provider value={{ isOpen, isLoading, error, content, props, openDrawer, closeDrawer, setLoading, setError: setDrawerError }}>{children}</DrawerContext.Provider>;
};