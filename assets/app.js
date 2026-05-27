(() => {
  // Slideshow for the Mac app demo
  const stage = document.getElementById("demoStage");
  const list  = document.getElementById("demoList");
  const bar   = document.getElementById("demoBar");
  if (!stage || !list || !bar) return;

  const slides = Array.from(stage.querySelectorAll("img"));
  const items  = Array.from(list.querySelectorAll("li"));
  const DURATION = 4200;
  let current = 0;
  let timer = null;
  let progressTimer = null;
  let startedAt = 0;
  let paused = false;

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function show(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("active", k === current));
    items.forEach((li, k) => li.classList.toggle("active", k === current));
  }

  function tickProgress() {
    if (paused) return;
    const elapsed = performance.now() - startedAt;
    const pct = Math.min(100, (elapsed / DURATION) * 100);
    bar.style.width = pct + "%";
    if (pct < 100) {
      progressTimer = requestAnimationFrame(tickProgress);
    }
  }

  function schedule() {
    clearTimeout(timer);
    cancelAnimationFrame(progressTimer);
    bar.style.width = "0%";
    if (reduceMotion) {
      // Keep showing the current frame but still advance for accessibility.
      timer = setTimeout(advance, DURATION * 2);
      return;
    }
    startedAt = performance.now();
    progressTimer = requestAnimationFrame(tickProgress);
    timer = setTimeout(advance, DURATION);
  }

  function advance() {
    if (paused) return;
    show(current + 1);
    schedule();
  }

  items.forEach((li, k) => {
    li.addEventListener("click", () => {
      show(k);
      schedule();
    });
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        show(k);
        schedule();
      }
    });
    li.tabIndex = 0;
  });

  stage.addEventListener("mouseenter", () => { paused = true; });
  stage.addEventListener("mouseleave", () => { paused = false; schedule(); });

  // Pause the carousel when offscreen — saves work and avoids janky restarts.
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          paused = false;
          schedule();
        } else {
          paused = true;
          clearTimeout(timer);
          cancelAnimationFrame(progressTimer);
        }
      }
    }, { threshold: 0.25 });
    io.observe(stage);
  } else {
    schedule();
  }

  // Install tabs
  const tabs = document.querySelectorAll('.tabs [role="tab"]');
  const panels = document.querySelectorAll('.tabpanels [data-panel]');
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      tabs.forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
      panels.forEach((p) => {
        if (p.dataset.panel === target) p.removeAttribute("hidden");
        else p.setAttribute("hidden", "");
      });
    });
  });
})();
