"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { UpdateIcon } from "@radix-ui/react-icons";
import { useDrawer } from "../../../../../useDrawer";

export const Drawer = () => {
  const { isOpen, isLoading, closeDrawer, content, props } = useDrawer();
  const { width = 300, overlayClosable = true, title = "Drawer" } = props;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          onEscapeKeyDown={closeDrawer}
          onPointerDownOutside={overlayClosable ? closeDrawer : (e) => e.preventDefault()}
          className="fixed top-0 right-0 z-50 h-full bg-white shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
          style={{ width }}
        >
          <VisuallyHidden asChild>
            <Dialog.Title>{title}</Dialog.Title>
          </VisuallyHidden>
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <UpdateIcon className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            content
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};