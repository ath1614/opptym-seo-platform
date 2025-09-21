"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
  onClose?: () => void
  className?: string
}

export function Toast({ 
  title, 
  description, 
  variant = "default", 
  onClose,
  className 
}: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 w-full max-w-sm rounded-lg border p-4 shadow-lg",
        {
          "bg-background text-foreground border-border": variant === "default",
          "bg-destructive text-destructive-foreground border-destructive": variant === "destructive",
          "bg-green-500 text-white border-green-500": variant === "success",
        },
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {title && (
            <div className="font-semibold text-sm">{title}</div>
          )}
          {description && (
            <div className="text-sm opacity-90 mt-1">{description}</div>
          )}
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            onClose?.()
          }}
          className="ml-2 text-sm opacity-70 hover:opacity-100"
        >
          ×
        </button>
      </div>
    </div>
  )
}

interface ToastContextType {
  showToast: (toast: Omit<ToastProps, "onClose">) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Array<ToastProps & { id: string }>>([])

  const showToast = React.useCallback((toast: Omit<ToastProps, "onClose">) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { ...toast, id, onClose: () => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }}])
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} />
      ))}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
