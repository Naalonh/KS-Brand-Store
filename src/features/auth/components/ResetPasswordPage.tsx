import { useMemo, useState, type FormEvent } from 'react'
import { updateAdminPassword } from '../services/authService'

type ResetPasswordPageProps = {
  accessToken?: string
  onBackToLogin: () => void
}

const getRecoveryAccessToken = () => {
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const searchParams = new URLSearchParams(window.location.search)
  const type = hashParams.get('type') ?? searchParams.get('type')

  if (type && type !== 'recovery') {
    return ''
  }

  return (
    hashParams.get('access_token') ??
    searchParams.get('access_token') ??
    ''
  )
}

export function ResetPasswordPage({
  accessToken: sessionAccessToken = '',
  onBackToLogin,
}: ResetPasswordPageProps) {
  const recoveryAccessToken = useMemo(getRecoveryAccessToken, [])
  const accessToken = recoveryAccessToken || sessionAccessToken
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!accessToken) {
      setError('Reset link is invalid or expired.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      await updateAdminPassword(accessToken, password)
      window.history.replaceState(null, '', '/admin/reset-password')
      setSuccess('Password updated. You can login now.')
      setPassword('')
      setConfirmPassword('')
    } catch (resetPasswordError) {
      setError(
        resetPasswordError instanceof Error
          ? resetPasswordError.message
          : 'Could not update password.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-md rounded-3xl border border-[#9C7A42]/35 bg-[#130E0D] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.65)] sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#E4B45A]">
          Admin Access
        </p>
        <h1 className="mt-3 text-3xl font-black text-[#FFF8E7]">
          Create New Password
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
              New Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter new password"
              autoComplete="new-password"
              required
              className="min-h-12 rounded-2xl border border-[#9C7A42]/35 bg-[#000000] px-4 text-[#FFF8E7] outline-none transition placeholder:text-[#B8A98A]/55 focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
              Confirm Password
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
              required
              className="min-h-12 rounded-2xl border border-[#9C7A42]/35 bg-[#000000] px-4 text-[#FFF8E7] outline-none transition placeholder:text-[#B8A98A]/55 focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
            />
          </label>

          {error || success ? (
            <p className="rounded-2xl border border-[#9C7A42]/45 bg-[#000000] px-4 py-3 text-sm font-semibold text-[#FDD97D]">
              {success || error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#E4B45A] px-7 text-sm font-black uppercase tracking-[0.14em] text-[#000000] transition hover:bg-[#FDD97D] disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
          >
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>

          <button
            type="button"
            onClick={onBackToLogin}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#9C7A42]/70 px-7 text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
          >
            Back to Login
          </button>
        </form>
      </section>
    </main>
  )
}
