const products = window.AKCO.products;

const categoryNames = {
  all: "All Products",
  attars: "Attars",
  perfumes: "Perfumes",
  "bakhoor-burners": "Bakhoor",
  fresheners: "Fresheners"
};
const formatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const productGrid = document.querySelector("#product-grid");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#product-search");
const sortSelect = document.querySelector("#sort-products");
const priceRange = document.querySelector("#price-range");
const priceOutput = document.querySelector("#price-output");
const collectionTitle = document.querySelector("#collection-title");
const categoryScroller = document.querySelector("#shop-categories");
const categoryNext = document.querySelector(".category-next");
const categoryTabs = [...document.querySelectorAll(".category-tab")];
const categoryFilters = [...document.querySelectorAll("[data-category-filter]")];
const typeFilters = [...document.querySelectorAll("[data-type-filter]")];
const shopStatus = document.querySelector("#shop-status");
const clearFiltersButton = document.querySelector("#clear-filters");
const filterPanel = document.querySelector(".filter-panel");
const filterToggle = document.querySelector("#filter-toggle");
const mobileFilters = window.matchMedia("(max-width: 620px)");
let selectedCategory = new URLSearchParams(location.search).get("category") ?? "all";
let statusTimeout;


if (!(selectedCategory in categoryNames)) selectedCategory = "all";

function optimizedImage(filename, width = 560) {
  return `${window.AKCO.imageBase}${encodeURIComponent(filename)}&w=${width}&fm=webp&q=75`;
}

function getVisibleProducts() {
  const selectedCategories = categoryFilters.filter((input) => input.checked).map((input) => input.value);
  const selectedTypes = typeFilters.filter((input) => input.checked).map((input) => input.value);
  const query = searchInput.value.trim().toLocaleLowerCase();
  const maxPrice = Number(priceRange.value);

  const visible = products.filter((product) => {
    const categoryMatches = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    const typeMatches = selectedTypes.length === 0 || selectedTypes.includes(product.type);
    const searchMatches = `${product.name} ${product.type} ${product.size}`.toLocaleLowerCase().includes(query);
    return categoryMatches && typeMatches && searchMatches && product.price <= maxPrice;
  });

  const sortOrder = sortSelect.value;
  if (sortOrder === "price-low") visible.sort((a, b) => a.price - b.price);
  if (sortOrder === "price-high") visible.sort((a, b) => b.price - a.price);
  if (sortOrder === "name") visible.sort((a, b) => a.name.localeCompare(b.name));
  return visible;
}

function productCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  const visual = document.createElement("div");
  visual.className = "product-visual";

  const image = document.createElement("img");
  image.src = optimizedImage(product.image);
  image.alt = `${product.name} ${product.type}, ${product.size}`;
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener("error", () => {
    image.hidden = true;
    visual.classList.add("image-unavailable");
    visual.setAttribute("aria-label", `${product.name} product image unavailable`);
  }, { once: true });
  const detailUrl = `product.html?id=${encodeURIComponent(product.id)}`;
  const imageLink = document.createElement("a");
  imageLink.className = "product-detail-link";
  imageLink.href = detailUrl;
  imageLink.setAttribute("aria-label", `View ${product.name} details`);
  imageLink.append(image);
  visual.append(imageLink);

  if (product.badge) {
    const badge = document.createElement("span");
    badge.className = "product-badge";
    badge.textContent = product.badge;
    visual.append(badge);
  }

  const favorite = document.createElement("button");
  favorite.className = "favorite-button";
  favorite.type = "button";
  favorite.setAttribute("aria-label", `Add ${product.name} to favorites`);
  favorite.setAttribute("aria-pressed", "false");
  favorite.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 5.2-8.8 10-8.8 10s-8.8-4.8-8.8-10A4.8 4.8 0 0 1 12 6.4a4.8 4.8 0 0 1 8.8 2.4Z"></path></svg>';
  favorite.addEventListener("click", () => {
    const isFavorite = favorite.getAttribute("aria-pressed") === "true";
    favorite.setAttribute("aria-pressed", String(!isFavorite));
    favorite.setAttribute("aria-label", isFavorite ? `Add ${product.name} to favorites` : `Remove ${product.name} from favorites`);
    showStatus(isFavorite ? `${product.name} removed from favorites.` : `${product.name} added to favorites.`);
  });
  visual.append(favorite);

  const info = document.createElement("div");
  info.className = "product-info";
  const name = document.createElement("h3");
  name.textContent = product.name;
  const nameLink = document.createElement("a");
  nameLink.className = "product-name-link";
  nameLink.href = detailUrl;
  nameLink.append(name);
  const price = document.createElement("p");
  price.className = "product-price";
  price.textContent = formatter.format(product.price);
  const type = document.createElement("p");
  type.className = "product-type";
  type.textContent = `${product.type} · ${product.size}`;
  info.append(nameLink, price, type);

  const actions = document.createElement("div");
  actions.className = "product-card-actions";
  const addButton = document.createElement("button");
  addButton.className = "add-to-bag";
  addButton.type = "button";
  addButton.textContent = "ADD TO BAG";
  addButton.addEventListener("click", () => {
    window.AKCO.cart.add([{
      id: product.id,
      size: Number.parseInt(product.size, 10),
      price: product.price,
      quantity: 1,
    }]);
  });
  actions.append(addButton);
  card.append(visual, info, actions);
  return card;
}

function updateCategoryControls() {
  categoryTabs.forEach((tab) => tab.setAttribute("aria-pressed", String(tab.dataset.category === selectedCategory)));
  categoryFilters.forEach((input) => {
    input.checked = selectedCategory !== "all" && input.value === selectedCategory;
  });
  collectionTitle.textContent = categoryNames[selectedCategory];
  const url = new URL(location.href);
  if (selectedCategory === "all") url.searchParams.delete("category");
  else url.searchParams.set("category", selectedCategory);
  history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function updateCategoryCounts() {
  categoryFilters.forEach((input) => {
    const count = products.filter((product) => product.category === input.value).length;
    document.querySelector(`[data-count="${input.value}"]`).textContent = String(count);
  });
}

function renderProducts() {
  const visibleProducts = getVisibleProducts();
  productGrid.replaceChildren(...visibleProducts.map(productCard));
  emptyState.hidden = visibleProducts.length > 0;

  if (visibleProducts.length === 0) {
    const categoryIsEmpty = selectedCategory === "bakhoor-burners" || selectedCategory === "fresheners";
    document.querySelector("#empty-title").textContent = categoryIsEmpty && !searchInput.value.trim() ? "Coming soon" : "No fragrances found";
    document.querySelector("#empty-copy").textContent = categoryIsEmpty && !searchInput.value.trim()
      ? "We’re curating this part of the AK&CO collection. Explore our perfumes and attars in the meantime."
      : "Try adjusting your filters or search for another scent.";
  }
}

function showStatus(message) {
  shopStatus.textContent = message;
  shopStatus.hidden = false;
  window.clearTimeout(statusTimeout);
  statusTimeout = window.setTimeout(() => {
    shopStatus.hidden = true;
  }, 2400);
}

function clearFilters() {
  selectedCategory = "all";
  categoryFilters.forEach((input) => { input.checked = false; });
  typeFilters.forEach((input) => { input.checked = false; });
  searchInput.value = "";
  sortSelect.value = "featured";
  priceRange.value = priceRange.max;
  priceOutput.value = formatter.format(Number(priceRange.value));
  updateCategoryControls();
  renderProducts();
}

function updateFilterPanelForViewport() {
  const isMobile = mobileFilters.matches;
  filterToggle.hidden = !isMobile;

  if (isMobile) {
    filterPanel.classList.add("is-collapsed");
    filterPanel.classList.remove("is-expanded");
    filterToggle.setAttribute("aria-expanded", "false");
    filterToggle.innerHTML = 'SHOW FILTERS <span aria-hidden="true">+</span>';
  } else {
    filterPanel.classList.remove("is-collapsed", "is-expanded");
    filterToggle.setAttribute("aria-expanded", "true");
    filterToggle.innerHTML = 'HIDE FILTERS <span aria-hidden="true">−</span>';
  }
}

filterToggle.addEventListener("click", () => {
  const isExpanded = filterToggle.getAttribute("aria-expanded") === "true";
  filterToggle.setAttribute("aria-expanded", String(!isExpanded));
  filterToggle.innerHTML = isExpanded
    ? 'SHOW FILTERS <span aria-hidden="true">+</span>'
    : 'HIDE FILTERS <span aria-hidden="true">−</span>';
  filterPanel.classList.toggle("is-collapsed", isExpanded);
  filterPanel.classList.toggle("is-expanded", !isExpanded);
});

mobileFilters.addEventListener("change", updateFilterPanelForViewport);

function updateCategoryArrow() {
  const scrollLimit = categoryScroller.scrollWidth - categoryScroller.clientWidth;
  categoryNext.hidden = scrollLimit <= 1;
  categoryNext.disabled = categoryScroller.scrollLeft >= scrollLimit - 1;
}

categoryNext.addEventListener("click", () => {
  categoryScroller.scrollBy({ left: categoryScroller.clientWidth * .8 });
});
categoryScroller.addEventListener("scroll", updateCategoryArrow, { passive: true });
window.addEventListener("resize", updateCategoryArrow);
updateCategoryArrow();

categoryTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    selectedCategory = tab.dataset.category;
    updateCategoryControls();
    renderProducts();
  });
});

categoryFilters.forEach((input) => {
  input.addEventListener("change", () => {
    const checkedCategories = categoryFilters.filter((filter) => filter.checked);
    selectedCategory = checkedCategories.length === 1 ? checkedCategories[0].value : "all";
    updateCategoryControls();
    checkedCategories.forEach((filter) => { filter.checked = true; });
    renderProducts();
  });
});

typeFilters.forEach((input) => input.addEventListener("change", renderProducts));
searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);
priceRange.addEventListener("input", () => {
  priceOutput.value = formatter.format(Number(priceRange.value));
  renderProducts();
});
clearFiltersButton.addEventListener("click", clearFilters);
document.querySelector("#empty-reset").addEventListener("click", clearFilters);

priceOutput.value = formatter.format(Number(priceRange.value));
updateFilterPanelForViewport();
updateCategoryCounts();
updateCategoryControls();
renderProducts();
