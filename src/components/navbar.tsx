"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Logout } from "@/components/auth/logout-button";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jobs", label: "Jobs" },
  { href: "/resumes", label: "Resumes" },
  { href: "/cover-letter", label: "Cover Letter" },
  { href: "/interview", label: "Interview" },
  { href: "/resource", label: "Resource" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-background">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand or Logo */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-lg font-bold">
            JobApp
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "secondary" : "ghost"}
              asChild
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>

        {/* User Profile and Logout Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant={pathname === "/profile" ? "secondary" : "ghost"}
            asChild
          >
            <Link href="/profile">Profile</Link>
          </Button>
          <Logout />
        </div>
      </div>

      {/* Mobile Navigation - Hidden for now, can add later if needed */}
    </header>
  );
}
