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

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "title-smoke-toggle";
    toggle.textContent = "Pause background";
    toggle.hidden = true;
    title.append(backdrop, toggle);

    video.addEventListener("playing", () => {
      title.classList.add("has-title-smoke");
      toggle.textContent = "Pause background";
      toggle.hidden = false;
    });
    video.addEventListener("pause", () => {
      toggle.textContent = "Play background";
    });
    toggle.addEventListener("click", () => {
      if (video.paused) video.play().catch(() => {});
      else video.pause();
    });
    motion.addEventListener("change", (event) => {
      if (event.matches) video.pause();
    });

    if (!motion.matches) video.play().catch(() => {});
  }

  document.querySelectorAll("[data-smoke-title]").forEach(addSmoke);
})();
