import type { Product } from '../products/types'

type MyStorePageProps = {
  activeProducts: Product[]
  featuredProduct: Product
  language: 'en' | 'km'
  onManageProducts: () => void
  onViewHome: () => void
}

const storeLinks = [
  {
    href: 'https://www.tiktok.com/@ks.brand.store.bm',
    label: 'TikTok',
    icon: (
      <path d="M14 4v9.4a3.6 3.6 0 1 1-3.6-3.6c.4 0 .8.1 1.1.2v2.7a1.5 1.5 0 1 0 1 1.4V2h2.8A4.7 4.7 0 0 0 20 6.7v2.8A7.2 7.2 0 0 1 14 4Z" />
    ),
  },
  {
    href: 'https://www.facebook.com/share/14Kz8zPmgLB/?mibextid=wwXIfr',
    label: 'Facebook',
    icon: (
      <path d="M14 8h2.2V4.5A15 15 0 0 0 13 4c-3.2 0-5.3 1.9-5.3 5.4V12H4v4h3.7v8h4.5v-8H16l.6-4h-4.4V9.8c0-1.1.3-1.8 1.8-1.8Z" />
    ),
  },
  {
    href: 'https://www.instagram.com/ksbrandstore84',
    label: 'Instagram',
    icon: (
      <>
        <rect height="16" rx="4" width="16" x="4" y="4" />
        <circle cx="12" cy="12" r="3.5" />
        <path d="M17.5 6.5h.01" />
      </>
    ),
  },
  {
    href: 'https://t.me/ksbrandstore84',
    label: 'Telegram',
    icon: <path d="M21 4 3 11.2l6.7 2.4L17 8l-5.5 6.8.4 5.2 3.1-3 4.1 3L21 4Z" />,
  },
  {
    href: 'https://maps.app.goo.gl/byNqU8xeaDGV1jiu6',
    label: 'Location',
    icon: (
      <>
        <path d="M12 22s7-5.4 7-12a7 7 0 1 0-14 0c0 6.6 7 12 7 12Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
  },
  {
    href: 'tel:066648884',
    label: '066 648 884',
    icon: (
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2Z" />
    ),
  },
]

export function MyStorePage({
  activeProducts: _activeProducts,
  featuredProduct: _featuredProduct,
  language: _language,
  onManageProducts: _onManageProducts,
  onViewHome: _onViewHome,
}: MyStorePageProps) {
  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[10px] border border-[#9C7A42]/40 bg-[#130E0D] shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
            <div className="grid gap-4 border-b border-[#9C7A42]/25 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-[#E4B45A]">
                  Store Map
                </p>
                <h1 className="mt-2 text-3xl font-black text-[#FFF8E7] sm:text-4xl">
                  Find KS Brand Store
                </h1>
              </div>
              <a
                href="https://maps.app.goo.gl/byNqU8xeaDGV1jiu6"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#E4B45A] px-6 text-sm font-black uppercase tracking-[0.14em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
              >
                Open Map
              </a>
            </div>
            <iframe
              title="KS Brand Store map"
              src="https://www.google.com/maps?q=KS%20Brand%20Store&output=embed"
              className="h-[22rem] w-full border-0 sm:h-[28rem]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <section className="mt-6 rounded-[10px] border border-[#9C7A42]/40 bg-[#130E0D] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.35)] sm:p-6">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#E4B45A]">
              Social Media
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {storeLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith('tel:') ? undefined : '_blank'}
                  rel={link.href.startsWith('tel:') ? undefined : 'noreferrer'}
                  className="inline-flex min-h-12 items-center gap-3 rounded-[10px] border border-[#9C7A42]/35 bg-[#000000] px-4 text-sm font-black text-[#FFF8E7] transition hover:border-[#E4B45A] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
                >
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 text-[#E4B45A]"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.9"
                    viewBox="0 0 24 24"
                  >
                    {link.icon}
                  </svg>
                  {link.label}
                </a>
              ))}
            </div>
          </section>
      </section>
    </main>
  )
}
