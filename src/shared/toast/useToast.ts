import { useContext } from 'react'
import { ToastContext } from './ToastContext'

export function useToast() {
  const toastContext = useContext(ToastContext)

  if (!toastContext) {
    throw new Error('useToast must be used inside ToastProvider.')
  }

  return toastContext
}
