const form = document.getElementById("pwForm");
const input = document.getElementById("passwordInput");
const errorMsg = document.getElementById("errorMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const pw = (input.value || "").trim();

  try {
    const res = await fetch("/api/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });

    if (!res.ok) {
      errorMsg.textContent = "Incorrect password. Try again.";
      input.value = "";
      input.focus();
      return;
    }

    // ✅ now the cookie is set, middleware will allow /countdown
    window.location.href = "/countdown";
  } catch (err) {
    errorMsg.textContent = "Network error. Please try again.";
  }
});
