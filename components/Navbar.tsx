import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="nav-glass">
      <div className="nav-left">
        <a className="nav-brand" href="/home">SAKURA</a>
      </div>

      <div className="nav-right">
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
    </nav>
  );
}
