export default function ForbiddenPage() {
  return (
    <>
      <canvas id="sakuraCanvas" suppressHydrationWarning></canvas>

      <main className="center-wrap">
        <section className="home-glass" aria-label="Access Locked">
          <h1 className="home-title">403</h1>
          <span className="home-badge">Maintenance</span>
          <p className="home-subtitle">
            This path is resting while the story prepares its next page.
          </p>
          <div className="home-divider"></div>
          <a className="btn-ghost" href="/home">
            Return Home
          </a>
        </section>
      </main>

      <script src="/js/sakura.js"></script>
    </>
  );
}
