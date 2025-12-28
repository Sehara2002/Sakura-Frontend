window.addEventListener("load", () => {
  const RELEASE_DATE = new Date("2025-01-01T00:00:00+05:30");

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function updateCountdown() {
    const now = new Date();
    const diff = RELEASE_DATE - now;

    if (diff <= 0) {
      const note = document.getElementById("count-note");
      if (note) note.textContent = "It’s time… Redirecting to the book.";
      window.location.href = "/book";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    document.getElementById("cd-days").textContent = String(days);
    document.getElementById("cd-hours").textContent = pad(hours);
    document.getElementById("cd-mins").textContent = pad(mins);
    document.getElementById("cd-secs").textContent = pad(secs);
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();
});
