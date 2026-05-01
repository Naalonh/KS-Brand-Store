import type { View } from '../../hooks/usePathView'
import { BrandMark } from '../components/BrandMark'

type AppHeaderProps = {
  adminTitle?: string
  currentView: View
  isAuthenticated: boolean
  onLogout: () => void
  onOpenView: (view: View) => void
}

export function AppHeader({
  adminTitle = 'Dashboard',
  currentView,
  isAuthenticated,
  onLogout,
  onOpenView,
}: AppHeaderProps) {
  if (currentView === 'admin') {
    return (
      <header className="sticky top-0 z-20 border-b border-[#9C7A42]/25 bg-[#130E0D]/95 backdrop-blur">
        <div className="flex min-h-20 w-full items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:pl-[18rem] lg:pr-8">
          <p className="min-w-0 truncate text-sm font-black uppercase tracking-[0.16em] text-[#E4B45A] sm:text-base">
            {adminTitle}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex min-h-10 items-center justify-center rounded-[10px] border border-[#9C7A42]/70 bg-[#130E0D] px-4 text-xs font-black uppercase tracking-[0.12em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000] sm:min-h-11 sm:px-5 sm:text-sm"
              >
                Logout
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => onOpenView('store')}
              className="inline-flex min-h-10 items-center justify-center rounded-[10px] border border-[#E4B45A]/70 bg-[#E4B45A] px-4 text-xs font-black uppercase tracking-[0.12em] text-[#000000] shadow-[0_0_30px_rgba(228,180,90,0.2)] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000] sm:min-h-11 sm:px-5 sm:text-sm"
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
          <button
            type="button"
            onClick={() => onOpenView('store')}
            className="transition hover:text-[#FDD97D]"
          >
            Store
          </button>
          <a href="#products" className="transition hover:text-[#FDD97D]">
            Collection
          </a>
          <a href="#contact" className="transition hover:text-[#FDD97D]">
            Concierge
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={onLogout}
              className="hidden min-h-10 items-center justify-center rounded-full border border-[#9C7A42]/70 bg-[#130E0D] px-4 text-xs font-black uppercase tracking-[0.12em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000] sm:inline-flex"
            >
              Logout
            </button>
          ) : null}
          <a
            href="https://m.me/ksbrandstore"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#E4B45A]/70 bg-[#E4B45A] px-4 text-xs font-black uppercase tracking-[0.12em] text-[#000000] shadow-[0_0_30px_rgba(228,180,90,0.2)] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000] sm:min-h-11 sm:px-5 sm:text-sm"
          >
            Order
          </a>
        </div>
      </div>
    </header>
  )
}
