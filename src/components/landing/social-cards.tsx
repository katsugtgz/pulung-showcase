import Link from "next/link";
import { getSocialPosts } from "@/lib/catalog-data";
import type { SocialPlatform } from "@/lib/catalog-data";
import {
  ArrowRightIcon,
  InstagramIcon,
  TiktokIcon,
} from "@/components/landing/icons";
import { PretextText } from "@/components/pretext-text";

/*
 * Kartu media sosial — dari getSocialPosts(). Setiap kartu menautkan ke URL
 * Instagram/TikTok asli (target _blank, rel noopener). Tanpa embed SDK
 * (berat & melukai Lighthouse).
 *
 * Redesign "rambu": tanpa gradien header. Kartu = arah jalan: strip kiri
 * tebal warna identitas platform (rose untuk IG, neutral-900 TikTok),
 * header flat putih dengan chip platform bujur sangkar, dan label "Lihat
 * di X" bergaya panah rambu satu arah (ikon bergerak saat hover — jawaban
 * gerak terhadap aksi pengguna). Kontrak flex/h-full + child berpadding
 * dipertahankan (touch target, lihat __tests__).
 */

const PLATFORM_ICON: Record<SocialPlatform, typeof InstagramIcon> = {
  instagram: InstagramIcon,
  tiktok: TiktokIcon,
};

const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
};

/* Left direction-strip color per platform (solid, not gradient). */
const PLATFORM_STRIP: Record<SocialPlatform, string> = {
  instagram: "bg-rose-500",
  tiktok: "bg-neutral-900",
};

const PLATFORM_CHIP: Record<SocialPlatform, string> = {
  instagram: "bg-rose-50 text-rose-600 ring-1 ring-rose-100",
  tiktok: "bg-neutral-100 text-neutral-900 ring-1 ring-neutral-200",
};

export function SocialCards() {
  const posts = getSocialPosts();

  return (
    <section
      aria-labelledby="sosial-heading"
      className="bg-white px-6 py-12 lg:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-md md:max-w-2xl lg:max-w-7xl">
        <div className="max-w-2xl">
          <h2
            id="sosial-heading"
            className="font-display text-3xl font-semibold uppercase leading-none tracking-tight text-neutral-900 lg:text-4xl"
          >
            Ikuti Kami
          </h2>
          <div aria-hidden="true" className="road-line-x mt-4 max-w-40" />
          <p className="mt-4 text-sm leading-relaxed text-neutral-600 lg:text-base">
            Aktivitas terbaru Pulung di media sosial.
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const Icon = PLATFORM_ICON[post.platform];
            const strip = PLATFORM_STRIP[post.platform];
            const chip = PLATFORM_CHIP[post.platform];
            const label = PLATFORM_LABEL[post.platform];
            return (
              <li key={post.id} className="h-full">
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <div className="flex items-center gap-3 px-5 py-4">
                    <span
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md ${chip}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <span className="font-display text-xs font-semibold uppercase tracking-wider text-neutral-500">
                        {label}
                      </span>
                      <PretextText
                        text={post.account}
                        font="700 14px Inter, ui-sans-serif, system-ui, sans-serif"
                        lineHeight={20}
                        maxLines={2}
                        className="text-sm font-bold text-neutral-900"
                        fallbackClassName="truncate text-sm font-bold text-neutral-900"
                      />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <p className="line-clamp-3 text-sm leading-relaxed text-neutral-700">
                      {post.captionPreview}
                    </p>
                    <p className="mt-auto flex items-center gap-1.5 pt-4 text-xs font-bold uppercase tracking-wide text-primary transition group-hover:text-primary-dark">
                      Lihat di {label}
                      <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
                    </p>
                  </div>

                  {/* Direction strip — platform color, right edge */}
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-full ${strip}`}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        {/*
         * Hint navigasi internal ke section paket — satu-satunya tautan
         * non-external di section ini.
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
