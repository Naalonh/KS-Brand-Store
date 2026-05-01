type BrandMarkProps = {
  onClick?: () => void
}

export function BrandMark({ onClick }: BrandMarkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-0 items-center gap-2 text-left sm:gap-3"
    >
      <img
        src="/logo.png"
        alt="KS Brand Store logo"
        className="h-12 w-12 shrink-0 rounded-full object-contain shadow-[0_0_30px_rgba(228,180,90,0.22)] sm:h-14 sm:w-14"
      />
      <span className="flex min-w-0 flex-col">
        <span className="text-sm font-black uppercase tracking-[0.18em] text-[#FFF8E7] sm:text-base sm:tracking-[0.22em]">
          KS Brand
        </span>
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#B8A98A] sm:text-xs sm:tracking-[0.32em]">
          Store
        </span>
      </span>
    </button>
  )
}
