"use client";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [readCount, setReadCount] = useState<number | null>(null);


  useEffect(() => {
    fetch("/api/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "site_visits" }),
    }).catch(() => { });
  }, []);

  useEffect(() => {
    fetch("/api/stats?key=book_opens")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data && typeof data.value === "number") setReadCount(data.value);
      })
      .catch(() => { });
  }, []);

  return (
    <>
      {/* Canvas is controlled by sakura.js (it changes width/height), so ignore hydration diffs */}
      <canvas id="sakuraCanvas" suppressHydrationWarning></canvas>

      <main className="center-wrap">
        <section className="home-glass" aria-label="Sakura Home Card">
          <h1 className="home-title">SAKURA</h1>

          <span className="home-badge">The story of unseen truth of life</span>

          <p className="home-subtitle">
            The site is resting for a short while. Thank you for walking this path.
          </p>

          <div className="home-divider"></div>

          <div className="home-actions">
            <div className="home-readout" aria-live="polite">
              <div className="home-read-num">
                {readCount === null ? "—" : readCount.toLocaleString()}
              </div>
              <div className="home-read-label">Book reads</div>
            </div>
          </div>

          <p className="home-subtitle">
            <strong className="home-thanks">Thank you</strong>, dear readers, for keeping the petals alive.
          </p>

          <p className="home-footnote">
            When the last petal settles, a new verse will find its wind.
          </p>
        </section>
      </main>

      {/* Load petals script */}
      <script src="/js/sakura.js"></script>
    </>
  );
}
