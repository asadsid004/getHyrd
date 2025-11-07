"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export const Logo = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc =
    theme === "dark" ? "/logo-dark-new.svg" : "/logo-light-new.svg";

  return (
    <Link href="/dashboard" className="text-lg font-bold">
      {mounted ? (
        <Image src={logoSrc} alt="Logo" width={100} height={100} />
      ) : (
        "Hyrd"
      )}
    </Link>
  );
};
