"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "default" | "compact";
  className?: string;
  href?: string;
}

export default function Logo({ 
  variant = "default", 
  className,
  href 
}: LogoProps) {
  // Size untuk logo: width lebih besar untuk aspect ratio yang baik
  // Logo biasanya landscape (width > height)
  const sizes = variant === "compact" 
    ? { width: 160, height: 50 } // Compact: untuk header
    : { width: 300, height: 100 }; // Default: untuk landing page

  const logoElement = (
    <div className={cn("flex items-center", className)}>
      <Image
        src="/logo.png"
        alt="TiktokAsia"
        width={sizes.width}
        height={sizes.height}
        className="object-contain"
        priority={variant === "default"}
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block hover:opacity-90 transition-opacity">
        {logoElement}
      </Link>
    );
  }

  return logoElement;
}

