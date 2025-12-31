export const metadata = {
  title: "Sakura • About",
};

export default function AboutPage() {
  return (
    <main className="center-wrap">
      <section className="hero-card hero-card-wide about-card">
        <h1 className="title-sm">
          About <span>Sakura</span>
        </h1>

        <p className="subtitle" style={{ maxWidth: "62ch" }}>
          Sakura is a story of unseen truth of life — where time, memory, and the present
          connect what we know and what we can’t yet see.
        </p>

        <div className="about-grid">
          <div className="about-box">
            <div className="about-title">Theme</div>
            <div className="about-text">Truth • Time • Present • Memory</div>
          </div>
          <div className="about-box">
            <div className="about-title">Format</div>
            <div className="about-text">A calm reader experience with pages</div>
          </div>
          <div className="about-box">
            <div className="about-title">Best Experienced</div>
            <div className="about-text">In silence — let the story speak</div>
          </div>
        </div>

        <a className="link-back" href="/home">
          ← Back to Home
        </a>
      </section>
    </main>
  );
}
