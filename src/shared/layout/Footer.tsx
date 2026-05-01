const socialLinks = [
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
    href: 'https://t.me/ksbrandstore84',
    label: 'Telegram',
    icon: <path d="M21 4 3 11.2l6.7 2.4L17 8l-5.5 6.8.4 5.2 3.1-3 4.1 3L21 4Z" />,
  },
  {
    href: 'https://maps.app.goo.gl/94xXBz3f1iM63Uxk6?g_st=ipc',
    label: 'Location',
    icon: (
      <>
        <path d="M12 22s7-5.4 7-12a7 7 0 1 0-14 0c0 6.6 7 12 7 12Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
  },
]

const phoneLinks = [
  { href: 'tel:066648884', label: '066 648 884' },
  { href: 'tel:017948884', label: '017 948 884' },
]

export function Footer() {
  return (
    <footer id="about-us" className="border-t border-[#9C7A42]/25 bg-[#130E0D]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.1fr_0.9fr] lg:grid-cols-[1.15fr_0.85fr_0.85fr] lg:px-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#E4B45A]">
            About Us
          </p>
          <h2 className="mt-3 text-2xl font-black uppercase tracking-[0.18em] text-[#FFF8E7]">
            KS Brand Store
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#B8A98A]">
            Premium footwear curated for polished everyday style. Message us to
            confirm size, availability, delivery, and current collection drops.
          </p>
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
            Social
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
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
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
            Contact
          </p>
          <div className="mt-4 grid gap-3">
            {phoneLinks.map((phone) => (
              <a
                key={phone.href}
                href={phone.href}
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
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2Z" />
                </svg>
                {phone.label}
              </a>
            ))}
            <a
              href="https://m.me/ksbrandstore"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-[10px] bg-[#E4B45A] px-5 text-sm font-black uppercase tracking-[0.14em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
            >
              Open Messenger
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
