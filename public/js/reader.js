// public/js/reader.js

(() => {
  const bookEl = document.getElementById("book");
  const loadingEl = document.getElementById("loading");

  if (!bookEl) return;

  // ✅ Set PDF.js worker correctly (avoid "fake worker")
  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  } else {
    console.error("pdfjsLib not found. Make sure pdf.min.js is loaded before reader.js");
    return;
  }

  // ✅ Your PDF location (DIRECT from public/)
  const PDF_URL = "/books/sakura3.pdf";

  // Tune for performance/quality
  const SCALE = 1.6;          // 1.2–1.8 good
  const RENDER_DPI = 1;       // keep 1 (higher = slower)
  const MAX_PAGES = 9999;     // or set a limit if you want

  async function renderPageToImage(pdf, pageNum) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: SCALE * RENDER_DPI });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { alpha: false });

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    await page.render({ canvasContext: ctx, viewport }).promise;

    const img = document.createElement("img");
    img.alt = `Page ${pageNum}`;
    img.draggable = false;
    img.style.width = "100%";
    img.style.height = "100%";
    img.src = canvas.toDataURL("image/jpeg", 0.92);

    return img;
  }

  async function init() {
    try {
      if (loadingEl) loadingEl.textContent = "Loading book…";

      // ✅ Load PDF
      const loadingTask = pdfjsLib.getDocument({
        url: PDF_URL,
        withCredentials: false,
        // cMapUrl and standardFontDataUrl are optional; leave default unless needed
      });

      const pdf = await loadingTask.promise;

      // ✅ Render pages
      const total = Math.min(pdf.numPages, MAX_PAGES);
      const pages = [];

      for (let i = 1; i <= total; i++) {
        if (loadingEl) loadingEl.textContent = `Loading page ${i} / ${total}…`;
        const img = await renderPageToImage(pdf, i);
        pages.push(img);
      }

      // ✅ Init PageFlip
      const pageFlip = new St.PageFlip(bookEl, {
        width: 440,          // base page width
        height: 620,         // base page height
        size: "stretch",
        minWidth: 300,
        maxWidth: 1000,
        minHeight: 400,
        maxHeight: 1400,
        maxShadowOpacity: 0.2,
        showCover: true,
        mobileScrollSupport: true,
      });

      pageFlip.loadFromHTML(pages);

      if (loadingEl) loadingEl.style.display = "none";
    } catch (err) {
      console.error(err);
      if (loadingEl) loadingEl.textContent = "Failed to load book.";
    }
  }

  init();
})();
