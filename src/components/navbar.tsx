"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Logout } from "@/components/auth/logout-button";
import Image from "next/image";

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
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc =
    theme === "dark" ? "/logo-dark-new.svg" : "/logo-light-new.svg";

  return (
    <header className="border-b bg-background">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand or Logo */}
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="text-lg font-bold">
            {mounted ? (
              <Image
                src={logoSrc}
                alt="Logo"
                width={100}
                height={100}
                className="h-8 w-auto"
              />
            ) : (
              "Hired"
            )}
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
