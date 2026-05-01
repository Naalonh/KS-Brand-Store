type AdminMetricProps = {
  label: string
  value: number
}

export function AdminMetric({ label, value }: AdminMetricProps) {
  return (
    <div className="rounded-2xl border border-[#9C7A42]/35 bg-[#130E0D] p-5">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-[#B8A98A]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black text-[#E4B45A]">{value}</p>
    </div>
  )
}
