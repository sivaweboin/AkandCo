const signupDialog = document.querySelector("#signup-dialog");
const signupForm = signupDialog?.querySelector(".signup-form");

if (signupDialog && signupForm) {
  const isShopPage = Boolean(document.querySelector("#product-grid"));
  const isProductPage =
    Boolean(document.querySelector("#product-detail")) &&
    !document.querySelector("#product-detail").hidden;

  if (isShopPage || isProductPage) {
    const closeButton = signupDialog.querySelector(".signup-close");
    const signupStatus = signupDialog.querySelector(".signup-status");
    const storageKey = "akco-signup-prompt-shown";
    let hasShownSignup = sessionStorage.getItem(storageKey) === "true";

    function showSignup() {
      if (hasShownSignup || document.querySelector("dialog[open]")) return;
      hasShownSignup = true;
      sessionStorage.setItem(storageKey, "true");
      signupDialog.showModal();
    }

    const signupTimer = window.setTimeout(showSignup, 8000);
    document.addEventListener("mouseout", (event) => {
      if (event.clientY <= 0) showSignup();
    });

    closeButton.addEventListener("click", () => signupDialog.close());
    signupDialog.addEventListener("click", (event) => {
      if (event.target !== signupDialog) return;
      const { left, right, top, bottom } = signupDialog.getBoundingClientRect();
      if (event.clientX < left || event.clientX > right ||
          event.clientY < top || event.clientY > bottom) signupDialog.close();
    });
    signupForm.addEventListener("submit", (event) => {
      event.preventDefault();
      signupStatus.textContent =
        "This is a preview. Your email wasn’t saved, and no discount code was issued.";
    });
    signupDialog.addEventListener("close", () => {
      window.clearTimeout(signupTimer);
    });
  }
}

