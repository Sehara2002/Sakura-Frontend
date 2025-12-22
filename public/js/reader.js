(async () => {
  // ----------------------------
  // Access control
  // ----------------------------

  const { pdfjsLib } = window;

  const pdfUrl = "/api/pdf";
  const loadingEl = document.getElementById("loading");
  const bookEl = document.getElementById("book");

  // ----------------------------
  // Procedural flip sound (no file)
  // ----------------------------
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContext();
  let audioUnlocked = false;

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    audioCtx.resume();
  }
  window.addEventListener("pointerdown", unlockAudio, { once: true });
  window.addEventListener("keydown", unlockAudio, { once: true });

  function playFlipSound() {
    if (audioCtx.state !== "running") return;

    const duration = 0.18;
    const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * duration, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.4;

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1200;
    filter.Q.value = 0.7;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    noise.start();
    noise.stop(audioCtx.currentTime + duration);
  }

  // ----------------------------
  // requestIdleCallback fallback
  // ----------------------------
  const ric = window.requestIdleCallback
    ? window.requestIdleCallback.bind(window)
    : (cb) => setTimeout(() => cb({ timeRemaining: () => 12 }), 50);

  // ----------------------------
  // Responsive sizing (B5)
  // ----------------------------
  const B5_RATIO = 250 / 176;

  function computeBookSize() {
    const shell = bookEl.parentElement;
    const st = window.getComputedStyle(shell);

    const paddingX = parseFloat(st.paddingLeft) + parseFloat(st.paddingRight);
    const paddingY = parseFloat(st.paddingTop) + parseFloat(st.paddingBottom);

    const availableW = Math.max(260, shell.clientWidth - paddingX);

    const viewportH = window.innerHeight;
    const safeH = Math.max(420, viewportH - 80);
    const availableH = Math.max(420, safeH - paddingY);

    const w = window.innerWidth;
    let targetW;
    if (w <= 480) targetW = Math.min(availableW, 330);
    else if (w <= 768) targetW = Math.min(availableW, 380);
    else if (w <= 1200) targetW = Math.min(availableW, 460);
    else targetW = Math.min(availableW, 520);

    const maxWFromHeight = availableH / B5_RATIO;

    const width = Math.floor(Math.min(targetW, maxWFromHeight));
    const height = Math.floor(width * B5_RATIO);
    return { width, height };
  }

  function getScaleForPage(page, targetWidthCssPx) {
    const viewport1 = page.getViewport({ scale: 1 });
    return targetWidthCssPx / viewport1.width;
  }

  function createPlaceholderPage(label) {
    const wrapper = document.createElement("div");
    wrapper.style.width = "100%";
    wrapper.style.height = "100%";
    wrapper.style.display = "grid";
    wrapper.style.placeItems = "center";
    wrapper.style.background = "white";
    wrapper.style.borderRadius = "10px";
    wrapper.style.overflow = "hidden";

    const txt = document.createElement("div");
    txt.textContent = label;
    txt.style.fontWeight = "700";
    txt.style.color = "rgba(42,31,37,0.55)";
    txt.style.fontSize = "14px";
    wrapper.appendChild(txt);

    return wrapper;
  }

  async function renderIntoWrapper(pdf, pageNum, wrapper, targetCssWidth, dpr) {
    const page = await pdf.getPage(pageNum);
    const scale = getScaleForPage(page, targetCssWidth);
    const viewport = page.getViewport({ scale: scale * dpr });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.borderRadius = "10px";

    await page.render({ canvasContext: ctx, viewport }).promise;

    wrapper.innerHTML = "";
    wrapper.appendChild(canvas);
  }

  // ----------------------------
  // Build: fast + no-lag + urgent rendering on flip
  // ----------------------------
  async function build() {
    loadingEl.style.display = "grid";
    bookEl.innerHTML = "";

    const { width, height } = computeBookSize();
    const isMobile = window.innerWidth <= 768;

    // DPR tuning
    const dpr = isMobile ? 1.25 : Math.min(2, window.devicePixelRatio || 1);

    const pageFlip = new St.PageFlip(bookEl, {
      width,
      height,
      size: "fixed",
      minWidth: width,
      maxWidth: width,
      minHeight: height,
      maxHeight: height,

      showCover: true,
      usePortrait: isMobile,
      autoSize: false,
      mobileScrollSupport: true,
      maxShadowOpacity: 0.28
    });

    const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
    const total = pdf.numPages;

    // placeholders
    const pages = [];
    for (let i = 1; i <= total; i++) pages.push(createPlaceholderPage(`Loading page ${i}…`));
    pageFlip.loadFromHTML(pages);

    // render queue
    const rendered = new Array(total + 1).fill(false);
    const renderQueue = [];
    let idleRendering = false;
    let urgentRendering = false;

    const targetCssWidth = width;

    function enqueue(pageNum) {
      if (pageNum < 1 || pageNum > total) return;
      if (rendered[pageNum]) return;
      if (renderQueue.includes(pageNum)) return;
      renderQueue.push(pageNum);
    }

    function prioritizeAround(currentPage) {
      const windowSize = isMobile ? 3 : 10; // desktop prefetch more
      enqueue(currentPage);
      enqueue(currentPage + 1); // spread help

      for (let d = 1; d <= windowSize; d++) {
        enqueue(currentPage + d);
        enqueue(currentPage - d);
      }
    }

    // URGENT: render 1–2 pages immediately (no waiting)
    async function processUrgent() {
      if (urgentRendering) return;
      urgentRendering = true;

      try {
        const burst = isMobile ? 1 : 2; // render fewer on mobile
        let count = 0;

        while (renderQueue.length && count < burst) {
          const p = renderQueue.shift();
          if (!rendered[p]) {
            await renderIntoWrapper(pdf, p, pages[p - 1], targetCssWidth, dpr);
            rendered[p] = true;
            count++;
          }
        }
      } finally {
        urgentRendering = false;
      }
    }

    // IDLE: render remaining pages only when browser is idle
    function processIdle() {
      if (idleRendering) return;
      idleRendering = true;

      ric(async (deadline) => {
        try {
          while (renderQueue.length && deadline.timeRemaining() > 8) {
            const p = renderQueue.shift();
            if (!rendered[p]) {
              await renderIntoWrapper(pdf, p, pages[p - 1], targetCssWidth, dpr);
              rendered[p] = true;
            }
          }
        } finally {
          idleRendering = false;
          if (renderQueue.length) processIdle();
        }
      });
    }

    // render first pages quickly so opening is never blank
    const FIRST_RENDER = isMobile ? 2 : 6;
    for (let i = 1; i <= Math.min(FIRST_RENDER, total); i++) {
      await renderIntoWrapper(pdf, i, pages[i - 1], targetCssWidth, dpr);
      rendered[i] = true;
    }
    loadingEl.style.display = "none";

    // preload around start
    prioritizeAround(1);
    processIdle();

    // flip events: sound + urgent render now + continue idle
    pageFlip.on("flip", async () => {
      playFlipSound();

      const currentIndex = pageFlip.getCurrentPageIndex?.() ?? 0;
      const currentPage = currentIndex + 1;

      prioritizeAround(currentPage);

      // ✅ immediate page drawing so user sees content fast
      await processUrgent();

      // continue filling cache quietly
      processIdle();
    });

    // keyboard
    window.onkeydown = (e) => {
      if (e.key === "ArrowLeft") pageFlip.flipPrev();
      if (e.key === "ArrowRight") pageFlip.flipNext();
    };
  }

  await build();

  // rebuild on resize/orientation change
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => build(), 250);
  });
})();
