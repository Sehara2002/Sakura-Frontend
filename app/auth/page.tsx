export const metadata = {
  title: "Sakura • Access",
};

export default function AuthPage() {
  return (
    <>
      <canvas id="sakuraCanvas" suppressHydrationWarning></canvas>

      <main className="center-wrap">
        <section className="hero-card hero-card-wide">
          <h2 className="title-sm">
            The truth is Unveiled. <span>But can you see it?</span>
          </h2>

          <div className="hint-box">
            <p className="hint-text">
              Timeline of the life is not just seconds, minutes or hours. It&apos;s a
              story of the past, present and the future. Past makes the memories.
              Present processes them to unlock the unseen future. According to the
              God&apos;s law, present plays a most important role. That&apos;s why it
              is present. Present will be the bridge for the known and unknown things
              in the life. Present reveals the future.
              <br />
              Unfortunately,
              <br />
              people don&apos;t live in the present. They always think about past and
              the future. But once you realize the God&apos;s law, you will be rewarded
              the happiness. You will be unveiled the unseen truth of life.
              <br />
              Try to realize.
            </p>
          </div>

          <form id="pwForm" className="pw-form">
            <input
              id="passwordInput"
              className="input"
              type="password"
              placeholder="Unlock the Future"
              autoComplete="off"
              required
            />
            <button className="btn-primary" type="submit">
              Unlock
            </button>
          </form>

          <span id="errorMsg" className="error"></span>
          <a className="link-back" href="/home">
            ← Back to Home
          </a>
        </section>
      </main>

      {/* scripts */}
      <script src="/js/sakura.js"></script>
      <script src="/js/auth.js"></script>
    </>
  );
}
