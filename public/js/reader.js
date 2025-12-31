(async function () {

  function isMobileView() {
    return window.matchMedia("(max-width: 768px)").matches;
  }

  const bookEl = document.getElementById("book");
  const loadingEl = document.getElementById("loading");
  if (!bookEl) return;

  const PDF_URL = "/books/sakura3.pdf";
  const FIRST_BATCH = 6;
  const SCALE = 2.5;

  function setLoading(msg) {
    if (loadingEl) loadingEl.textContent = msg;
  }

  try {
    if (!window.pdfjsLib) throw new Error("pdfjsLib not loaded");
    if (!window.St) throw new Error("PageFlip (St) not loaded");

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    setLoading("Opening PDF…");

    const pdf = await pdfjsLib.getDocument({
      url: PDF_URL,
      // if you face range issues on some hosts, uncomment:
      // disableRange: true,
      // disableStream: true,
    }).promise;

    const total = pdf.numPages;

    // Clear container
    bookEl.innerHTML = "";

    async function renderPage(pageNum) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: SCALE });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      await page.render({ canvasContext: ctx, viewport }).promise;

      const wrapper = document.createElement("div");
      wrapper.className = "page";
      wrapper.appendChild(canvas);

      return wrapper;
    }

    // 1) Render first pages and mount them
    const first = Math.min(FIRST_BATCH, total);
    for (let p = 1; p <= first; p++) {
      setLoading(`Preparing ${p}/${total}…`);
      const pageDiv = await renderPage(p);
      bookEl.appendChild(pageDiv);
    }

    // 2) Start flipbook using currently available pages
    const pageFlip = new St.PageFlip(bookEl, {
      width: 520,
      height: 720,
      size: "stretch",
      showCover: true,
      maxShadowOpacity: 0.25,
      mobileScrollSupport: true,
    });

    pageFlip.loadFromHTML(bookEl.querySelectorAll(".page"));

    // Helper: refresh PageFlip safely
    function refreshFlipbook() {
      const current =
        typeof pageFlip.getCurrentPageIndex === "function"
          ? pageFlip.getCurrentPageIndex()
          : 0;

      // ✅ IMPORTANT: updateFromHtml makes PageFlip include new pages
      if (typeof pageFlip.updateFromHtml === "function") {
        pageFlip.updateFromHtml(bookEl.querySelectorAll(".page"));
      } else {
        // fallback (rare): rebuild
        pageFlip.loadFromHTML(bookEl.querySelectorAll(".page"));
      }

      // Try to restore current page if API exists
      if (typeof pageFlip.turnToPage === "function") {
        pageFlip.turnToPage(current);
      }
    }

    // 3) Render the rest in background, but hide them until PageFlip updates
    setLoading("Loading remaining pages…");

    for (let p = first + 1; p <= total; p++) {
      await new Promise((r) => setTimeout(r, 0));

      const pageDiv = await renderPage(p);

      // ✅ prevent "last page stuck visible" while it's not inside PageFlip yet
      pageDiv.style.display = "none";

      bookEl.appendChild(pageDiv);

      // ✅ refresh every few pages
      if (p % 3 === 0 || p === total) {
        refreshFlipbook();

        // after refresh, let PageFlip control display
        bookEl.querySelectorAll(".page").forEach((el) => (el.style.display = ""));
        setLoading(`Loaded ${p}/${total}…`);
      }
    }

    if (loadingEl) loadingEl.style.display = "none";
  } catch (err) {
    console.error(err);
    if (loadingEl) loadingEl.textContent = "Failed to load book.";
  }
})();
