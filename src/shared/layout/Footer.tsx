export function Footer() {
  return (
    <footer id="about-us" className="border-t border-[#9C7A42]/25 bg-[#130E0D]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="text-xl font-black uppercase tracking-[0.18em] text-[#FFF8E7]">
            KS Brand Store
          </p>
          <p className="mt-2 text-sm text-[#B8A98A]">
            Premium shoes ordered directly through Facebook Messenger.
          </p>
        </div>
        <a
          href="https://m.me/ksbrandstore"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#E4B45A]/70 bg-[#000000] px-6 text-sm font-black uppercase tracking-[0.14em] text-[#E4B45A] transition hover:bg-[#E4B45A] hover:text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
        >
          Open Messenger
        </a>
      </div>
    </footer>
  )
}
