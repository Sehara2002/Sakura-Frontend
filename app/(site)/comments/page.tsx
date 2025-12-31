"use client";

import { useState } from "react";

export default function CommentsPage() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [color, setColor] = useState("");

  async function submit() {
    setStatus("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message, page: "comments" }),
      });

      const text = await res.text(); // ✅ read raw first
      let data: any = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        throw new Error(text || `Server returned ${res.status} but not JSON`);
      }

      if (!res.ok) throw new Error(data?.error || "Failed");

      setName("");
      setMessage("");
      setColor("green");
      setStatus(
        "Comment posted successfully! Thank you so much for sharing your thoughts with us."
      );
    } catch (e: any) {
      setColor("crimson");
      setStatus("❌ " + (e.message || "Error"));
    }
  }


  return (
    <main className="center-wrap">
      <section className="hero-card hero-card-wide comments-card">
        <h1 className="title-sm">
          Leave a <span>Comment</span>
        </h1>

        <p className="subtitle" style={{ maxWidth: "auto" }}>
          Share what you felt. Keep it kind, calm, and meaningful.
        </p>

        <div className="comment-form">
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <textarea
            className="textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your comment..."
            rows={5}
          />
          <button className="btn-primary" type="button" onClick={submit}>
            Post
          </button>
        </div>

        {status && <p className="hint-text" style={{ marginTop: 12, color: color }}>{status}</p>}

        <a className="link-back" href="/home">← Back to Home</a>
      </section>
    </main>
  );
}
