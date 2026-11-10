const animatedTitle = document.querySelector("[data-animate-title]");

if (animatedTitle && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const titleText = animatedTitle.textContent.trim();
  const titleContent = document.createDocumentFragment();
  let letterIndex = 0;

  for (const word of titleText.split(/\s+/)) {
    const wordSpan = document.createElement("span");
    wordSpan.className = "hero-title-word";
    wordSpan.setAttribute("aria-hidden", "true");

    for (const letter of word) {
      const mask = document.createElement("span");
      const letterSpan = document.createElement("span");
      mask.className = "hero-title-letter";
      letterSpan.textContent = letter;
      letterSpan.style.setProperty("--char-index", String(letterIndex++));
      mask.append(letterSpan);
      wordSpan.append(mask);
    }

    if (titleContent.childNodes.length) titleContent.append(" ");
    titleContent.append(wordSpan);
  }

  animatedTitle.setAttribute("aria-label", titleText);
  animatedTitle.replaceChildren(titleContent);

  if ("IntersectionObserver" in window) {
    animatedTitle.classList.add("is-ready");
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        animatedTitle.classList.add("is-visible");
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(animatedTitle);
  } else {
    animatedTitle.classList.add("is-visible");
  }
}
