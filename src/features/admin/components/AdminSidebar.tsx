import { useState } from 'react'
import { adminSections, type AdminSection } from '../adminSections'

export type SidebarDisplayMode = 'expanded' | 'collapsed' | 'hover'

type AdminSidebarProps = {
  activeSection: AdminSection
  onSectionChange: (section: AdminSection) => void
  onSidebarModeChange: (mode: SidebarDisplayMode) => void
  sidebarMode: SidebarDisplayMode
}

const sidebarModeOptions: Array<{
  id: SidebarDisplayMode
  label: string
  title: string
}> = [
  {
    id: 'expanded',
    label: 'Expanded',
    title: 'Keep sidebar expanded',
  },
  {
    id: 'collapsed',
    label: 'Collapsed',
    title: 'Keep sidebar collapsed',
  },
  {
    id: 'hover',
    label: 'Hover',
    title: 'Expand sidebar on hover',
  },
]

function AdminSectionIcon({ section }: { section: AdminSection }) {
  const sharedProps = {
    'aria-hidden': true,
    className: 'h-4 w-4 shrink-0 sm:h-5 sm:w-5',
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 2.25,
    viewBox: '0 0 24 24',
  }

  if (section === 'dashboard') {
    return (
      <svg {...sharedProps}>
        <path d="M4 13h6V4H4Z" />
        <path d="M14 20h6v-9h-6Z" />
        <path d="M4 20h6v-3H4Z" />
        <path d="M14 7h6V4h-6Z" />
      </svg>
    )
  }

  if (section === 'orders') {
    return (
      <svg {...sharedProps}>
        <path d="M7 4h10" />
        <path d="M6 4h12l-1 16H7Z" />
        <path d="M9 8h6" />
        <path d="M9 12h6" />
        <path d="M9 16h4" />
      </svg>
    )
  }

  if (section === 'products') {
    return (
      <svg {...sharedProps}>
        <path d="M21 8l-9-5-9 5 9 5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </svg>
    )
  }

  if (section === 'categories') {
    return (
      <svg {...sharedProps}>
        <path d="M4 5h6v6H4Z" />
        <path d="M14 5h6v6h-6Z" />
        <path d="M4 15h6v4H4Z" />
        <path d="M14 15h6v4h-6Z" />
      </svg>
    )
  }

  return (
    <svg {...sharedProps}>
      <path d="M5 7h14" />
      <path d="M7 7v10" />
      <path d="M17 7v10" />
      <path d="M9 17h6" />
      <path d="M9 4h6" />
      <path d="M12 4v3" />
    </svg>
  )
}

function SidebarModeIcon({ mode }: { mode: SidebarDisplayMode }) {
  const sharedProps = {
    'aria-hidden': true,
    className: 'h-4 w-4 shrink-0',
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 2.25,
    viewBox: '0 0 24 24',
  }

  if (mode === 'expanded') {
    return (
      <svg {...sharedProps}>
        <path d="M4 5h16v14H4Z" />
        <path d="M10 5v14" />
        <path d="M14 9l3 3-3 3" />
      </svg>
    )
  }

  if (mode === 'collapsed') {
    return (
      <svg {...sharedProps}>
        <path d="M4 5h16v14H4Z" />
        <path d="M10 5v14" />
        <path d="M17 9l-3 3 3 3" />
      </svg>
    )
  }

  return (
    <svg {...sharedProps}>
      <path d="M4 5h16v14H4Z" />
      <path d="M10 5v14" />
      <path d="M14 8l4 4-4 4" />
      <path d="M6 12h2" />
    </svg>
  )
}

function SidebarControlIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.25"
      viewBox="0 0 24 24"
    >
      <path d="M4 7h16" />
      <path d="M4 17h16" />
      <circle cx="9" cy="7" r="2" />
      <circle cx="15" cy="17" r="2" />
    </svg>
  )
}

export function AdminSidebar({
  activeSection,
  onSectionChange,
  onSidebarModeChange,
  sidebarMode,
}: AdminSidebarProps) {
  const [isHovering, setIsHovering] = useState(false)
  const [isControlOpen, setIsControlOpen] = useState(false)
  const shouldExpandSidebar =
    sidebarMode === 'expanded' || (sidebarMode === 'hover' && isHovering)
  const sidebarWidthClass =
    shouldExpandSidebar ? 'lg:w-64' : 'lg:w-20'
  const sidebarLayerClass = isControlOpen ? 'lg:z-50' : 'lg:z-30'
  const labelVisibilityClass = shouldExpandSidebar
    ? 'lg:max-w-40 lg:opacity-100'
    : 'lg:max-w-0 lg:opacity-0'

  return (
    <aside
      className={`rounded-2xl border border-[#9C7A42]/35 bg-[#130E0D] p-2 shadow-[0_24px_70px_rgba(0,0,0,0.35)] transition-[width] duration-300 ease-out sm:rounded-3xl sm:p-3 lg:fixed lg:bottom-0 lg:left-0 lg:top-20 lg:flex lg:flex-col lg:overflow-visible lg:rounded-none lg:border-y-0 lg:border-l-0 lg:p-4 ${sidebarWidthClass} ${sidebarLayerClass}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-1">
        {adminSections.map((section) => {
          const isActive = activeSection === section.id

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSectionChange(section.id)}
              className={`cursor-pointer rounded-lg border px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D] sm:px-3 sm:py-3 ${
                isActive
                  ? 'border-[#E4B45A]/70 bg-[#E4B45A] text-[#000000]'
                  : 'border-[#9C7A42]/25 bg-[#000000] text-[#B8A98A] hover:border-[#FDD97D] hover:text-[#FDD97D]'
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <AdminSectionIcon section={section.id} />
                <span
                  className={`min-w-0 overflow-hidden truncate text-xs font-medium uppercase tracking-[0.1em] transition-[max-width,opacity] duration-300 ease-out sm:text-sm sm:tracking-[0.14em] ${labelVisibilityClass}`}
                >
                  {section.label}
                </span>
              </span>
            </button>
          )
        })}
      </nav>

      <div
        className="relative mt-4 hidden border-t border-[#9C7A42]/25 pt-4 lg:mt-auto lg:block"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsControlOpen(false)
          }
        }}
      >
        {isControlOpen ? (
          <div
            className="absolute bottom-full left-0 z-50 mb-3 grid w-56 gap-2 rounded-[10px] border border-[#9C7A42]/35 bg-[#000000] p-2 shadow-[0_18px_45px_rgba(0,0,0,0.65)]"
            role="menu"
          >
            {sidebarModeOptions.map((option) => {
              const isActive = sidebarMode === option.id

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onSidebarModeChange(option.id)
                    setIsControlOpen(false)
                  }}
                  className={`inline-flex min-h-10 cursor-pointer items-center gap-3 rounded-[10px] border px-3 text-left text-xs font-normal uppercase tracking-[0.08em] transition focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000] ${
                    isActive
                      ? 'border-[#E4B45A]/70 bg-[#E4B45A] text-[#000000]'
                      : 'border-[#9C7A42]/30 bg-[#000000] text-[#B8A98A] hover:border-[#FDD97D] hover:text-[#FDD97D]'
                  }`}
                  role="menuitemradio"
                  aria-checked={isActive}
                >
                  <SidebarModeIcon mode={option.id} />
                  <span className="min-w-0 truncate">{option.label}</span>
                </button>
              )
            })}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setIsControlOpen((isOpen) => !isOpen)}
          className={`inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-[10px] border border-[#9C7A42]/30 bg-[#000000] text-left text-xs font-normal uppercase tracking-[0.08em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D] ${
            shouldExpandSidebar
              ? 'w-full justify-start px-3'
              : 'h-11 w-full justify-center gap-0 p-0'
          }`}
          aria-haspopup="menu"
          aria-expanded={isControlOpen}
          aria-label="Sidebar Control"
          title="Sidebar Control"
        >
          <SidebarControlIcon />
          <span
            className={`min-w-0 overflow-hidden truncate transition-[max-width,opacity] duration-300 ease-out ${labelVisibilityClass}`}
          >
            Sidebar Control
          </span>
        </button>
      </div>
    </aside>
  )
}
