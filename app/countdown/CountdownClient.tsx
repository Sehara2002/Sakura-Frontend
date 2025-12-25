"use client";
import { useEffect } from "react";

function leaveTruth() {
    fetch("/api/logout", { method: "POST" }).finally(() => {
        window.location.href = "/home";
    });
}

export function useAutoLogout() {
    useEffect(() => {
        const logout = () => {
            navigator.sendBeacon("/api/logout");
        };

        window.addEventListener("pagehide", logout);
        window.addEventListener("beforeunload", logout);

        return () => {
            window.removeEventListener("pagehide", logout);
            window.removeEventListener("beforeunload", logout);
        };
    }, []);
}

export default function CountdownClient() {
    useAutoLogout();
    return (
        <>
            <canvas id="sakuraCanvas" suppressHydrationWarning />

            <main className="center-wrap">
                <section className="hero-card hero-card-wide countdown-card">
                    <h1 className="title-sm">Countdown to the Unveiling of Truth</h1>

                    <p className="subtitle italianno-regular" style={{ maxWidth: "52ch" }}>
                        Truth is on its way to be unveiled. <br />
                        Stay tuned for the moment when the unseen will be revealed.
                    </p>

                    <div className="count-grid" aria-label="Countdown timer">
                        {["days", "hours", "mins", "secs"].map((u) => (
                            <div className="count-box" key={u}>
                                <div
                                    id={`cd-${u}`}
                                    className="count-num"
                                    suppressHydrationWarning
                                >
                                    00
                                </div>
                                <div className="count-label">
                                    {u === "mins" ? "Minutes" : u.charAt(0).toUpperCase() + u.slice(1)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="count-note" id="count-note">
                        SAKURA is Loading.....
                    </div>

                    {/* ✅ Action buttons */}
                    <div
                        style={{
                            marginTop: "22px",
                            display: "flex",
                            gap: "14px",
                            justifyContent: "center",
                        }}
                    >
                        <button onClick={leaveTruth} className="btn-ghost" type="button">
                            Back to Home
                        </button>

                        {/* <a className="btn-ghost" href="/home">
              Back to Home
            </a> */}
                    </div>
                </section>
            </main>

            {/* Effects */}
            <script src="/js/sakura.js"></script>
            <script src="/js/countdown.js"></script>
        </>
    );
}
