"use client";
import Script from "next/script";
import { useEffect } from "react";


export default function BookPage() {

  useEffect(() => {
    fetch("/api/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "book_opens" }),
    }).catch(() => { });
  }, []);

  return (
    <>
      {/* Canvas animation */}
      <canvas id="sakuraCanvas" suppressHydrationWarning />

      {/* Home button (you asked to bring it back) */}
      <a className="home-fab" href="/home">
        Home
      </a>

      <main className="reader-only-wrap">
        <div className="book-shell">
          <div id="book"></div>
          <div id="loading" className="loading">
            Loading book…
          </div>
        </div>
      </main>

      {/* Load libs first */}
      <Script
        src="https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
        strategy="afterInteractive"
      />

      {/* Your scripts */}
      <Script src="/js/sakura.js" strategy="afterInteractive" />
      <Script src="/js/reader.js" strategy="afterInteractive" />
    </>
  );
}
