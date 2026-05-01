type BrandMarkProps = {
  onClick?: () => void
}

export function BrandMark({ onClick }: BrandMarkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 text-left"
    >
      <img
        src="/logo.png"
        alt="KS Brand Store logo"
        className="h-14 w-14 rounded-full object-contain shadow-[0_0_30px_rgba(228,180,90,0.22)]"
      />
      <span className="flex flex-col">
        <span className="text-base font-black uppercase tracking-[0.22em] text-[#FFF8E7]">
          KS Brand
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.32em] text-[#B8A98A]">
          Store
        </span>
      </span>
    </button>
  )
}
