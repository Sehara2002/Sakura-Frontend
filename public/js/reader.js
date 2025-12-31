(async function () {
  const bookEl = document.getElementById("book");
  const loadingEl = document.getElementById("loading");
  if (!bookEl) return;

  const PDF_URL = "/books/sakura3.pdf";
  const FIRST_BATCH = 6;
  const SCALE = 2.5; // your zoom

  function setLoading(msg) {
    if (loadingEl) loadingEl.textContent = msg;
  }

  // ✅ responsive helpers
  function isMobileView() {
    return window.matchMedia("(max-width: 768px)").matches;
  }

  function getFlipSize() {
    // Use the real container size so it behaves correctly in DevTools responsive mode
    const rect = bookEl.getBoundingClientRect();

    // Fallback if rect not ready
    const containerW = Math.max(320, Math.floor(rect.width || window.innerWidth));
    const containerH = Math.max(420, Math.floor(rect.height || window.innerHeight * 0.85));

    if (isMobileView()) {
      // ✅ single page: page width = container width
      return {
        width: containerW,
        height: containerH,
        showCover: false, // ✅ IMPORTANT on mobile
      };
    }

    // ✅ desktop: two pages (spread). width/height are single-page size.
    // Use your original values to keep layout stable.
    return {
      width: 520,
      height: 720,
      showCover: true,
    };
  }

  try {
    if (!window.pdfjsLib) throw new Error("pdfjsLib not loaded");
    if (!window.St) throw new Error("PageFlip (St) not loaded");

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    setLoading("Opening PDF…");

    const pdf = await pdfjsLib.getDocument({
      url: PDF_URL,
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
    const initial = getFlipSize();

    const mobile = window.matchMedia("(max-width: 768px)").matches;

    // container size (real size in iPhone safari too)
    const cw = Math.max(320, bookEl.clientWidth);
    const ch = Math.max(420, bookEl.clientHeight);

    const pageFlip = new St.PageFlip(bookEl, {
      // Desktop (your original)
      width: mobile ? cw : 520,
      height: mobile ? ch : 720,

      // ✅ IMPORTANT: force single page on phones
      usePortrait: mobile,
      showCover: !mobile,      // cover on mobile often triggers spread behavior

      // ✅ On mobile, fixed sizing behaves better than stretch
      size: mobile ? "fixed" : "stretch",

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

      if (typeof pageFlip.updateFromHtml === "function") {
        pageFlip.updateFromHtml(bookEl.querySelectorAll(".page"));
      } else {
        pageFlip.loadFromHTML(bookEl.querySelectorAll(".page"));
      }

      if (typeof pageFlip.turnToPage === "function") {
        pageFlip.turnToPage(current);
      }
    }

    // ✅ Resize handler: update flip size when switching between mobile/desktop
    let lastMobile = isMobileView();
    function applyResponsiveSize() {
      const nowMobile = isMobileView();
      const { width, height, showCover } = getFlipSize();

      // If PageFlip has update(), use it
      if (typeof pageFlip.update === "function") {
        pageFlip.update({ width, height, size: "stretch", showCover });
      } else {
        // fallback: nothing (most builds have update)
      }

      // If mode changed, rebuild pages layout
      if (nowMobile !== lastMobile) {
        lastMobile = nowMobile;
        refreshFlipbook();
      }
    }

    // debounce resize
    let t = null;
    window.addEventListener("resize", () => {
      clearTimeout(t);
      t = setTimeout(applyResponsiveSize, 180);
    });

    // 3) Render the rest in background
    setLoading("Loading remaining pages…");

    for (let p = first + 1; p <= total; p++) {
      await new Promise((r) => setTimeout(r, 0));

      const pageDiv = await renderPage(p);

      // prevent "last page stuck visible"
      pageDiv.style.display = "none";
      bookEl.appendChild(pageDiv);

      if (p % 3 === 0 || p === total) {
        refreshFlipbook();
        bookEl.querySelectorAll(".page").forEach((el) => (el.style.display = ""));
        setLoading(`Loaded ${p}/${total}…`);

        // keep responsive sizes correct while loading
        applyResponsiveSize();
      }
    }

    if (loadingEl) loadingEl.style.display = "none";
  } catch (err) {
    console.error(err);
    if (loadingEl) loadingEl.textContent = "Failed to load book.";
  }
})();
