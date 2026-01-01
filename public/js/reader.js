(async () => {
  const bookEl = document.getElementById("book");
  const loadingEl = document.getElementById("loading");
  if (!bookEl) return;

  const PDF_URL = "/books/sakura3.pdf";

  // B5 ratio (height / width)
  const B5_RATIO = 250 / 176;

  // Render a few pages first so the book appears quickly
  const FIRST_BATCH = 4;

  // Render remaining pages in background with limited parallelism
  const CONCURRENCY = 2;

  // Small zoom boost (keep small for speed)
  const ZOOM_BOOST = 1.02;

  function setLoading(msg) {
    if (loadingEl) loadingEl.textContent = msg;
  }

  function isMobile() {
    return window.matchMedia("(max-width: 768px)").matches;
  }

  // ✅ Speed: lower DPR on mobile (huge performance gain)
  function getDPR() {
    const dpr = window.devicePixelRatio || 1;
    return isMobile() ? Math.min(1.25, dpr) : Math.min(1.75, dpr);
  }

  async function waitForLayout() {
    for (let i = 0; i < 20; i++) {
      const shell = bookEl.parentElement;
      if (shell && shell.clientWidth > 50 && shell.clientHeight > 50) return;
      await new Promise((r) => requestAnimationFrame(r));
    }
  }

  function computePageSize() {
    const shell = bookEl.parentElement; // .book-shell
    const styles = window.getComputedStyle(shell);

    const padX =
      parseFloat(styles.paddingLeft || "0") + parseFloat(styles.paddingRight || "0");
    const padY =
      parseFloat(styles.paddingTop || "0") + parseFloat(styles.paddingBottom || "0");

    const availW = Math.max(280, shell.clientWidth - padX);
    const availH = Math.max(360, shell.clientHeight - padY);

    // Desktop: 2-page spread => each page <= availW/2
    // Mobile: 1 page => page <= availW
    let pageW = isMobile() ? availW : availW / 2;

    // Cap sizes
    pageW = isMobile() ? Math.min(pageW, 520) : Math.min(pageW, 600);

    let pageH = pageW * B5_RATIO;

    // Fit by height if needed
    if (pageH > availH) {
      pageH = availH;
      pageW = pageH / B5_RATIO;
    }

    return { width: Math.floor(pageW), height: Math.floor(pageH) };
  }

  function getRenderScale(page, targetCssWidth) {
    const viewport1 = page.getViewport({ scale: 1 });
    return (targetCssWidth / viewport1.width) * ZOOM_BOOST;
  }

  function makePageWrapper() {
    const wrapper = document.createElement("div");
    wrapper.className = "page";
    wrapper.style.width = "100%";
    wrapper.style.height = "100%";
    wrapper.style.background = "white";
    wrapper.style.overflow = "hidden";
    wrapper.style.borderRadius = "10px";
    return wrapper;
  }

  // Render page into wrapper
  async function renderIntoWrapper(pdf, pageNum, wrapper, targetWidthCss) {
    const page = await pdf.getPage(pageNum);

    const dpr = getDPR();
    const scale = getRenderScale(page, targetWidthCss);
    const viewport = page.getViewport({ scale: scale * dpr });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { alpha: false });

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    // CSS size matches flip page size
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";

    await page.render({ canvasContext: ctx, viewport }).promise;

    wrapper.innerHTML = "";
    wrapper.appendChild(canvas);
  }

  // Simple concurrency runner
  async function runWithConcurrency(tasks, concurrency) {
    let index = 0;
    const workers = new Array(concurrency).fill(0).map(async () => {
      while (index < tasks.length) {
        const myIndex = index++;
        await tasks[myIndex]();
      }
    });
    await Promise.all(workers);
  }

  let pageFlip = null;
  let buildToken = 0;

  async function build() {
    const token = ++buildToken;

    try {
      if (!window.pdfjsLib) throw new Error("pdfjsLib not loaded");
      if (!window.St) throw new Error("PageFlip (St) not loaded");

      // ✅ Best: host worker locally (fast + avoids cold-start failures)
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "/js/pdf.worker.min.js";

      if (loadingEl) loadingEl.style.display = "grid";
      setLoading("Opening PDF…");

      await waitForLayout();

      bookEl.innerHTML = "";

      const { width, height } = computePageSize();

      // Create flipbook immediately (fast UI)
      pageFlip = new St.PageFlip(bookEl, {
        width,
        height,
        size: "fixed",
        minWidth: width,
        maxWidth: width,
        minHeight: height,
        maxHeight: height,

        usePortrait: isMobile(), // ✅ mobile 1 page, desktop 2 pages
        showCover: true,
        mobileScrollSupport: true,
        maxShadowOpacity: 0.28,
      });

      // Load PDF with settings that can improve reliability on some hosts
      const pdf = await window.pdfjsLib.getDocument({
        url: PDF_URL,
        // If you still get random "Failed to load" on first open, enable these:
        // disableRange: true,
        // disableStream: true,
      }).promise;

      const total = pdf.numPages;

      // Create placeholder pages (instant)
      const wrappers = [];
      for (let i = 1; i <= total; i++) {
        const w = makePageWrapper();
        // tiny skeleton so it doesn’t look empty
        w.style.display = "grid";
        w.style.placeItems = "center";
        w.style.color = "rgba(0,0,0,0.35)";
        w.style.fontWeight = "800";
        w.textContent = "Loading…";
        wrappers.push(w);
      }

      // Load placeholders into PageFlip immediately
      pageFlip.loadFromHTML(wrappers);

      // Render FIRST_BATCH first (so flip works quickly)
      const first = Math.min(FIRST_BATCH, total);
      for (let p = 1; p <= first; p++) {
        if (token !== buildToken) return;
        setLoading(`Rendering ${p}/${total}…`);
        await renderIntoWrapper(pdf, p, wrappers[p - 1], width);
      }

      // Refresh flipbook after first pages ready
      if (typeof pageFlip.updateFromHtml === "function") {
        pageFlip.updateFromHtml(bookEl.querySelectorAll(".page"));
      } else {
        pageFlip.loadFromHTML(bookEl.querySelectorAll(".page"));
      }

      // Background render remaining pages (fast + non-blocking)
      setLoading("Loading remaining pages…");

      const tasks = [];
      for (let p = first + 1; p <= total; p++) {
        tasks.push(async () => {
          if (token !== buildToken) return;
          await renderIntoWrapper(pdf, p, wrappers[p - 1], width);
        });
      }

      await runWithConcurrency(tasks, CONCURRENCY);

      // Final refresh so PageFlip knows all pages are fully ready
      if (token !== buildToken) return;

      if (typeof pageFlip.updateFromHtml === "function") {
        pageFlip.updateFromHtml(bookEl.querySelectorAll(".page"));
      } else {
        pageFlip.loadFromHTML(bookEl.querySelectorAll(".page"));
      }

      if (loadingEl) loadingEl.style.display = "none";

      // Desktop arrow keys
      window.onkeydown = (e) => {
        if (!pageFlip) return;
        if (e.key === "ArrowLeft") pageFlip.flipPrev();
        if (e.key === "ArrowRight") pageFlip.flipNext();
      };
    } catch (err) {
      console.error(err);
      if (loadingEl) {
        loadingEl.style.display = "grid";
        loadingEl.textContent = "Failed to load book.";
      }
    }
  }

  // build once
  await build();

  // rebuild on resize/orientation (debounced)
  let t = null;
  window.addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(() => build(), 250);
  });
})();
