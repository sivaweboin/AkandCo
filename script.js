const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!contactForm.reportValidity()) return;

  formStatus.textContent = "Thanks for your note. This preview does not send messages yet. Please contact AK&CO directly to reach our team.";
  contactForm.reset();
});

const faqList = document.querySelector(".faq-list");

if (faqList) {
  const faqItems = [...faqList.querySelectorAll("details")];
  const faqAnimations = new WeakMap();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const faqTransitionDuration = 600;

  function setFaqExpanded(details, expanded) {
    const summary = details.querySelector("summary");
    const currentHeight = details.getBoundingClientRect().height;
    const runningAnimation = faqAnimations.get(details);

    if (runningAnimation) runningAnimation.cancel();

    summary.setAttribute("aria-expanded", String(expanded));
    details.dataset.expanded = String(expanded);

    if (reduceMotion) {
      details.open = expanded;
      details.style.removeProperty("overflow");
      faqAnimations.delete(details);
      return;
    }

    if (expanded) details.open = true;

    const targetHeight = expanded
      ? details.scrollHeight
      : summary.getBoundingClientRect().height;

    details.style.overflow = "hidden";
    const animation = details.animate(
      [{ height: `${currentHeight}px` }, { height: `${targetHeight}px` }],
      { duration: faqTransitionDuration, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "forwards" }
    );
    faqAnimations.set(details, animation);

    const finishAnimation = () => {
      if (faqAnimations.get(details) !== animation) return;

      details.open = expanded;
      animation.cancel();
      details.style.removeProperty("overflow");
      faqAnimations.delete(details);
    };

    animation.onfinish = finishAnimation;
    window.setTimeout(finishAnimation, faqTransitionDuration + 50);
  }

  faqItems.forEach((details) => {
    details.querySelector("summary").setAttribute("aria-expanded", String(details.open));
  });

  faqList.addEventListener("click", (event) => {
    const summary = event.target.closest("summary");
    if (!summary || !faqList.contains(summary)) return;

    event.preventDefault();
    const details = summary.parentElement;
    const expanded = summary.getAttribute("aria-expanded") === "true";

    faqItems.forEach((item) => {
      if (item !== details &&
          (item.open || item.querySelector("summary").getAttribute("aria-expanded") === "true")) {
        setFaqExpanded(item, false);
      }
    });

    setFaqExpanded(details, !expanded);
  });
}
