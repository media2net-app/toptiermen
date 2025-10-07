"use client";
import MobileNav from "./MobileNav";
import ResponsiveDebugger from "@/components/ResponsiveDebugger";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden relative">
      {children}
      <ResponsiveDebugger />
    </div>
  );
}