"use client"

import type React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "full"
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  className?: string
}

const sizeClasses = {
  sm: "max-w-[calc(100vw-1rem)] xs:max-w-sm sm:max-w-md",
  md: "max-w-[calc(100vw-1rem)] xs:max-w-md sm:max-w-lg",
  lg: "max-w-[calc(100vw-1rem)] xs:max-w-lg sm:max-w-2xl",
  xl: "max-w-[calc(100vw-1rem)] xs:max-w-xl sm:max-w-4xl",
  full: "max-w-[calc(100vw-0.5rem)] max-h-[calc(100vh-0.5rem)] xs:max-w-[95vw] xs:max-h-[95vh]",
}

/**
 * Accessible modal component with OpenLove styling
 *
 * @example
 * ```tsx
 * <Modal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Confirmar ação"
 *   description="Esta ação não pode ser desfeita"
 *   size="md"
 * >
 *   <div className="space-y-4">
 *     <p>Tem certeza que deseja continuar?</p>
 *     <div className="flex justify-end space-x-2">
 *       <Button variant="secondary" onClick={() => setIsOpen(false)}>
 *         Cancelar
 *       </Button>
 *       <Button variant="destructive" onClick={handleConfirm}>
 *         Confirmar
 *       </Button>
 *     </div>
 *   </div>
 * </Modal>
 * ```
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeOnOverlayClick ? () => onOpenChange(false) : undefined}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                className={cn(
                  "fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 rounded-lg xs:rounded-2xl bg-white p-3 xs:p-4 sm:p-6 shadow-2xl dark:bg-gray-900",
                  sizeClasses[size],
                  className,
                )}
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ type: "spring", duration: 0.3 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {title && (
                      <Dialog.Title className="text-lg xs:text-xl font-semibold text-gray-900 dark:text-white">
                        {title}
                      </Dialog.Title>
                    )}
                    {description && (
                      <Dialog.Description className="mt-2 text-xs xs:text-sm text-gray-600 dark:text-gray-400">
                        {description}
                      </Dialog.Description>
                    )}
                  </div>

                  {showCloseButton && (
                    <Dialog.Close asChild>
                      <button
                        className="rounded-lg p-1 xs:p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="Fechar modal"
                      >
                        <X className="h-4 w-4 xs:h-5 xs:w-5" />
                      </button>
                    </Dialog.Close>
                  )}
                </div>

                <div className={cn("mt-3 xs:mt-4", title || description ? "xs:mt-6" : "")}>{children}</div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
