const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!contactForm.reportValidity()) return;

  formStatus.textContent = "Thanks for your note. This preview does not send messages yet. Please contact AK&CO directly to reach our team.";
  contactForm.reset();
});
