(() => {
  if (!("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting || entry.intersectionRect.height === 0) continue;
      const section = entry.target;
      if (section.classList.replace("reveal-pending", "reveal-entered") &&
          section.hasAttribute("data-reveal-stagger")) {
        [...section.children].forEach((item, index) => {
          item.classList.add("reveal-step");
          item.style.setProperty("--reveal-step", String(Math.min(index, 5)));
        });
      }
      observer.unobserve(entry.target);
    }
  });

  for (const section of document.querySelectorAll("[data-reveal]")) {
    // Keep ordinary content in the initial viewport immediately readable.
    if (!section.hasAttribute("data-reveal-stagger") && !section.hidden &&
        section.getBoundingClientRect().top < window.innerHeight) continue;

    section.classList.add("reveal-pending");
    observer.observe(section);
    section.addEventListener("focusin", () => {
      section.classList.remove("reveal-pending", "reveal-entered");
      observer.unobserve(section);
    }, { once: true });
  }
})();
