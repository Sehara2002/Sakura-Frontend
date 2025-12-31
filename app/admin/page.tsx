"use client";

import { useEffect, useState } from "react";

type Stats = {
  site_visits: number;
  book_opens: number;
  comments: number;
};

type CommentItem = {
  _id: string;
  name: string;
  message: string;
  page: string;
  createdAt: string;
};

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [error, setError] = useState("");

  async function loadAdmin() {
    setError("");
    try {
      const statsRes = await fetch("/api/admin/stats", {
        headers: { "x-admin-secret": secret },
      });
      const statsData = await statsRes.json();
      if (!statsRes.ok) throw new Error(statsData?.error || "Failed stats");
      setStats(statsData);

      const comRes = await fetch("/api/admin/comments", {
        headers: { "x-admin-secret": secret },
      });
      const comData = await comRes.json();
      if (!comRes.ok) throw new Error(comData?.error || "Failed comments");
      setComments(comData.comments || []);
    } catch (e: any) {
      setStats(null);
      setComments([]);
      setError(e.message || "Error");
    }
  }

  useEffect(() => {
    // optional: auto load if you stored secret somewhere, but keeping it manual is safer
  }, []);

  return (
    <main className="center-wrap">
      <section className="hero-card hero-card-wide">
        <h1 className="title-sm">
          Admin <span>Dashboard</span>
        </h1>

        <div className="hint-box" style={{ marginTop: 10 }}>
          <div className="hint-label">Admin Secret</div>
          <div className="pw-form">
            <input
              className="input"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter ADMIN_SECRET"
            />
            <button className="btn-primary" type="button" onClick={loadAdmin}>
              Load
            </button>
          </div>
          {error && <p className="error" style={{ marginTop: 10 }}>{error}</p>}
        </div>

        {stats && (
          <>
            <div className="about-grid" style={{ marginTop: 12 }}>
              <div className="about-box">
                <div className="about-title">Site Visits</div>
                <div className="about-text">{stats.site_visits}</div>
              </div>
              <div className="about-box">
                <div className="about-title">Book Opens</div>
                <div className="about-text">{stats.book_opens}</div>
              </div>
              <div className="about-box">
                <div className="about-title">Comments</div>
                <div className="about-text">{stats.comments}</div>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <div className="hint-label">Latest Comments</div>

              <div className="comment-list">
                {comments.map((c) => (
                  <div key={c._id} className="comment-item">
                    <div className="comment-head">
                      {c.name} • <span style={{ opacity: 0.7, fontWeight: 700 }}>{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="comment-body">{c.message}</div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <div className="hint-text">No comments yet.</div>
                )}
              </div>
            </div>
          </>
        )}

        <a className="link-back" href="/home">← Back to Home</a>
      </section>
    </main>
  );
}
