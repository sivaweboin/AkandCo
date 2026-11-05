const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const heroTitle = document.querySelector("#hero-title");

if (heroTitle) {
  const titleChars = heroTitle.querySelectorAll(".contact-title-char > span");
  titleChars.forEach((character, index) => {
    character.style.setProperty("--char-index", String(index));
  });

  if ("IntersectionObserver" in window) {
    const titleObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        heroTitle.classList.add("is-visible");
        titleObserver.disconnect();
      }
    }, { threshold: 0.5 });

    titleObserver.observe(heroTitle);
  } else {
    heroTitle.classList.add("is-visible");
  }
}

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!contactForm.reportValidity()) return;

  formStatus.textContent = "Thanks for your note. This preview does not send messages yet. Please contact AK&CO directly to reach our team.";
  contactForm.reset();
});
