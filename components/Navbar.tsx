"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="nav-glass" aria-label="Primary" suppressHydrationWarning>
      <div className="nav-left">
        <Link className="nav-brand" href="/home">
          SAKURA
        </Link>
      </div>
    </nav>
  );
}
