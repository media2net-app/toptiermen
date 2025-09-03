import { redirect } from "next/navigation";

export default function Home() {
  // Only redirect to login in production
  if (process.env.NODE_ENV === 'production') {
    redirect("/login");
  }
  
  // In development, redirect to dashboard
  redirect("/dashboard");
} 