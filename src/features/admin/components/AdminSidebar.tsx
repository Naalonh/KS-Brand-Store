import { adminSections, type AdminSection } from '../adminSections'

type AdminSidebarProps = {
  activeSection: AdminSection
  onSectionChange: (section: AdminSection) => void
}

export function AdminSidebar({
  activeSection,
  onSectionChange,
}: AdminSidebarProps) {
  return (
    <aside className="rounded-2xl border border-[#9C7A42]/35 bg-[#130E0D] p-2 shadow-[0_24px_70px_rgba(0,0,0,0.35)] sm:rounded-3xl sm:p-3 lg:fixed lg:bottom-0 lg:left-0 lg:top-0 lg:z-30 lg:w-64 lg:overflow-y-auto lg:rounded-none lg:border-y-0 lg:border-l-0 lg:p-4">
      <div className="flex items-center gap-2 px-1 pb-3 pt-1 sm:gap-3 sm:pb-6">
        <img
          src="/logo.png"
          alt="KS Brand Store logo"
          className="h-10 w-10 rounded-full object-contain shadow-[0_0_30px_rgba(228,180,90,0.22)] sm:h-12 sm:w-12"
        />
        <div className="flex min-w-0 flex-col">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-[#FFF8E7] sm:text-sm sm:tracking-[0.22em]">
            KS Brand
          </span>
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#B8A98A] sm:text-xs sm:tracking-[0.3em]">
            Store
          </span>
        </div>
      </div>
      <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-1">
        {adminSections.map((section) => {
          const isActive = activeSection === section.id

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSectionChange(section.id)}
              className={`cursor-pointer rounded-lg border px-3 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D] sm:px-4 sm:py-4 ${
                isActive
                  ? 'border-[#E4B45A]/70 bg-[#E4B45A] text-[#000000]'
                  : 'border-[#9C7A42]/25 bg-[#000000] text-[#B8A98A] hover:border-[#FDD97D] hover:text-[#FDD97D]'
              }`}
            >
              <span className="block text-xs font-black uppercase tracking-[0.1em] sm:text-sm sm:tracking-[0.14em]">
                {section.label}
              </span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
