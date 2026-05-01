type AdminInputProps = {
  label: string
  onChange: (value: string) => void
  placeholder: string
  value: string
}

export function AdminInput({
  label,
  onChange,
  placeholder,
  value,
}: AdminInputProps) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required
        className="min-h-12 rounded-2xl border border-[#9C7A42]/35 bg-[#000000] px-4 text-[#FFF8E7] outline-none transition placeholder:text-[#B8A98A]/55 focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
      />
    </label>
  )
}
