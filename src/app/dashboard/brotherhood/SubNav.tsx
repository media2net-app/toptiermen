"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Dashboard", href: "/dashboard/brotherhood" },
  { label: "Social Feed", href: "/dashboard/brotherhood/social-feed" },
  { label: "Forum", href: "/dashboard/brotherhood/forum" },
  { label: "Leden", href: "/dashboard/brotherhood/leden" },
  { label: "Mijn Groepen & Evenementen", href: "/dashboard/brotherhood/mijn-groepen" },
];

export default function BrotherhoodSubNav() {
  const pathname = usePathname() || "";
  return (
    <nav className="w-full overflow-x-auto mb-8">
      <ul className="flex gap-2 md:gap-4 whitespace-nowrap border-b border-[#3A4D23]/60 pb-2">
        {tabs.map((tab) => {
          const active = pathname === tab.href || (tab.href !== "/dashboard/brotherhood" && pathname.startsWith(tab.href));
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${active ? "bg-[#232D1A] text-[#FFD700] border-b-2 border-[#FFD700]" : "text-[#8BAE5A] hover:text-white"}`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
} 