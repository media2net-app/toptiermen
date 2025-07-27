"use client";
import MobileNav from "./MobileNav";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-24 sm:pb-20 lg:pb-0">
      {children}
      <MobileNav />
    </div>
  );
} 