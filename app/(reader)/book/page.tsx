"use client";

import { useEffect } from "react";

export default function BookPage() {
  useEffect(() => {
    // load reader script after mount (avoids SSR/hydration issues)
    const s = document.createElement("script");
    s.src = "/js/reader.js";
    s.defer = true;
    document.body.appendChild(s);

    return () => {
      document.body.removeChild(s);
    };
  }, []);

  return (
    <>
      <canvas id="sakuraCanvas" suppressHydrationWarning />
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

        {/* external libs */}
        <script src="https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"></script>
      </main>

    </>

  );
}
