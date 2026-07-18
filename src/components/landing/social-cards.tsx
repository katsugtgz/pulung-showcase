import Link from "next/link";
import { getSocialPosts } from "@/lib/catalog-data";
import type { SocialPlatform } from "@/lib/catalog-data";
import {
  ArrowRightIcon,
  InstagramIcon,
  TiktokIcon,
} from "@/components/landing/icons";

/*
 * Kartu media sosial — dari getSocialPosts(). Setiap kartu menautkan ke URL
 * Instagram/TikTok asli dari contact.md (target _blank, rel noopener). Tidak
 * ada script embed Instagram/TikTok (berat & melukai Lighthouse) — hanya
 * tautan keluar statis dengan ikon platform, header band bergraden tonal
 * (story #27), dan pratinjau caption.
 *
 * Varian warna header mengikuti identitas platform tanpa memasukkan palet
 * non-brand baru di luar band: Instagram warm tint (rose → pink → amber),
 * TikTok dark (neutral-900). Body kartu tetap bg-white agar teks caption
 * kontras dan mudah dibaca. TIDAK memakai stitch purple #5e4399.
 */

const PLATFORM_ICON: Record<SocialPlatform, typeof InstagramIcon> = {
  instagram: InstagramIcon,
  tiktok: TiktokIcon,
};

const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
};

/*
 * Header band tint per platform. Memakai gradien Tailwind bawaan (rose/pink/
 * amber untuk IG, neutral untuk TikTok). Tint hanya pada band header; body
 * tetap putih agar caption tetap kontras.
 */
const PLATFORM_HEADER_TINT: Record<SocialPlatform, string> = {
  instagram: "bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50",
  tiktok: "bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800",
};

const PLATFORM_HEADER_TEXT: Record<SocialPlatform, string> = {
  instagram: "text-neutral-900",
  tiktok: "text-white",
};

const PLATFORM_CHIP: Record<SocialPlatform, string> = {
  instagram: "bg-white/80 text-neutral-900 ring-1 ring-neutral-200",
  tiktok: "bg-white/15 text-white ring-1 ring-white/20",
};

export function SocialCards() {
  const posts = getSocialPosts();

  return (
    <section
      aria-labelledby="sosial-heading"
      className="bg-neutral-50 px-6 py-10 lg:px-8 lg:py-16"
    >
      <div className="mx-auto max-w-md md:max-w-2xl lg:max-w-7xl">
        <h2
          id="sosial-heading"
          className="text-center text-2xl font-bold tracking-tight text-neutral-900 lg:text-3xl"
        >
          Ikuti Kami
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          Aktivitas terbaru Pulung di media sosial.
        </p>

        <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const Icon = PLATFORM_ICON[post.platform];
            const headerTint = PLATFORM_HEADER_TINT[post.platform];
            const headerText = PLATFORM_HEADER_TEXT[post.platform];
            const chip = PLATFORM_CHIP[post.platform];
            const label = PLATFORM_LABEL[post.platform];
            return (
              <li key={post.id} className="h-full">
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <div
                    className={`flex items-center gap-3 px-5 py-4 ${headerTint} ${headerText}`}
                  >
                    <span
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${chip}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                        {label}
                      </span>
                      <span className="truncate text-sm font-bold">
                        {post.account}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <p className="line-clamp-3 text-sm leading-relaxed text-neutral-700">
                      {post.captionPreview}
                    </p>
                    <p className="mt-auto flex items-center gap-1.5 pt-4 text-xs font-semibold text-primary transition group-hover:text-primary-dark">
                      Lihat di {label}
                      <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </p>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>

        {/*
         * Hint navigasi internal ke section paket — satu-satunya tautan
         * non-external di section ini. <Link> next/link untuk anchor dalam
         * halaman; berbeda dari kartu sosial yang <a target=_blank> ke luar.
         */}
        <p className="mt-6 text-center text-xs text-neutral-500">
          Belum tahu paket mana yang cocok?{" "}
          <Link
            href="#packages"
            className="font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Lihat pilihan paket
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
