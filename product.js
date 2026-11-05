const productDetail = document.querySelector("#product-detail");
const productNotFound = document.querySelector("#product-not-found");
const productId = new URLSearchParams(location.search).get("id");
const product = window.AKCO.products.find((item) => item.id === productId);
const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

if (!product) {
  productDetail.hidden = true;
  productNotFound.hidden = false;
} else {
  const productImage = document.querySelector("#product-image");
  const imageFrame = document.querySelector(".product-image-frame");
  const galleryProducts = window.AKCO.products;
  const sizeOptions = product.type === "Attar" ? [10, 20] : [10, 20, 50];
  const baseSize = Number.parseInt(product.size, 10);
  const sizeOptionsContainer = document.querySelector("#size-options");
  const galleryNavigation = document.querySelector("#gallery-navigation");
  const badge = document.querySelector("#product-badge");
  const priceOutput = document.querySelector("#product-price");
  const quantityOutput = document.querySelector("#quantity-value");
  const status = document.querySelector("#product-status");
  const addButton = document.querySelector("#add-to-bag");
  const buyNowButton = document.querySelector("#buy-now");
  const bundleSection = document.querySelector("#frequently-bought");
  const bundleTrack = document.querySelector("#bundle-track");
  const bundleTotal = document.querySelector("#bundle-total");
  const bundleAddButton = document.querySelector("#bundle-add");
  const relatedSection = document.querySelector("#related-products");
  const relatedGrid = document.querySelector("#related-grid");
  let selectedSize = sizeOptions[0];
  let quantity = 1;
  let statusTimeout;
  let controlsTimeout;
  let galleryPointerStart = null;
  let activeImageIndex = galleryProducts.findIndex(
    (item) => item.id === product.id,
  );

  document.title = `${product.name} | AK&CO`;
  document.querySelector("#product-name").textContent = product.name;
  document.querySelector("#product-category").textContent =
    product.category === "attars" ? "ATTAR" : "EAU DE PARFUM";
  document.querySelector("#product-type").textContent =
    `${product.type} · ${product.size}`;
  document.querySelector("#product-detail-copy").textContent =
    `${product.name} is part of the AK&CO collection. Choose a size to see its preview price.`;

  const relatedProducts = window.AKCO.products
    .filter(
      (item) => item.category === product.category && item.id !== product.id,
    )
    .slice(0, 6);
  if (relatedProducts.length > 0) {
    relatedSection.hidden = false;
    relatedProducts.forEach((item) => {
      const link = document.createElement("a");
      link.className = "related-card";
      link.href = `product.html?id=${encodeURIComponent(item.id)}`;
      const imageFrame = document.createElement("div");
      imageFrame.className = "related-card-image";
      const image = document.createElement("img");
      image.src = `${window.AKCO.imageBase}${encodeURIComponent(item.image)}&w=480&fm=webp&q=75`;
      image.alt = `${item.name} ${item.type}`;
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener(
        "error",
        () => {
          image.hidden = true;
          imageFrame.setAttribute(
            "aria-label",
            `${item.name} image unavailable`,
          );
        },
        { once: true },
      );
      imageFrame.append(image);
      const name = document.createElement("h3");
      name.textContent = item.name;
      const details = document.createElement("p");
      details.textContent = `${item.type} · ${item.size} · ${formatter.format(item.price)}`;
      link.append(imageFrame, name, details);
      relatedGrid.append(link);
    });
  }

  const bundleProducts = [
    product,
    ...window.AKCO.products
      .filter((item) => item.category !== product.category)
      .slice(0, 2),
  ];
  if (bundleProducts.length > 1) {
    bundleSection.hidden = false;
    bundleProducts.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "bundle-card";
      const imageFrame = document.createElement("div");
      imageFrame.className = "bundle-card-image";
      const image = document.createElement("img");
      image.src = `${window.AKCO.imageBase}${encodeURIComponent(item.image)}&w=480&fm=webp&q=75`;
      image.alt = `${item.name} ${item.type}`;
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener(
        "error",
        () => {
          image.hidden = true;
          imageFrame.setAttribute(
            "aria-label",
            `${item.name} image unavailable`,
          );
        },
        { once: true },
      );
      imageFrame.append(image);

      const name = document.createElement("h3");
      name.textContent = item.name;
      const details = document.createElement("p");
      details.textContent = `${item.type} · ${item.size}`;
      const label = document.createElement("label");
      label.className = "bundle-check";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = true;
      checkbox.disabled = index === 0;
      checkbox.dataset.bundleProduct = item.id;
      checkbox.setAttribute(
        "aria-label",
        `${index === 0 ? "Included" : "Add"} ${item.name}`,
      );
      checkbox.addEventListener("change", updateBundleTotal);
      const choiceText = document.createElement("span");
      choiceText.textContent = index === 0 ? "Selected item" : "Add to set";
      label.append(checkbox, choiceText);
      card.append(imageFrame, name, details, label);
      bundleTrack.append(card);
    });
  }

  function getProductPrice(item) {
    if (item.id !== product.id) return item.price;
    return Math.round((item.price * selectedSize) / baseSize / 50) * 50;
  }

  function updateBundleTotal() {
    const selectedIds = new Set(
      [...bundleTrack.querySelectorAll("[data-bundle-product]:checked")].map(
        (checkbox) => checkbox.dataset.bundleProduct,
      ),
    );
    const total = bundleProducts
      .filter((item) => selectedIds.has(item.id))
      .reduce((sum, item) => sum + getProductPrice(item), 0);
    bundleTotal.textContent = formatter.format(total);
  }

  updateBundleTotal();
  function scrollBundle(direction) {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? "auto"
      : "smooth";
    bundleTrack.scrollBy({
      left: direction * bundleTrack.clientWidth * 0.8,
      behavior,
    });
  }

  document.querySelector("#bundle-previous").addEventListener("click", () => {
    scrollBundle(-1);
  });
  document.querySelector("#bundle-next").addEventListener("click", () => {
    scrollBundle(1);
  });
  bundleAddButton.addEventListener("click", () => {
    const selectedNames = bundleProducts
      .filter(
        (item) =>
          bundleTrack.querySelector(`[data-bundle-product="${item.id}"]`)
            .checked,
      )
      .map((item) => item.name);
    status.textContent = `${selectedNames.join(", ")} added to your preview cart.`;
    status.classList.add("is-visible");
    window.clearTimeout(statusTimeout);
    statusTimeout = window.setTimeout(
      () => status.classList.remove("is-visible"),
      2800,
    );
  });

  function showGalleryImage(index) {
    activeImageIndex =
      (index + galleryProducts.length) % galleryProducts.length;
    const activeImage = galleryProducts[activeImageIndex];
    const imageUrl = `${window.AKCO.imageBase}${encodeURIComponent(activeImage.image)}&w=1200&fm=webp&q=75`;
    productImage.hidden = false;
    imageFrame.classList.remove("image-unavailable");
    productImage.dataset.currentImage = imageUrl;
    productImage.src = imageUrl;
    productImage.alt = `${activeImage.name} ${activeImage.type} product image`;
    badge.textContent = activeImage.badge ?? "";
    badge.hidden = !activeImage.badge;
    galleryNavigation
      .querySelectorAll(".gallery-dot")
      .forEach((dot, dotIndex) => {
        dot.setAttribute("aria-pressed", String(dotIndex === activeImageIndex));
      });
  }

  galleryProducts.forEach((item, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "gallery-dot";
    dot.setAttribute("aria-label", `Show ${item.name} image`);
    dot.setAttribute("aria-pressed", String(index === activeImageIndex));
    dot.addEventListener("click", () => showGalleryImage(index));
    galleryNavigation.append(dot);
  });
  showGalleryImage(activeImageIndex);

  document.querySelector("#gallery-previous").addEventListener("click", () => {
    showGalleryImage(activeImageIndex - 1);
  });
  document.querySelector("#gallery-next").addEventListener("click", () => {
    showGalleryImage(activeImageIndex + 1);
  });

  imageFrame.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") showGalleryImage(activeImageIndex - 1);
    if (event.key === "ArrowRight") showGalleryImage(activeImageIndex + 1);
  });

  imageFrame.addEventListener("pointerdown", (event) => {
    imageFrame.classList.add("is-controls-visible");
    window.clearTimeout(controlsTimeout);
    controlsTimeout = window.setTimeout(
      () => imageFrame.classList.remove("is-controls-visible"),
      1800,
    );
    galleryPointerStart = event.target.closest(".gallery-arrow")
      ? null
      : { id: event.pointerId, x: event.clientX, y: event.clientY };
  });

  window.addEventListener("pointerup", (event) => {
    if (!galleryPointerStart || event.pointerId !== galleryPointerStart.id)
      return;
    const horizontalDistance = event.clientX - galleryPointerStart.x;
    const verticalDistance = event.clientY - galleryPointerStart.y;
    if (
      Math.abs(horizontalDistance) > 45 &&
      Math.abs(horizontalDistance) > Math.abs(verticalDistance)
    ) {
      showGalleryImage(activeImageIndex + (horizontalDistance < 0 ? 1 : -1));
      imageFrame.classList.add("is-controls-visible");
      window.clearTimeout(controlsTimeout);
      controlsTimeout = window.setTimeout(
        () => imageFrame.classList.remove("is-controls-visible"),
        1800,
      );
    }
    galleryPointerStart = null;
  });

  window.addEventListener("pointercancel", () => {
    galleryPointerStart = null;
  });

  if (
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    galleryProducts.length > 1
  ) {
    window.setInterval(() => {
      if (
        document.hidden ||
        imageFrame.matches(":hover, :focus-within, .is-controls-visible")
      )
        return;
      showGalleryImage(activeImageIndex + 1);
    }, 5000);
  }

  productImage.addEventListener("error", () => {
    if (productImage.currentSrc !== productImage.dataset.currentImage) return;
    productImage.hidden = true;
    imageFrame.classList.add("image-unavailable");
  });

  function updatePrice() {
    const estimatedPrice =
      Math.round((product.price * selectedSize) / baseSize / 50) * 50;
    priceOutput.textContent = formatter.format(estimatedPrice);
  }

  sizeOptions.forEach((size) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "size-option";
    option.textContent = `${size} ml`;
    option.setAttribute("aria-pressed", String(size === selectedSize));
    option.addEventListener("click", () => {
      selectedSize = size;
      sizeOptionsContainer
        .querySelectorAll(".size-option")
        .forEach((button) => {
          button.setAttribute(
            "aria-pressed",
            String(Number.parseInt(button.textContent, 10) === selectedSize),
          );
        });
      updatePrice();
      updateBundleTotal();
    });
    sizeOptionsContainer.append(option);
  });
  updatePrice();

  document.querySelector("#decrease-quantity").addEventListener("click", () => {
    quantity = Math.max(1, quantity - 1);
    quantityOutput.textContent = String(quantity);
  });
  document.querySelector("#increase-quantity").addEventListener("click", () => {
    quantity = Math.min(10, quantity + 1);
    quantityOutput.textContent = String(quantity);
  });

  addButton.addEventListener("click", () => {
    status.textContent = `${quantity} × ${product.name} (${selectedSize} ml) added to your preview cart.`;
    status.classList.add("is-visible");
    window.clearTimeout(statusTimeout);
    statusTimeout = window.setTimeout(
      () => status.classList.remove("is-visible"),
      2600,
    );
  });

  buyNowButton.addEventListener("click", () => {
    status.textContent =
      "Checkout is not connected yet. No order has been placed.";
    status.classList.add("is-visible");
    window.clearTimeout(statusTimeout);
    statusTimeout = window.setTimeout(
      () => status.classList.remove("is-visible"),
      3200,
    );
  });
}
