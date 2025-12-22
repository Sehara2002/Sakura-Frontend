import Script from "next/script";

export const metadata = {
  title: "Sakura • Reader",
};

export default function BookPage() {
  return (
    <>
      {/* Petals canvas (JS modifies size, so ignore hydration diffs) */}
      <canvas id="sakuraCanvas" suppressHydrationWarning></canvas>

      <a className="home-fab" href="/home">
        Home
      </a>

      <main className="reader-only-wrap">
        <div className="book-shell">
          <div id="book"></div>

          {/* Loading text is static; ok */}
          <div id="loading" className="loading">
            Loading book…
          </div>
        </div>
      </main>

      {/* External libraries (load after hydration) */}
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
