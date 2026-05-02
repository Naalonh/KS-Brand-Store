export type AdminSummaryIcon =
  | 'active'
  | 'archive'
  | 'category'
  | 'hidden'
  | 'order'
  | 'product'
  | 'revenue'
  | 'size'

type AdminSummaryCardProps = {
  icon: AdminSummaryIcon
  label: string
  value: number | string
}

const iconToneClasses: Record<AdminSummaryIcon, string> = {
  active: 'border-[#4ADE80]/35 bg-[#4ADE80]/10 text-[#86EFAC]',
  archive: 'border-[#A78BFA]/35 bg-[#A78BFA]/10 text-[#C4B5FD]',
  category: 'border-[#38BDF8]/35 bg-[#38BDF8]/10 text-[#7DD3FC]',
  hidden: 'border-[#F87171]/35 bg-[#F87171]/10 text-[#FCA5A5]',
  order: 'border-[#FBBF24]/35 bg-[#FBBF24]/10 text-[#FCD34D]',
  product: 'border-[#E4B45A]/35 bg-[#E4B45A]/10 text-[#FDD97D]',
  revenue: 'border-[#34D399]/35 bg-[#34D399]/10 text-[#6EE7B7]',
  size: 'border-[#FB923C]/35 bg-[#FB923C]/10 text-[#FDBA74]',
}

function AdminSummaryCardIcon({ icon }: { icon: AdminSummaryIcon }) {
  const sharedProps = {
    'aria-hidden': true,
    className: 'h-5 w-5',
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 2.1,
    viewBox: '0 0 24 24',
  }

  if (icon === 'active') {
    return (
      <svg {...sharedProps}>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    )
  }

  if (icon === 'hidden') {
    return (
      <svg {...sharedProps}>
        <path d="M3 3l18 18" />
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
        <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c5 0 8.5 4.2 10 8a14 14 0 0 1-3 4.5" />
        <path d="M6.2 6.2A13.8 13.8 0 0 0 2 12c1.5 3.8 5 8 10 8a10.8 10.8 0 0 0 4.1-.8" />
      </svg>
    )
  }

  if (icon === 'category') {
    return (
      <svg {...sharedProps}>
        <path d="M4 5h6v6H4Z" />
        <path d="M14 5h6v6h-6Z" />
        <path d="M4 15h6v4H4Z" />
        <path d="M14 15h6v4h-6Z" />
      </svg>
    )
  }

  if (icon === 'size') {
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

  if (icon === 'order') {
    return (
      <svg {...sharedProps}>
        <path d="M7 4h10" />
        <path d="M6 4h12l-1 16H7Z" />
        <path d="M9 9h6" />
        <path d="M9 13h6" />
      </svg>
    )
  }

  if (icon === 'revenue') {
    return (
      <svg {...sharedProps}>
        <path d="M12 2v20" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    )
  }

  if (icon === 'archive') {
    return (
      <svg {...sharedProps}>
        <path d="M4 6h16" />
        <path d="M5 6l1 14h12l1-14" />
        <path d="M9 10h6" />
      </svg>
    )
  }

  return (
    <svg {...sharedProps}>
      <path d="M21 8l-9-5-9 5 9 5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  )
}

export function AdminSummaryCard({
  icon,
  label,
  value,
}: AdminSummaryCardProps) {
  return (
    <article className="rounded-2xl border border-[#9C7A42]/35 bg-[#130E0D] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.32)] sm:rounded-3xl sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="block min-w-0 text-xs font-normal uppercase tracking-[0.14em] text-[#B8A98A]">
          {label}
        </span>
        <span
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border ${iconToneClasses[icon]}`}
        >
          <AdminSummaryCardIcon icon={icon} />
        </span>
      </div>
      <span className="mt-3 block break-words text-3xl font-normal text-[#FFF8E7]">
        {value}
      </span>
    </article>
  )
}
