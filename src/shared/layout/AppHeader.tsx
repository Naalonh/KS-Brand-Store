import type { View } from '../../hooks/usePathView'
import { BrandMark } from '../components/BrandMark'

type AppHeaderProps = {
  adminTitle?: string
  cartQuantity: number
  currentView: View
  isAuthenticated: boolean
  language: 'en' | 'km'
  onLogout: () => void
  onOpenView: (view: View) => void
  onToggleLanguage: () => void
  onToggleTheme: () => void
  theme: 'dark' | 'light'
}

const navLabels = {
  en: {
    about: 'About Us',
    collection: 'Collection',
    languageLabel: 'Switch language',
    store: 'Store',
  },
  km: {
    about: 'អំពីយើង',
    collection: 'ការប្រមូល',
    languageLabel: 'ប្ដូរភាសា',
    store: 'ហាង',
  },
}

function CambodiaFlagIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px]"
      viewBox="0 0 30 20"
    >
      <rect fill="#032ea1" height="20" width="30" />
      <rect fill="#e00025" height="10" width="30" y="5" />
      <path
        d="M8.8 14.9h12.4v-1.3h-1V11h-.9V8.8h-1.4V7.2h-1.4V5.4L15 3.8l-1.5 1.6v1.8h-1.4v1.6h-1.4V11h-.9v2.6h-1v1.3Zm3.1-1.3v-2.4h1.2v2.4h-1.2Zm2.5 0v-3h1.2v3h-1.2Zm2.5 0v-2.4h1.2v2.4h-1.2Z"
        fill="#ffffff"
        stroke="#111111"
        strokeLinejoin="round"
        strokeWidth="0.25"
      />
    </svg>
  )
}

function EnglishFlagIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px]"
      viewBox="0 0 60 40"
    >
      <clipPath id="union-jack-clip">
        <path d="M0 0h60v40H0z" />
      </clipPath>
      <g clipPath="url(#union-jack-clip)">
        <rect fill="#012169" height="40" width="60" />
        <path d="m0 0 60 40m0-40L0 40" stroke="#ffffff" strokeWidth="8" />
        <path d="m0 0 60 40m0-40L0 40" stroke="#c8102e" strokeWidth="4" />
        <path d="M30 0v40M0 20h60" stroke="#ffffff" strokeWidth="13" />
        <path d="M30 0v40M0 20h60" stroke="#c8102e" strokeWidth="8" />
      </g>
    </svg>
  )
}

export function AppHeader({
  adminTitle = 'Dashboard',
  cartQuantity,
  currentView,
  isAuthenticated,
  language,
  onLogout,
  onOpenView,
  onToggleLanguage,
  onToggleTheme,
  theme,
}: AppHeaderProps) {
  const labels = navLabels[language]
  const isKhmer = language === 'km'

  if (currentView === 'admin' || currentView === 'adminLogin') {
    return (
      <header className="sticky top-0 z-20 border-b border-[#9C7A42]/25 bg-[#130E0D]/95 backdrop-blur">
        <div className="flex w-full flex-col gap-2 px-3 py-2 sm:min-h-20 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-3 lg:pl-[18rem] lg:pr-8">
          <p className="min-w-0 truncate text-xs font-black uppercase tracking-[0.12em] text-[#E4B45A] sm:text-base sm:tracking-[0.16em]">
            {adminTitle}
          </p>
          <div
            className={`grid gap-2 sm:flex sm:shrink-0 sm:items-center ${
              isAuthenticated ? 'grid-cols-2' : 'grid-cols-1'
            }`}
          >
            {isAuthenticated ? (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex min-h-9 items-center justify-center rounded-[10px] border border-[#9C7A42]/70 bg-[#130E0D] px-3 text-[0.68rem] font-black uppercase tracking-[0.08em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000] sm:min-h-11 sm:px-5 sm:text-sm sm:tracking-[0.12em]"
              >
                Logout
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => onOpenView('store')}
              className="inline-flex min-h-9 items-center justify-center rounded-[10px] border border-[#E4B45A]/70 bg-[#E4B45A] px-3 text-[0.68rem] font-black uppercase tracking-[0.08em] text-[#000000] shadow-[0_0_30px_rgba(228,180,90,0.2)] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000] sm:min-h-11 sm:px-5 sm:text-sm sm:tracking-[0.12em]"
            >
              Back to Site
            </button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[#9C7A42]/25 bg-[#130E0D]/95 backdrop-blur">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <BrandMark onClick={() => onOpenView('store')} />

        <nav className="hidden items-center gap-8 text-sm font-semibold uppercase tracking-[0.18em] text-[#B8A98A] md:flex">
          <a href="#products" className="transition hover:text-[#FDD97D]">
            {labels.collection}
          </a>
          <a href="#about-us" className="transition hover:text-[#FDD97D]">
            {labels.about}
          </a>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => onOpenView('admin')}
              className="hidden min-h-10 items-center justify-center rounded-full border border-[#9C7A42]/70 bg-[#130E0D] px-4 text-xs font-black uppercase tracking-[0.12em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000] sm:inline-flex"
            >
              Dashboard
            </button>
          ) : null}
          <button
            type="button"
            onClick={onToggleLanguage}
            aria-label={labels.languageLabel}
            className="hidden h-10 min-w-[6.75rem] shrink-0 items-center justify-center gap-2 rounded-full border border-[#9C7A42]/55 bg-[#000000] px-3 text-[0.72rem] font-black text-[#B8A98A] transition hover:border-[#E4B45A] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000] sm:inline-flex"
          >
            {isKhmer ? <CambodiaFlagIcon /> : <EnglishFlagIcon />}
            <span className={isKhmer ? 'khmer-font' : undefined}>
              {isKhmer ? 'ខ្មែរ' : 'English'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onOpenView('mystore')}
            aria-label="Open store"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#E4B45A] transition hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000]"
          >
            <svg
              aria-hidden="true"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.1"
              viewBox="0 0 24 24"
            >
              <path d="M4 10h16" />
              <path d="M5 10l1.4-5h11.2L19 10" />
              <path d="M6 10v9h12v-9" />
              <path d="M9 19v-5h6v5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onOpenView('cart')}
            aria-label="Open cart"
            className="relative inline-flex h-12 w-12 items-center justify-center rounded-full text-[#E4B45A] transition hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000]"
          >
            <svg
              aria-hidden="true"
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <path d="M6 8h12l-1 12H7L6 8Z" />
              <path d="M9 8a3 3 0 0 1 6 0" />
            </svg>
            <span className="sr-only">Open cart</span>
            {cartQuantity > 0 ? (
              <span
                aria-hidden="true"
                className="absolute right-0.5 top-0.5 grid h-5 min-w-5 place-items-center rounded-full border border-[#000000] bg-[#1A8CFF] px-1 text-[0.65rem] font-black leading-none text-white"
              >
                {cartQuantity}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={
              theme === 'dark'
                ? 'Switch to light mode'
                : 'Switch to dark mode'
            }
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#E4B45A] transition hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000]"
          >
            {theme === 'dark' ? (
              <svg
                aria-hidden="true"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.1"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.9 4.9 1.4 1.4" />
                <path d="m17.7 17.7 1.4 1.4" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.3 17.7-1.4 1.4" />
                <path d="m19.1 4.9-1.4 1.4" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.1"
                viewBox="0 0 24 24"
              >
                <path d="M20.5 14.2A8 8 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
