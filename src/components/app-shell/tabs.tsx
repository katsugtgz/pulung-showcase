import {
  HomeIcon,
  CalendarIcon,
  InvoiceIcon,
  CardIcon,
} from "@/components/app-shell/icons";

/*
 * Definisi tab navigasi siswa + helper active-state. Lokal untuk app-shell.
 *
 * Spec #59: tab adalah Beranda (/app) / Jadwal (/app/jadwal) /
 * Invoice (/app/invoice) / Kartu (/app/kartu). /app/cara-pakai BUKAN tab
 * dan tetap ditautkan dari dasbor Home. Profile ditangani <UserButton/> Clerk,
 * BUKAN tab terpisah.
 *
 * isActive: tab Beranda aktif hanya pada path persis "/app" agar tidak menyala
 * untuk /app/jadwal dll; tab lain aktif bila pathname === href atau
 * pathname.startsWith(href + "/"). Rute (protected) / katalog / admin TIDAK
 * disentuh.
 */

export interface TabDef {
  href: string;
  label: string;
  icon: (props: { className?: string }) => React.ReactElement;
}

export const TABS: readonly TabDef[] = [
  { href: "/app", label: "Beranda", icon: HomeIcon },
  { href: "/app/jadwal", label: "Jadwal", icon: CalendarIcon },
  { href: "/app/invoice", label: "Invoice", icon: InvoiceIcon },
  { href: "/app/kartu", label: "Kartu", icon: CardIcon },
] as const;

export function isActive(pathname: string, href: string): boolean {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(href + "/");
}
