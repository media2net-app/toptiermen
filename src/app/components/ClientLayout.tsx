"use client";
import MobileNav from "./MobileNav";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-20 md:pb-0">
      {children}
      <MobileNav />
    </div>
  );
} 