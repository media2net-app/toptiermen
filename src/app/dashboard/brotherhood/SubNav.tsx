"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Dashboard", href: "/dashboard/brotherhood" },
  { label: "Social Feed", href: "/dashboard/brotherhood/social-feed" },
  { label: "Forum", href: "/dashboard/brotherhood/forum" },
  { label: "Leden", href: "/dashboard/brotherhood/leden" },
  { label: "Mijn Groepen", href: "/dashboard/brotherhood/mijn-groepen" },
  { label: "Mijn Evenementen", href: "/dashboard/brotherhood/mijn-evenementen" },
];

export default function BrotherhoodSubNav() {
  const pathname = usePathname() || "";
  return (
    <nav className="w-full overflow-x-auto mb-8 scrollbar-hide">
      <ul className="flex space-x-1 bg-[#181F17] rounded-lg p-1">
        {tabs.map((tab) => {
          const active = pathname === tab.href || (tab.href !== "/dashboard/brotherhood" && pathname.startsWith(tab.href));
          return (
            <li key={tab.href} className="flex-shrink-0">
              <Link
                href={tab.href}
                className={`py-3 px-4 rounded-md font-medium transition-colors ${
                  active
                    ? "bg-[#8BAE5A] text-black"
                    : "text-[#8BAE5A]/60 hover:text-[#8BAE5A]"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </nav>
  );
} 