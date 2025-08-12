"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

// Toast 인터페이스
interface Toast {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  duration?: number
  variant?: "default" | "destructive"
  [x: string]: any
}

interface ToastContextProps {
  toasts: Toast[]
  toast: (toast: Omit<Toast, "id">) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextProps>({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(
    (newToast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2)
      setToasts((prev) => [...prev, { id, ...newToast }])
      if (newToast.duration !== 0) {
        setTimeout(() => dismiss(id), newToast.duration || 3000)
      }
    },
    [],
  )

  const dismiss = useCallback(
    (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    },
    [],
  )

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
