const sizeGroups = [
  {
    label: 'Women',
    sizes: ['EU 36', 'EU 37', 'EU 38', 'EU 39', 'EU 40', 'EU 41'],
  },
  {
    label: 'Men',
    sizes: ['EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44', 'EU 45'],
  },
  {
    label: 'Display Presets',
    sizes: ['EU 38-44', 'EU 39-45', 'EU 40-46'],
  },
]

export function SizePanel() {
  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-[#9C7A42]/35 bg-[#130E0D] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:p-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
          Size Management
        </p>
        <h2 className="mt-2 text-3xl font-black text-[#FFF8E7]">
          Size guide and presets
        </h2>
        <p className="mt-3 max-w-2xl text-[#B8A98A]">
          Keep common shoe sizes ready for product descriptions and storefront
          consistency.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {sizeGroups.map((group) => (
          <article
            key={group.label}
            className="rounded-3xl border border-[#9C7A42]/35 bg-[#130E0D] p-5"
          >
            <h3 className="text-xl font-black text-[#FFF8E7]">{group.label}</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {group.sizes.map((size) => (
                <span
                  key={size}
                  className="rounded-full border border-[#9C7A42]/45 bg-[#000000] px-4 py-2 text-sm font-black uppercase tracking-[0.08em] text-[#E4B45A]"
                >
                  {size}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
