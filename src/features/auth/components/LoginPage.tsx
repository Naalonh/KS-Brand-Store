import { useEffect, useState, type FormEvent } from 'react'
import { requestAdminPasswordReset } from '../services/authService'

type LoginPageProps = {
  onLogin: (email: string, password: string) => Promise<boolean>
  onViewStore: () => void
}

export function LoginPage({ onLogin, onViewStore }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isRemembered, setIsRemembered] = useState(true)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [isResetSubmitting, setIsResetSubmitting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState('')
  const [resetCooldownSeconds, setResetCooldownSeconds] = useState(0)

  useEffect(() => {
    if (resetCooldownSeconds <= 0) {
      return
    }

    const cooldownTimer = window.setInterval(() => {
      setResetCooldownSeconds((currentSeconds) =>
        Math.max(0, currentSeconds - 1),
      )
    }, 1000)

    return () => window.clearInterval(cooldownTimer)
  }, [resetCooldownSeconds])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await onLogin(email, password)
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'Invalid admin email or password.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const openResetModal = () => {
    setResetEmail(email)
    setResetError('')
    setResetSuccess('')
    setIsResetModalOpen(true)
  }

  const closeResetModal = () => {
    setIsResetModalOpen(false)
    setResetError('')
    setResetSuccess('')
    setIsResetSubmitting(false)
  }

  const handleResetSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextEmail = resetEmail.trim()

    if (!nextEmail) {
      return
    }

    if (resetCooldownSeconds > 0) {
      setResetError(
        `Please wait ${resetCooldownSeconds}s before sending another reset link.`,
      )
      return
    }

    setResetError('')
    setResetSuccess('')
    setIsResetSubmitting(true)

    try {
      await requestAdminPasswordReset(nextEmail)
      setResetCooldownSeconds(60)
      setResetSuccess('Password reset link was sent. Please check your email.')
    } catch (resetRequestError) {
      const message =
        resetRequestError instanceof Error
          ? resetRequestError.message
          : 'Could not send password reset link.'

      if (/rate limit|too many|please wait/i.test(message)) {
        setResetCooldownSeconds(60)
      }

      setResetError(
        /rate limit|too many/i.test(message)
          ? 'Too many reset emails. Please wait before sending another link.'
          : message,
      )
    } finally {
      setIsResetSubmitting(false)
    }
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-md rounded-3xl border border-[#9C7A42]/35 bg-[#130E0D] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.65)] sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#E4B45A]">
          Admin Access
        </p>
        <h1 className="mt-3 text-3xl font-black text-[#FFF8E7]">
          Welcome Back, Pu Pe
        </h1>
        <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              autoComplete="username"
              required
              className="min-h-12 rounded-2xl border border-[#9C7A42]/35 bg-[#000000] px-4 text-[#FFF8E7] outline-none transition placeholder:text-[#B8A98A]/55 focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              required
              className="min-h-12 rounded-2xl border border-[#9C7A42]/35 bg-[#000000] px-4 text-[#FFF8E7] outline-none transition placeholder:text-[#B8A98A]/55 focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
            />
          </label>

          <div className="flex items-center justify-between gap-4">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#B8A98A]">
              <input
                type="checkbox"
                checked={isRemembered}
                onChange={(event) => setIsRemembered(event.target.checked)}
                className="h-4 w-4 accent-[#E4B45A]"
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={openResetModal}
              className="text-right text-sm font-black text-[#E4B45A] transition hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
            >
              Forgot password?
            </button>
          </div>

          {error ? (
            <p className="rounded-2xl border border-[#9C7A42]/45 bg-[#000000] px-4 py-3 text-sm font-semibold text-[#FDD97D]">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#E4B45A] px-7 text-sm font-black uppercase tracking-[0.14em] text-[#000000] transition hover:bg-[#FDD97D] disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
          >
            {isSubmitting ? 'Checking...' : 'Login'}
          </button>

          <button
            type="button"
            onClick={onViewStore}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#9C7A42]/70 px-7 text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
          >
            Back to Store
          </button>
        </form>
      </section>

      {isResetModalOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#000000]/75 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6"
          role="presentation"
          onMouseDown={closeResetModal}
        >
          <form
            onSubmit={handleResetSubmit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-password-title"
            onMouseDown={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-[#9C7A42]/35 bg-[#130E0D] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.75)] sm:rounded-3xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
                  Password Reset
                </p>
                <h2
                  id="reset-password-title"
                  className="mt-2 text-xl font-black text-[#FFF8E7] sm:text-2xl"
                >
                  Send reset link
                </h2>
              </div>
              <button
                type="button"
                onClick={closeResetModal}
                aria-label="Close password reset popup"
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 text-xl font-black text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
              >
                x
              </button>
            </div>

            <label className="mt-6 grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
                Email
              </span>
              <input
                type="email"
                value={resetEmail}
                onChange={(event) => setResetEmail(event.target.value)}
                placeholder="admin@example.com"
                autoComplete="username"
                required
                className="min-h-12 rounded-2xl border border-[#9C7A42]/35 bg-[#000000] px-4 text-[#FFF8E7] outline-none transition placeholder:text-[#B8A98A]/55 focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
              />
            </label>

            {resetError || resetSuccess ? (
              <p
                className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                  resetSuccess
                    ? 'border-[#E4B45A]/45 bg-[#000000] text-[#FDD97D]'
                    : 'border-[#9C7A42]/45 bg-[#000000] text-[#FDD97D]'
                }`}
              >
                {resetSuccess || resetError}
              </p>
            ) : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={closeResetModal}
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 px-6 text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isResetSubmitting || resetCooldownSeconds > 0}
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[10px] bg-[#E4B45A] px-6 text-sm font-black uppercase tracking-[0.14em] text-[#000000] transition hover:bg-[#FDD97D] disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
              >
                {isResetSubmitting
                  ? 'Sending...'
                  : resetCooldownSeconds > 0
                    ? `Wait ${resetCooldownSeconds}s`
                    : 'Send Link'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  )
}
