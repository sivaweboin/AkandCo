const signupDialog = document.querySelector("#signup-dialog");
const signupForm = signupDialog?.querySelector(".signup-form");

if (signupDialog && signupForm) {
  const isShopPage = Boolean(document.querySelector("#product-grid"));
  const isProductPage =
    Boolean(document.querySelector("#product-detail")) &&
    !document.querySelector("#product-detail").hidden;

  if (isShopPage || isProductPage) {
    const decorativeProducts = window.AKCO.products.filter((item) =>
      item.image.toLowerCase().endsWith(".png"),
    );
    const floatingImages = signupDialog.querySelectorAll(".signup-floating-image");
    floatingImages.forEach((image, index) => {
      const item = decorativeProducts[index];
      if (!item) {
        image.hidden = true;
        return;
      }

      image.src = `${window.AKCO.imageBase}${encodeURIComponent(item.image)}&w=320&fm=png`;
    });

    const closeButton = signupDialog.querySelector(".signup-close");
    const signupStatus = signupDialog.querySelector(".signup-status");
    const storageKey = "akco-signup-prompt-shown";
    let hasShownSignup = sessionStorage.getItem(storageKey) === "true";

    function showSignup() {
      if (hasShownSignup || signupDialog.open) return;
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
      if (event.target === signupDialog) signupDialog.close();
    });
    signupForm.addEventListener("submit", (event) => {
      event.preventDefault();
      signupStatus.textContent =
        "This preview isn’t connected to an email list. Your address hasn’t been saved or sent.";
    });
    signupDialog.addEventListener("close", () => {
      window.clearTimeout(signupTimer);
    });
  }
}
