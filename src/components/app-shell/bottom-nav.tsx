"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TABS, isActive } from "@/components/app-shell/tabs";

/*
 * BottomNav — bottom tab bar (mobile/tablet only, lg:hidden). Warna active
 * biru primary sesuai palet brand, BUKAN purple mockup lama yang dilarang.
 *
 * Safe-area inset via pb-[max(0.5rem,env(safe-area-inset-bottom))] supaya
 * tidak overlap home indicator iOS.
 *
 * Client Component karena usePathname.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi siswa (mobile)"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-100 bg-white lg:hidden"
    >
      <ul className="mx-auto flex max-w-md items-center justify-between px-6 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "flex w-16 flex-col items-center gap-0.5 text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    : "flex w-16 flex-col items-center gap-0.5 text-neutral-400 transition hover:text-neutral-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                }
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
