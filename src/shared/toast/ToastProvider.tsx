import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { ToastContext, type Toast, type ToastInput } from './ToastContext'

type ToastProviderProps = {
  children: ReactNode
}

const toastToneStyles = {
  error: {
    accent: 'bg-[#E5484D]',
    border: 'border-[#E5484D]/70',
    label: 'Error',
    text: 'text-[#FFD7D9]',
  },
  success: {
    accent: 'bg-[#30A46C]',
    border: 'border-[#30A46C]/70',
    label: 'Success',
    text: 'text-[#B4F8C8]',
  },
  warning: {
    accent: 'bg-[#F5B82E]',
    border: 'border-[#F5B82E]/70',
    label: 'Warning',
    text: 'text-[#FFE8A3]',
  },
} satisfies Record<
  Toast['tone'],
  { accent: string; border: string; label: string; text: string }
>

const createToastId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismissToast = useCallback((toastId: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== toastId),
    )
  }, [])

  const showToast = useCallback(
    (toast: ToastInput) => {
      const toastId = createToastId()

      setToasts((currentToasts) => [
        { ...toast, id: toastId },
        ...currentToasts.slice(0, 3),
      ])

      window.setTimeout(() => dismissToast(toastId), 4200)
    },
    [dismissToast],
  )

  const value = useMemo(
    () => ({
      dismissToast,
      showToast,
    }),
    [dismissToast, showToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions text"
        className="pointer-events-none fixed right-4 top-4 z-[100] grid w-[min(24rem,calc(100vw-2rem))] gap-3"
      >
        {toasts.map((toast) => {
          const tone = toastToneStyles[toast.tone]

          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto overflow-hidden rounded-[10px] border ${tone.border} bg-[#130E0D] shadow-[0_20px_60px_rgba(0,0,0,0.55)]`}
            >
              <div className="flex gap-3 p-4">
                <span
                  aria-hidden="true"
                  className={`mt-1 h-3 w-3 shrink-0 rounded-full ${tone.accent}`}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-black uppercase tracking-[0.16em] ${tone.text}`}
                  >
                    {toast.title ?? tone.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[#FFF8E7]">
                    {toast.message}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  aria-label="Dismiss notification"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-[#9C7A42]/45 text-sm font-black text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D]"
                >
                  x
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
