import { redirect } from "next/navigation";

export default function Home() {
  // Always redirect to login first to avoid redirect loops
  // The login page will handle redirecting authenticated users to dashboard
  redirect("/login");
} 