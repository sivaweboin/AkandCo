(() => {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (motion.matches || navigator.connection?.saveData) return;

  const source = new URL("images/title-smoke.mp4", document.currentScript.src);

  function addSmoke(title) {
    const backdrop = document.createElement("div");
    backdrop.className = "title-smoke";
    backdrop.setAttribute("aria-hidden", "true");

    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = source;
    backdrop.append(video);

    title.append(backdrop);

    video.addEventListener("playing", () => {
      title.classList.add("has-title-smoke");
    }, { once: true });
    motion.addEventListener("change", (event) => {
      if (event.matches) video.pause();
    });

    if (!motion.matches) video.play().catch(() => {});
  }

  document.querySelectorAll("[data-smoke-title]").forEach(addSmoke);
})();
