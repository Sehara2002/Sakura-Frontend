"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // close menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <nav className="nav-glass" aria-label="Primary">
      <div className="nav-left">
        <Link className="nav-brand" href="/home">
          SAKURA
        </Link>
      </div>

      {/* Desktop links */}
      <div className="nav-right nav-desktop">
        <Link className="nav-link" href="/about">
          About
        </Link>
        <Link className="nav-link" href="/author">
          From Author
        </Link>
        <Link className="nav-link" href="/comments">
          Comments
        </Link>
      </div>

      {/* Mobile hamburger */}
      <button
        className="nav-hamburger"
        type="button"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="nav-burger-line" />
        <span className="nav-burger-line" />
        <span className="nav-burger-line" />
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div className="nav-menu nav-mobile" role="menu">
          <Link className="nav-menu-link" href="/about" role="menuitem">
            About
          </Link>
          <Link className="nav-menu-link" href="/author" role="menuitem">
            From Author
          </Link>
          <Link className="nav-menu-link" href="/comments" role="menuitem">
            Comments
          </Link>
        </div>
      )}
    </nav>
  );
}
