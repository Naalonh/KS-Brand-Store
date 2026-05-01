import { useState, type FormEvent } from 'react'
import { adminAuthConfig } from '../authConfig'
import { isSupabaseConfigured } from '../../supabase/supabaseConfig'

type LoginPageProps = {
  onLogin: (email: string, password: string) => Promise<boolean>
  onViewStore: () => void
}

export function LoginPage({ onLogin, onViewStore }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  return (
    <main className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-md rounded-3xl border border-[#9C7A42]/35 bg-[#130E0D] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.65)] sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#E4B45A]">
          Admin Access
        </p>
        <h1 className="mt-3 text-3xl font-black text-[#FFF8E7]">
          Sign in to manage products.
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#B8A98A]">
          Product management is protected by an admin session before the admin
          dashboard is shown.
        </p>
        <div className="mt-5 rounded-2xl border border-[#9C7A42]/35 bg-[#000000] px-4 py-3 text-sm leading-6 text-[#B8A98A]">
          {isSupabaseConfigured ? (
            <span>
              Supabase Auth is active. Sign in with a Supabase Auth user that
              has admin role metadata.
            </span>
          ) : (
            <span>
              Local dev auth is active. Use {adminAuthConfig.email} /{' '}
              {adminAuthConfig.password}.
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@ksbrand.store"
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
    </main>
  )
}
