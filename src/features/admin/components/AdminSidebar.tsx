export type AdminSection = 'dashboard' | 'products' | 'categories' | 'size'

const adminSections: Array<{
  id: AdminSection
  label: string
}> = [
  {
    id: 'dashboard',
    label: 'Dashboard',
  },
  {
    id: 'products',
    label: 'Products',
  },
  {
    id: 'categories',
    label: 'Categories',
  },
  {
    id: 'size',
    label: 'Size',
  },
]

type AdminSidebarProps = {
  activeSection: AdminSection
  onSectionChange: (section: AdminSection) => void
}

export function AdminSidebar({
  activeSection,
  onSectionChange,
}: AdminSidebarProps) {
  return (
    <aside className="rounded-3xl border border-[#9C7A42]/35 bg-[#130E0D] p-3 shadow-[0_24px_70px_rgba(0,0,0,0.35)] lg:fixed lg:bottom-0 lg:left-0 lg:top-0 lg:z-30 lg:w-64 lg:overflow-y-auto lg:rounded-none lg:border-y-0 lg:border-l-0 lg:p-4">
      <div className="flex items-center gap-3 px-1 pb-6 pt-1">
        <img
          src="/logo.png"
          alt="KS Brand Store logo"
          className="h-12 w-12 rounded-full object-contain shadow-[0_0_30px_rgba(228,180,90,0.22)]"
        />
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-black uppercase tracking-[0.22em] text-[#FFF8E7]">
            KS Brand
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B8A98A]">
            Store
          </span>
        </div>
      </div>
      <nav className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
        {adminSections.map((section) => {
          const isActive = activeSection === section.id

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSectionChange(section.id)}
              className={`cursor-pointer rounded-lg border px-4 py-4 text-left transition focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D] ${
                isActive
                  ? 'border-[#E4B45A]/70 bg-[#E4B45A] text-[#000000]'
                  : 'border-[#9C7A42]/25 bg-[#000000] text-[#B8A98A] hover:border-[#FDD97D] hover:text-[#FDD97D]'
              }`}
            >
              <span className="block text-sm font-black uppercase tracking-[0.14em]">
                {section.label}
              </span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
