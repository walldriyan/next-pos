"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Cross2Icon, UpdateIcon } from "@radix-ui/react-icons";
import { useDrawer } from "../../../../../useDrawer";

export const Drawer = () => {
  const { isOpen, isLoading, closeDrawer, content, props } = useDrawer();
  const { width = "w-[300px]", overlayClosable = false, title = "Drawer" } = props;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:duration-150" />
        <Dialog.Content
          onEscapeKeyDown={closeDrawer}
          onPointerDownOutside={overlayClosable ? closeDrawer : (e) => e.preventDefault()}
          onInteractOutside={overlayClosable ? undefined : (e) => e.preventDefault()}
          className={`fixed top-0 right-0 z-50 flex h-full flex-col bg-white shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right data-[state=closed]:duration-150 ${width}`}
        >
          <div className="flex items-center justify-between border-b p-4">
            <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
            <Dialog.Close className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
              <Cross2Icon className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          <div className="relative flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <UpdateIcon className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : (
              content
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};