(() => {
  const { products, imageBase } = window.AKCO;
  const storageKey = "akco-cart";
  const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
  const cart = document.createElement("dialog");
  cart.className = "cart-drawer";
  cart.setAttribute("aria-labelledby", "cart-title");
  cart.innerHTML = `
    <header class="cart-header">
      <div>
        <p class="cart-brand">AK&amp;CO</p>
        <h2 id="cart-title">Your shopping bag</h2>
        <p class="cart-count" aria-live="polite"></p>
      </div>
      <button type="button" class="cart-close" aria-label="Close shopping bag" autofocus>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
          <path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </header>
    <div class="cart-body">
      <ul class="cart-items" aria-label="Items in your bag"></ul>
      <div class="cart-empty">
        <h3>Your bag is empty</h3>
        <p>Find a fragrance to add to your bag.</p>
        <a href="shop.html#collection">Browse fragrances</a>
      </div>
    </div>
    <footer class="cart-summary" hidden>
      <p class="cart-subtotal"><strong>Subtotal</strong><output aria-live="polite"></output></p>
      <button type="button" class="cart-checkout">Preview checkout</button>
      <p class="cart-note" role="status">Preview only. No payment is collected.</p>
      <button type="button" class="cart-continue">Continue shopping</button>
    </footer>
  `;
  document.body.append(cart);

  const list = cart.querySelector(".cart-items");
  const body = cart.querySelector(".cart-body");
  const count = cart.querySelector(".cart-count");
  const empty = cart.querySelector(".cart-empty");
  const browse = empty.querySelector("a");
  const summary = cart.querySelector(".cart-summary");
  const subtotal = summary.querySelector("output");
  const note = summary.querySelector(".cart-note");
  const close = cart.querySelector(".cart-close");
  let items = [];

  function readCart() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey));
      return Array.isArray(stored) ? stored.filter((item) =>
        item && products.some(({ id }) => id === item.id) &&
        Number.isSafeInteger(item.size) && item.size > 0 &&
        Number.isFinite(item.price) && item.price >= 0 &&
        Number.isSafeInteger(item.quantity) && item.quantity > 0
      ) : [];
    } catch {
      return items;
    }
  }

  function renderItem(item) {
    const product = products.find(({ id }) => id === item.id);
    const row = document.createElement("li");
    row.className = "cart-item";
    row.innerHTML = `
      <img alt="" width="68" height="84">
      <div class="cart-item-info">
        <div class="cart-item-heading">
          <h3></h3>
          <strong class="cart-line-price"></strong>
        </div>
        <p class="cart-variant"></p>
        <div class="cart-item-controls">
          <div class="cart-stepper" role="group">
            <button type="button" data-cart-action="decrease">−</button>
            <span></span>
            <button type="button" data-cart-action="increase">+</button>
          </div>
          <button type="button" data-cart-action="remove">Remove</button>
        </div>
      </div>
    `;
    const image = row.querySelector("img");
    image.src = `${imageBase}${encodeURIComponent(product.image)}&w=160&fm=webp&q=75`;
    image.addEventListener("error", () => image.removeAttribute("src"), { once: true });
    row.querySelector("h3").textContent = product.name;
    row.querySelector(".cart-variant").textContent = `${item.size} ml · ${currency.format(item.price)} each`;
    row.querySelector(".cart-line-price").textContent = currency.format(item.price * item.quantity);
    const controls = row.querySelector(".cart-item-controls");
    controls.querySelector(".cart-stepper").setAttribute("aria-label", `Quantity of ${product.name}, ${item.size} ml`);
    controls.querySelector("span").textContent = String(item.quantity);
    controls.querySelector('[data-cart-action="decrease"]').disabled = item.quantity === 1;
    for (const button of controls.querySelectorAll("button")) {
      const action = button.dataset.cartAction;
      const label = { decrease: "Decrease quantity of", increase: "Increase quantity of", remove: "Remove" };
      button.setAttribute("aria-label", `${label[action]} ${product.name}, ${item.size} ml`);
      button.addEventListener("click", () => updateItem(item, action));
    }
    return row;
  }

  function render() {
    const quantity = items.reduce((total, item) => total + item.quantity, 0);
    const countLabel = `${quantity} ${quantity === 1 ? "item" : "items"}`;
    if (count.textContent !== countLabel) count.textContent = countLabel;
    empty.hidden = items.length > 0;
    summary.hidden = items.length === 0;
    const scrollTop = body.scrollTop;
    list.replaceChildren(...items.map(renderItem));
    body.scrollTop = scrollTop;
    subtotal.value = currency.format(items.reduce((total, item) => total + item.price * item.quantity, 0));
  }

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // Keep the bag available on this page if storage is unavailable.
    }
    note.textContent = "Preview only. No payment is collected.";
    render();
  }

  function findItem({ id, size }) {
    return items.findIndex((item) => item.id === id && item.size === size);
  }

  function updateItem(item, action) {
    items = readCart();
    const index = findItem(item);
    if (index < 0) {
      render();
      close.focus();
      return;
    }
    if (action === "remove") items.splice(index, 1);
    else items[index].quantity = Math.max(1, items[index].quantity + (action === "increase" ? 1 : -1));
    save();
    const row = list.children[Math.min(index, items.length - 1)];
    const next = action === "remove" ? null : row?.querySelector(`[data-cart-action="${action}"]:enabled`);
    (next ?? row?.querySelector('[data-cart-action="increase"]') ?? browse).focus();
  }

  function openCart() {
    if (!cart.open) cart.showModal();
  }

  window.AKCO.cart = {
    add(entries) {
      items = readCart();
      for (const entry of entries) {
        const index = findItem(entry);
        if (index < 0) items.push(entry);
        else items[index].quantity += entry.quantity;
      }
      save();
      openCart();
    },
  };

  close.addEventListener("click", () => cart.close());
  browse.addEventListener("click", () => cart.close());
  cart.querySelector(".cart-continue").addEventListener("click", () => cart.close());
  cart.addEventListener("click", (event) => {
    if (event.target === cart) cart.close();
  });
  cart.querySelector(".cart-checkout").addEventListener("click", () => {
    note.textContent = "Checkout is a preview. No order has been placed.";
  });
  window.addEventListener("storage", (event) => {
    if (event.key === storageKey || event.key === null) {
      items = readCart();
      render();
      if (cart.open && document.activeElement === document.body) close.focus();
    }
  });
  items = readCart();
  render();
})();
