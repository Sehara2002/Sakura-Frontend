(async () => {
  const { pdfjsLib } = window;
  const bookEl = document.getElementById("book");
  const loadingEl = document.getElementById("loading");

  if (!bookEl) return;

  const PDF_URL = "/books/sakura3.pdf";

  // B5 ratio (height / width)
  const B5_RATIO = 250 / 176;

  // Keep pages crisp on retina
  const DPR = Math.min(2, window.devicePixelRatio || 1);

  // If you want "more zoom", increase this a bit (1.0–1.2)
  const ZOOM_BOOST = 1.05;

  function isMobile() {
    return window.matchMedia("(max-width: 768px)").matches;
  }

  function setLoading(msg) {
    if (loadingEl) loadingEl.textContent = msg;
  }

  // Compute PageFlip page size (single page size)
  function computePageSize() {
    const shell = bookEl.parentElement; // .book-shell
    const styles = window.getComputedStyle(shell);

    const padX =
      parseFloat(styles.paddingLeft || "0") + parseFloat(styles.paddingRight || "0");
    const padY =
      parseFloat(styles.paddingTop || "0") + parseFloat(styles.paddingBottom || "0");

    const availW = Math.max(260, shell.clientWidth - padX);
    const availH = Math.max(380, shell.clientHeight - padY);

    // Mobile: single page should be wide, Desktop: keep nice reading size
    let pageW = isMobile() ? Math.min(availW, 430) : Math.min(availW / 2, 520);

    // Keep B5 ratio
    let pageH = pageW * B5_RATIO;

    // Fit height if needed
    if (pageH > availH) {
      pageH = availH;
      pageW = pageH / B5_RATIO;
    }

    return { width: Math.floor(pageW), height: Math.floor(pageH) };
  }

  // Scale PDF page to match the CSS page width
  function getScaleForPage(page, targetCssWidth) {
    const viewport1 = page.getViewport({ scale: 1 });
    return (targetCssWidth / viewport1.width) * ZOOM_BOOST;
  }

  async function build() {
    try {
      if (!window.St) throw new Error("PageFlip (St) not loaded");
      if (!pdfjsLib) throw new Error("pdfjsLib not loaded");

      loadingEl.style.display = "grid";
      setLoading("Opening PDF…");
      bookEl.innerHTML = "";

      const { width, height } = computePageSize();

      // ✅ Create PageFlip with calculated size
      const pageFlip = new St.PageFlip(bookEl, {
        width,
        height,
        size: "fixed",

        minWidth: width,
        maxWidth: width,
        minHeight: height,
        maxHeight: height,

        // Desktop uses cover nicely, mobile disables cover for better single-page UX
        showCover: !isMobile(),
        mobileScrollSupport: true,
        maxShadowOpacity: 0.28,
      });

      const pdf = await pdfjsLib.getDocument({ url: PDF_URL }).promise;

      const pages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        setLoading(`Rendering ${i}/${pdf.numPages}…`);

        const page = await pdf.getPage(i);

        // Render scale uses DPR for sharpness
        const scale = getScaleForPage(page, width);
        const viewport = page.getViewport({ scale: scale * DPR });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        // Display size MUST match flipbook page size
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";

        await page.render({ canvasContext: ctx, viewport }).promise;

        const wrapper = document.createElement("div");
        wrapper.className = "page";
        wrapper.style.width = "100%";
        wrapper.style.height = "100%";
        wrapper.style.background = "white";
        wrapper.style.borderRadius = "10px";
        wrapper.style.overflow = "hidden";

        wrapper.appendChild(canvas);
        pages.push(wrapper);
      }

      pageFlip.loadFromHTML(pages);
      loadingEl.style.display = "none";

      // Keyboard support (desktop)
      window.onkeydown = (e) => {
        if (e.key === "ArrowLeft") pageFlip.flipPrev();
        if (e.key === "ArrowRight") pageFlip.flipNext();
      };
    } catch (err) {
      console.error(err);
      if (loadingEl) loadingEl.textContent = "Failed to load book.";
    }
  }

  // First build
  await build();

  // ✅ Rebuild on resize/orientation (no reload)
  let timer = null;
  window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(() => build(), 250);
  });
})();
