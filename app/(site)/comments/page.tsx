export const metadata = {
  title: "Sakura • Comments",
};

export default function CommentsPage() {
  return (
    <main className="center-wrap">
      <section className="hero-card comments-card">
        <header className="comments-head">
          <h1 className="comments-title">
            Leave a <span>Comment</span>
          </h1>

          <p className="comments-subtitle">
            Share what you felt. Keep it kind, calm, and meaningful.
          </p>
        </header>

        <form className="comment-form">
          <input className="input" type="text" placeholder="Your name" />
          <textarea className="textarea" placeholder="Your comment..." rows={6} />
          <button className="btn-primary btn-full" type="button">
            Post
          </button>
        </form>

        <a className="link-back" href="/home">
          ← Back to Home
        </a>
      </section>
    </main>
  );
}
