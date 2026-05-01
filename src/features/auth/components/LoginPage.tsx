import { useEffect, useState, type FormEvent } from 'react'
import {
  EmailOtpRateLimitError,
  InvalidEmailOtpError,
  requestAdminLoginOtp,
  verifyAdminLoginOtp,
  type AdminSession,
} from '../services/authService'

const OTP_CODE_LENGTH = 8

type LoginPageProps = {
  onLogin: (email: string, password: string) => Promise<boolean>
  onOtpLogin: (session: AdminSession) => void
  onViewStore: () => void
}

export function LoginPage({ onLogin, onOtpLogin, onViewStore }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isRemembered, setIsRemembered] = useState(true)
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [otpEmail, setOtpEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpError, setOtpError] = useState('')
  const [otpSuccess, setOtpSuccess] = useState('')
  const [otpCooldownSeconds, setOtpCooldownSeconds] = useState(0)
  const [isOtpSent, setIsOtpSent] = useState(false)
  const hasOtpCodeError =
    Boolean(otpError) && /otp|code|expired|wrong/i.test(otpError)

  useEffect(() => {
    if (otpCooldownSeconds <= 0) {
      return
    }

    const cooldownTimer = window.setInterval(() => {
      setOtpCooldownSeconds((currentSeconds) =>
        Math.max(0, currentSeconds - 1),
      )
    }, 1000)

    return () => window.clearInterval(cooldownTimer)
  }, [otpCooldownSeconds])

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

  const openOtpModal = () => {
    setOtpEmail(email)
    setOtpCode('')
    setOtpError('')
    setOtpSuccess('')
    setIsOtpSent(false)
    setIsOtpModalOpen(true)
  }

  const closeOtpModal = () => {
    setIsOtpModalOpen(false)
    setOtpError('')
    setOtpSuccess('')
    setIsOtpSubmitting(false)
  }

  const sendOtp = async () => {
    const nextEmail = otpEmail.trim()

    if (!nextEmail) {
      return
    }

    if (otpCooldownSeconds > 0) {
      setOtpError(
        `Please wait ${otpCooldownSeconds}s before sending another OTP.`,
      )
      return
    }

    setOtpError('')
    setOtpSuccess('')
    setIsOtpSubmitting(true)

    try {
      await requestAdminLoginOtp(nextEmail)
      setIsOtpSent(true)
      setOtpCooldownSeconds(60)
      setOtpSuccess('Reset code sent. Please check your email.')
    } catch (otpRequestError) {
      const message =
        otpRequestError instanceof Error
          ? otpRequestError.message
          : 'Could not send OTP.'

      if (otpRequestError instanceof EmailOtpRateLimitError) {
        setOtpCooldownSeconds(otpRequestError.retryAfterSeconds)
      } else if (/rate limit|too many|please wait/i.test(message)) {
        setOtpCooldownSeconds(65)
      }

      setOtpError(
        otpRequestError instanceof EmailOtpRateLimitError
          ? message
          : /rate limit|too many/i.test(message)
          ? 'Too many OTP emails. Please wait before sending another code.'
          : message,
      )
    } finally {
      setIsOtpSubmitting(false)
    }
  }

  const handleOtpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isOtpSent) {
      await sendOtp()
      return
    }

    const nextEmail = otpEmail.trim()
    const nextCode = otpCode.trim()

    if (!nextEmail || nextCode.length < OTP_CODE_LENGTH) {
      setOtpError(`Enter the ${OTP_CODE_LENGTH}-digit OTP from your email.`)
      return
    }

    setOtpError('')
    setOtpSuccess('')
    setIsOtpSubmitting(true)

    try {
      const session = await verifyAdminLoginOtp(nextEmail, nextCode)
      onOtpLogin(session)
      closeOtpModal()
    } catch (otpVerifyError) {
      setOtpError(
        otpVerifyError instanceof InvalidEmailOtpError
          ? otpVerifyError.message
          : otpVerifyError instanceof Error
          ? otpVerifyError.message
          : 'Could not verify OTP.',
      )
    } finally {
      setIsOtpSubmitting(false)
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
              onClick={openOtpModal}
              className="text-right text-sm font-black text-[#E4B45A] transition hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
            >
              Reset with OTP
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

      {isOtpModalOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#000000]/75 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6"
          role="presentation"
          onMouseDown={closeOtpModal}
        >
          <form
            onSubmit={handleOtpSubmit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="email-otp-title"
            onMouseDown={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-[#9C7A42]/35 bg-[#130E0D] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.75)] sm:rounded-3xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
                  Password Reset
                </p>
                <h2
                  id="email-otp-title"
                  className="mt-2 text-xl font-black text-[#FFF8E7] sm:text-2xl"
                >
                  Verify reset code
                </h2>
              </div>
              <button
                type="button"
                onClick={closeOtpModal}
                aria-label="Close OTP login popup"
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
                value={otpEmail}
                onChange={(event) => {
                  setOtpEmail(event.target.value)
                  setOtpCode('')
                  setIsOtpSent(false)
                  setOtpSuccess('')
                  setOtpError('')
                }}
                placeholder="admin@example.com"
                autoComplete="username"
                required
                className="min-h-12 rounded-2xl border border-[#9C7A42]/35 bg-[#000000] px-4 text-[#FFF8E7] outline-none transition placeholder:text-[#B8A98A]/55 focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
              />
            </label>

            {isOtpSent ? (
              <label className="mt-4 grid gap-2">
                <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
                  OTP Code
                </span>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(event) => {
                    if (hasOtpCodeError) {
                      setOtpError('')
                    }

                    setOtpCode(
                      event.target.value
                        .replace(/\D/g, '')
                        .slice(0, OTP_CODE_LENGTH),
                    )
                  }}
                  placeholder="12345678"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  maxLength={OTP_CODE_LENGTH}
                  required
                  aria-invalid={hasOtpCodeError}
                  aria-describedby={hasOtpCodeError ? 'otp-error-message' : undefined}
                  className={`min-h-12 rounded-2xl border bg-[#000000] px-4 text-center text-xl font-black tracking-[0.3em] text-[#FFF8E7] outline-none transition placeholder:text-[#B8A98A]/35 focus:ring-2 ${
                    hasOtpCodeError
                      ? 'border-[#FF6B5A] focus:border-[#FF8A7A] focus:ring-[#FF6B5A]/35'
                      : 'border-[#9C7A42]/35 focus:border-[#E4B45A] focus:ring-[#E4B45A]/35'
                  }`}
                />
              </label>
            ) : null}

            {otpError || otpSuccess ? (
              <p
                id={otpError ? 'otp-error-message' : undefined}
                role={otpError ? 'alert' : 'status'}
                className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                  otpSuccess
                    ? 'border-[#E4B45A]/45 bg-[#000000] text-[#FDD97D]'
                    : 'border-[#FF6B5A]/55 bg-[#2A0503] text-[#FFD4CC]'
                }`}
              >
                {otpSuccess || otpError}
              </p>
            ) : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={closeOtpModal}
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 px-6 text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isOtpSubmitting || (!isOtpSent && otpCooldownSeconds > 0)
                }
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[10px] bg-[#E4B45A] px-6 text-sm font-black uppercase tracking-[0.14em] text-[#000000] transition hover:bg-[#FDD97D] disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
              >
                {isOtpSubmitting
                  ? isOtpSent
                    ? 'Checking...'
                    : 'Sending...'
                  : isOtpSent
                    ? 'Verify OTP'
                    : otpCooldownSeconds > 0
                      ? `Wait ${otpCooldownSeconds}s`
                      : 'Send OTP'}
              </button>
            </div>

            {isOtpSent ? (
              <button
                type="button"
                onClick={sendOtp}
                disabled={isOtpSubmitting || otpCooldownSeconds > 0}
                className="mt-3 inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 px-6 text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
              >
                {otpCooldownSeconds > 0
                  ? `Resend in ${otpCooldownSeconds}s`
                  : 'Resend OTP'}
              </button>
            ) : null}
          </form>
        </div>
      ) : null}
    </main>
  )
}
