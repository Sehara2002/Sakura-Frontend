

export default function HomePage() {
  return (
    <>
      {/* Canvas is controlled by sakura.js (it changes width/height), so ignore hydration diffs */}
      <canvas id="sakuraCanvas" suppressHydrationWarning></canvas>

      <main className="center-wrap">
        <section className="home-glass" aria-label="Sakura Home Card">
          <h1 className="home-title">SAKURA</h1>

          <span className="home-badge">The story of unseen truth of life</span>

          <p className="home-subtitle">
            <span>Chapter 01</span> is ready to be unveiled...
          </p>

          <div className="home-divider"></div>

          <a className="btn-read" href="/auth">
            Read <span className="arrow">→</span>
          </a>

          <p className="home-footnote">Truth is always unseen. But not hidden</p>
        </section>
      </main>

      {/* Load petals script */}
      <script src="/js/sakura.js"></script>
    </>
  );
}
