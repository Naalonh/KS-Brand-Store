import { createContext } from 'react'

export type ToastTone = 'error' | 'success' | 'warning'

export type ToastInput = {
  message: string
  title?: string
  tone: ToastTone
}

export type Toast = ToastInput & {
  id: string
}

export type ToastContextValue = {
  dismissToast: (toastId: string) => void
  showToast: (toast: ToastInput) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
