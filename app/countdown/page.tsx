export const metadata = {
  title: "Sakura • Countdown",
};

export default function CountdownPage() {
  return (
    <>
      <canvas id="sakuraCanvas" suppressHydrationWarning></canvas>

      <main className="center-wrap">
        <section className="hero-card hero-card-wide countdown-card">
          <h1 className="title-sm">Countdown to the Unveiling of Truth</h1>

          <p className="subtitle italianno-regular" style={{ maxWidth: "52ch" }}>
            Truth is on its way to be unveiled. <br />
            Stay tuned for the moment when the unseen will be revealed.
          </p>

          <div className="count-grid" aria-label="Countdown timer">
            <div className="count-box">
              <div
                id="cd-days"
                className="count-num"
                suppressHydrationWarning
              >
                00
              </div>
              <div className="count-label">Days</div>
            </div>

            <div className="count-box">
              <div
                id="cd-hours"
                className="count-num"
                suppressHydrationWarning
              >
                00
              </div>
              <div className="count-label">Hours</div>
            </div>

            <div className="count-box">
              <div
                id="cd-mins"
                className="count-num"
                suppressHydrationWarning
              >
                00
              </div>
              <div className="count-label">Minutes</div>
            </div>

            <div className="count-box">
              <div
                id="cd-secs"
                className="count-num"
                suppressHydrationWarning
              >
                00
              </div>
              <div className="count-label">Seconds</div>
            </div>
          </div>

          <div className="count-note" id="count-note">
            SAKURA is Loading.....
          </div>

          <a className="link-back" href="/home">
            ← Back to Home
          </a>
        </section>
      </main>

      <script src="/js/sakura.js"></script>
      <script src="/js/countdown.js"></script>
    </>
  );
}
