"use client";

import { useMemo, useState } from "react";

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

type TabKey = "overview" | "comments";

async function safeJson(res: Response) {
    const text = await res.text();
    try {
        return text ? JSON.parse(text) : null;
    } catch {
        // If Vercel returns HTML (error page), show part of it
        throw new Error(text?.slice(0, 180) || `Non-JSON response (${res.status})`);
    }
}

export default function AdminPage() {
    const [secret, setSecret] = useState("");
    const [tab, setTab] = useState<TabKey>("overview");

    const [stats, setStats] = useState<Stats | null>(null);
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const totalComments = useMemo(() => stats?.comments ?? comments.length, [stats, comments]);

    async function loadAdmin() {
        setError("");
        setLoading(true);
        try {
            // --- stats
            const statsRes = await fetch("/api/admin/stats", {
                headers: { "x-admin-secret": secret },
                cache: "no-store",
            });
            const statsData = await safeJson(statsRes);
            if (!statsRes.ok) throw new Error(statsData?.error || "Failed stats");
            setStats(statsData);

            // --- comments
            const comRes = await fetch("/api/admin/comments", {
                headers: { "x-admin-secret": secret },
                cache: "no-store",
            });
            const comData = await safeJson(comRes);
            if (!comRes.ok) throw new Error(comData?.error || "Failed comments");
            setComments(comData?.comments || []);
        } catch (e: any) {
            setStats(null);
            setComments([]);
            setError(e?.message || "Error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="admin-wrap">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <div className="admin-dot" />
                    <div>
                        <div className="admin-title">Admin</div>
                        <div className="admin-subtitle">Dashboard</div>
                    </div>
                </div>

                <div className="admin-secret">
                    <label className="admin-label">Admin Secret</label>
                    <div className="admin-secret-row">
                        <input
                            className="admin-input"
                            type="password"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            placeholder="Enter ADMIN_SECRET"
                        />
                        <button className="admin-btn" type="button" onClick={loadAdmin} disabled={loading || !secret}>
                            {loading ? "Loading..." : "Load"}
                        </button>
                    </div>
                    {error && <div className="admin-error">{error}</div>}
                </div>

                <nav className="admin-nav">
                    <button
                        className={`admin-nav-btn ${tab === "overview" ? "is-active" : ""}`}
                        onClick={() => setTab("overview")}
                        type="button"
                    >
                        Overview
                    </button>
                    <button
                        className={`admin-nav-btn ${tab === "comments" ? "is-active" : ""}`}
                        onClick={() => setTab("comments")}
                        type="button"
                    >
                        Comments
                        {totalComments ? <span className="admin-pill">{totalComments}</span> : null}
                    </button>
                </nav>

                <a className="admin-back" href="/home">
                    ← Back to Home
                </a>
            </aside>

            {/* Content */}
            <section className="admin-content">
                <div className="admin-content-head">
                    <h1 className="admin-h1">
                        {tab === "overview" ? (
                            <>
                                Overview <span>Stats</span>
                            </>
                        ) : (
                            <>
                                Latest <span>Comments</span>
                            </>
                        )}
                    </h1>
                    <div className="admin-muted">
                        {stats ? "Live data loaded." : "Enter secret and press Load."}
                    </div>
                </div>

                {/* OVERVIEW */}
                {tab === "overview" && (
                    <div className="admin-cards">
                        <div className="admin-card">
                            <div className="admin-card-title">Site Visits</div>
                            <div className="admin-card-value">{stats?.site_visits ?? "—"}</div>
                        </div>
                        <div className="admin-card">
                            <div className="admin-card-title">Book Opens</div>
                            <div className="admin-card-value">{stats?.book_opens ?? "—"}</div>
                        </div>
                        <div className="admin-card">
                            <div className="admin-card-title">Comments</div>
                            <div className="admin-card-value">{stats?.comments ?? comments.length ?? "-"}
                            </div>
                        </div>
                    </div>
                )}

                {/* COMMENTS */}
                {tab === "comments" && (
                    <div className="admin-comments">
                        {comments.length === 0 ? (
                            <div className="admin-empty">No comments yet.</div>
                        ) : (
                            comments.map((c) => (
                                <div key={c._id} className="admin-comment">
                                    <div className="admin-comment-head">
                                        <div className="admin-comment-name">{c.name}</div>
                                        <div className="admin-comment-meta">
                                            {new Date(c.createdAt).toLocaleString()} • {c.page}
                                        </div>
                                    </div>
                                    <div className="admin-comment-body">{c.message}</div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}
