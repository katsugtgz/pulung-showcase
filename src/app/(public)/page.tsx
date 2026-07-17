export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <span className="rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
        Sejak 2000 &middot; Surabaya
      </span>
      <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
        Kursus Mengemudi Pulung
      </h1>
      <p className="text-lg text-neutral-600">
        Safe Drive Training — les mengemudi mobil manual &amp; matic
        bersertifikat KORLANTAS POLRI.
      </p>
      <a
        href="#"
        className="mt-2 rounded-lg bg-accent px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-accent-dark"
      >
        Hubungi via WhatsApp
      </a>
    </main>
  );
}
