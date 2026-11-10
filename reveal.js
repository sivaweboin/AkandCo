(() => {
  if (!("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting || entry.intersectionRect.height === 0) continue;
      entry.target.classList.replace("reveal-pending", "reveal-entered");
      observer.unobserve(entry.target);
    }
  });

  for (const section of document.querySelectorAll("[data-reveal]")) {
    // Keep content in or above the initial viewport immediately readable.
    if (!section.hidden && section.getBoundingClientRect().top < window.innerHeight) continue;

    section.classList.add("reveal-pending");
    observer.observe(section);
    section.addEventListener("focusin", () => {
      section.classList.remove("reveal-pending", "reveal-entered");
      observer.unobserve(section);
    }, { once: true });
  }
})();
