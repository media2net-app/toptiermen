"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon, 
  UserGroupIcon, 
  UsersIcon, 
  CalendarDaysIcon,
  FireIcon
} from "@heroicons/react/24/outline";

const tabs = [
  { 
    label: "Dashboard", 
    href: "/dashboard/brotherhood", 
    icon: HomeIcon,
    description: "Overzicht"
  },
  { 
    label: "Social Feed", 
    href: "/dashboard/brotherhood/social-feed", 
    icon: FireIcon,
    description: "Connecties"
  },
  { 
    label: "Forum", 
    href: "/dashboard/brotherhood/forum", 
    icon: ChatBubbleLeftRightIcon,
    description: "Discussies"
  },
  { 
    label: "Leden", 
    href: "/dashboard/brotherhood/leden", 
    icon: UsersIcon,
    description: "Brotherhood"
  },
  { 
    label: "Mijn Groepen", 
    href: "/dashboard/brotherhood/mijn-groepen", 
    icon: UserGroupIcon,
    description: "Groepen"
  },
  { 
    label: "Mijn Evenementen", 
    href: "/dashboard/brotherhood/mijn-evenementen", 
    icon: CalendarDaysIcon,
    description: "Events"
  },
];

export default function BrotherhoodSubNav() {
  const pathname = usePathname() || "";
  
  return (
    <nav className="w-full mb-8">
      {/* Modern Navigation Bar */}
      <div className="relative">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#181F17] via-[#232D1A] to-[#181F17] rounded-2xl border border-[#3A4D23]/30 shadow-2xl"></div>
        
        {/* Navigation Content */}
        <div className="relative overflow-x-auto scrollbar-hide">
          <ul className="flex space-x-1 p-2 min-w-max">
            {tabs.map((tab) => {
              const active = pathname === tab.href || (tab.href !== "/dashboard/brotherhood" && pathname.startsWith(tab.href));
              const IconComponent = tab.icon;
              
              return (
                <li key={tab.href} className="flex-shrink-0">
                  <Link
                    href={tab.href}
                    className={`group relative flex flex-col items-center py-2 sm:py-3 px-2 sm:px-4 rounded-xl font-medium transition-all duration-300 min-w-[80px] sm:min-w-[100px] ${
                      active
                        ? "bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] text-[#181F17] shadow-lg shadow-[#8BAE5A]/20 transform scale-105"
                        : "text-[#8BAE5A]/70 hover:text-[#8BAE5A] hover:bg-[#232D1A]/50 hover:transform hover:scale-105"
                    }`}
                  >
                     {/* Icon */}
                     <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 mb-1 transition-all duration-300 ${
                       active ? "text-[#181F17]" : "text-[#8BAE5A]/70 group-hover:text-[#8BAE5A]"
                     }`} />
                     
                     {/* Label */}
                     <span className={`text-[10px] sm:text-xs font-semibold transition-all duration-300 ${
                       active ? "text-[#181F17]" : "text-[#8BAE5A]/70 group-hover:text-[#8BAE5A]"
                     }`}>
                       {tab.label}
                     </span>
                     
                     {/* Description - Hidden on mobile */}
                     <span className={`hidden sm:block text-xs opacity-60 transition-all duration-300 ${
                       active ? "text-[#181F17]/80" : "text-[#8BAE5A]/40 group-hover:text-[#8BAE5A]/60"
                     }`}>
                       {tab.description}
                     </span>
                     
                     {/* Hover effect */}
                     {!active && (
                       <div className="absolute inset-0 bg-gradient-to-br from-[#8BAE5A]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                     )}
                   </Link>
                </li>
              );
            })}
          </ul>
        </div>
        
        {/* Bottom accent line */}
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#8BAE5A]/30 to-transparent rounded-full"></div>
      </div>
      
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </nav>
  );
} 