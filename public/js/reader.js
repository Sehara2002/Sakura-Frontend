(async () => {
  const bookEl = document.getElementById("book");
  const loadingEl = document.getElementById("loading");
  if (!bookEl) return;

  const PDF_URL = "/books/sakura3.pdf";

  // B5 ratio (height / width)
  const B5_RATIO = 250 / 176;

  // retina sharpness (cap 2 to avoid huge memory)
  const DPR = Math.min(2, window.devicePixelRatio || 1);

  // small zoom boost (increase to 1.10 if you want slightly bigger)
  const ZOOM_BOOST = 1.1;

  function setLoading(msg) {
    if (loadingEl) loadingEl.textContent = msg;
  }

  function isMobile() {
    return window.matchMedia("(max-width: 768px)").matches;
  }

  // Wait for layout so clientWidth/clientHeight are correct (important on first load)
  async function waitForLayout() {
    for (let i = 0; i < 20; i++) {
      const shell = bookEl.parentElement;
      if (shell && shell.clientWidth > 50 && shell.clientHeight > 50) return;
      await new Promise((r) => requestAnimationFrame(r));
    }
  }

  // Compute SINGLE page size (PageFlip's width/height = one page)
  function computePageSize() {
    const shell = bookEl.parentElement; // .book-shell
    const styles = window.getComputedStyle(shell);

    const padX =
      parseFloat(styles.paddingLeft || "0") + parseFloat(styles.paddingRight || "0");
    const padY =
      parseFloat(styles.paddingTop || "0") + parseFloat(styles.paddingBottom || "0");

    const availW = Math.max(280, shell.clientWidth - padX);
    const availH = Math.max(360, shell.clientHeight - padY);

    // ✅ Desktop spread needs: 2 pages visible => each page <= availW/2
    // ✅ Mobile needs: 1 page visible => page <= availW
    let pageW = isMobile() ? availW : availW / 2;

    // cap sizes to keep realistic (optional)
    pageW = isMobile() ? Math.min(pageW, 520) : Math.min(pageW, 600);

    let pageH = pageW * B5_RATIO;

    // If too tall, fit by height
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

  let pageFlip = null;
  let building = false;

  async function build() {
    if (building) return;
    building = true;

    try {
      if (!window.pdfjsLib) throw new Error("pdfjsLib not loaded");
      if (!window.St) throw new Error("PageFlip (St) not loaded");

      // ✅ IMPORTANT: set worker to your local file (recommended)
      // Make sure you have: /public/js/pdf.worker.min.js
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "/js/pdf.worker.min.js";

      if (loadingEl) loadingEl.style.display = "grid";
      setLoading("Opening PDF…");

      // ensure correct element sizes
      await waitForLayout();

      bookEl.innerHTML = "";

      const { width, height } = computePageSize();

      // create flipbook
      pageFlip = new St.PageFlip(bookEl, {
        width,
        height,
        size: "fixed",

        minWidth: width,
        maxWidth: width,
        minHeight: height,
        maxHeight: height,

        // ✅ THIS is the key for mobile = single page, desktop = 2 pages
        usePortrait: isMobile(), // force portrait mode only on mobile
        showCover: true,

        mobileScrollSupport: true,
        maxShadowOpacity: 0.28,
      });

      const pdf = await window.pdfjsLib.getDocument({ url: PDF_URL }).promise;

      const pages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        setLoading(`Rendering ${i}/${pdf.numPages}…`);

        const page = await pdf.getPage(i);

        // scale to match CSS width, render with DPR for sharpness
        const scale = getRenderScale(page, width);
        const viewport = page.getViewport({ scale: scale * DPR });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { alpha: false });

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        // CSS must match flip page size
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";

        await page.render({ canvasContext: ctx, viewport }).promise;

        const wrapper = document.createElement("div");
        wrapper.className = "page";
        wrapper.style.width = "100%";
        wrapper.style.height = "100%";
        wrapper.style.background = "white";
        wrapper.style.overflow = "hidden";
        wrapper.style.borderRadius = "10px";

        wrapper.appendChild(canvas);
        pages.push(wrapper);
      }

      pageFlip.loadFromHTML(pages);

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
    } finally {
      building = false;
    }
  }

  // initial build
  await build();

  // rebuild on resize/orientation (debounced)
  let t = null;
  window.addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(() => build(), 250);
  });
})();
