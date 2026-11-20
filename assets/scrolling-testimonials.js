(() => {
  if (customElements.get("akco-testimonials")) return;

  const wrap = (value, length) => ((value % length) + length) % length;

  class Testimonials extends HTMLElement {
    connectedCallback() {
      const viewport = this.querySelector(".akco-testimonials-viewport");
      if (!viewport || this.cleanup) return;

      const track = this.querySelector(".akco-testimonials-track");
      const group = this.querySelector(".akco-testimonials-group");
      const controller = new AbortController();
      const { signal } = controller;
      const motion = matchMedia("(prefers-reduced-motion: reduce)");
      const editing = Boolean(window.Shopify?.designMode);
      let duplicates = [];
      let slots = [];
      let width = 0;
      let limit = 0;
      let period = 0;
      let position = 0;
      let lastTime = 0;
      let frame = 0;
      let startTimer;
      let started = false;
      let visible = false;
      let hoveringCard = false;
      let drag = null;

      function draw() {
        if (!viewport.hasAttribute("data-wave")) return;

        const center = viewport.scrollLeft + width / 2;
        for (const { slot, midpoint } of slots) {
          const distance = Math.min(1, Math.abs(center - midpoint) / (width / 2));
          const drop = (1 - Math.cos(distance * Math.PI / 2)).toFixed(3);
          if (slot.style.getPropertyValue("--testimonial-y") !== drop) {
            slot.style.setProperty("--testimonial-y", drop);
          }
        }
      }

      function tick(time) {
        const elapsed = lastTime ? Math.min(time - lastTime, 48) : 0;
        lastTime = time;
        position = period + wrap(position - period + elapsed * .032, period);
        viewport.scrollLeft = position;
        frame = requestAnimationFrame(tick);
      }

      function syncMotion() {
        const playing = period && visible && !document.hidden && !hoveringCard && !viewport.hasAttribute("data-dragging") && !viewport.matches(":focus-visible");
        if (frame && (!playing || !started)) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
        if (!playing) {
          clearTimeout(startTimer);
          startTimer = undefined;
        } else if (!started) {
          startTimer ??= setTimeout(() => {
            startTimer = undefined;
            started = true;
            syncMotion();
          }, 2000);
          return;
        }
        if (playing && !frame) {
          position = period + wrap(viewport.scrollLeft, period);
          viewport.scrollLeft = position;
          lastTime = 0;
          frame = requestAnimationFrame(tick);
        }
      }

      function pause() {
        clearTimeout(startTimer);
        startTimer = undefined;
        started = false;
        syncMotion();
      }

      function trackPointer(event) {
        if (event.pointerType !== "mouse" || event.buttons || motion.matches) return;
        const slot = event.target.closest(".akco-testimonials-slot");
        if (!slot) return;

        const bounds = slot.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
        const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
        slot.style.setProperty("--testimonial-shine-x", `${x * 100}%`);
        slot.style.setProperty("--testimonial-shine-y", `${y * 100}%`);
        slot.style.setProperty("--testimonial-tilt-x", `${(0.5 - y) * 14}deg`);
        slot.style.setProperty("--testimonial-tilt-y", `${(x - 0.5) * 18}deg`);
      }

      function layout() {
        const oldPeriod = period;
        const offset = oldPeriod ? wrap(viewport.scrollLeft, oldPeriod) : viewport.scrollLeft;
        width = viewport.clientWidth;
        const wave = !motion.matches && !editing;
        const groupWidth = group.getBoundingClientRect().width;
        const gap = parseFloat(getComputedStyle(track).columnGap);
        period = wave && group.children.length > 1 && width > 0 && groupWidth >= width ? groupWidth + gap : 0;

        if (period && !duplicates.length) {
          const first = group.cloneNode(true);
          const last = group.cloneNode(true);
          duplicates = [first, last];
          for (const duplicate of duplicates) duplicate.setAttribute("aria-hidden", "true");
          group.before(first);
          group.after(last);
        } else if (!period && duplicates.length) {
          for (const duplicate of duplicates) duplicate.remove();
          duplicates = [];
        }

        limit = viewport.scrollWidth - width;
        slots = Array.from(track.querySelectorAll(".akco-testimonials-slot"), (slot) => ({
          slot,
          midpoint: slot.offsetLeft + slot.offsetWidth / 2,
        }));
        const scrollable = limit > 1;
        viewport.toggleAttribute("data-wave", wave && scrollable);
        viewport.toggleAttribute("data-scrollable", scrollable);
        viewport.tabIndex = scrollable ? 0 : -1;

        if (oldPeriod !== period) {
          position = period ? period + wrap(offset, period) : offset;
          viewport.scrollLeft = position;
        }
        draw();
        syncMotion();
      }

      function move(direction) {
        pause();
        const offset = period ? period + wrap(viewport.scrollLeft, period) : viewport.scrollLeft;
        const center = offset + width / 2;
        let closest = 0;
        for (let index = 1; index < slots.length; index++) {
          if (Math.abs(slots[index].midpoint - center) < Math.abs(slots[closest].midpoint - center)) closest = index;
        }
        const target = slots[closest + direction];
        const destination = target ? target.midpoint - width / 2 : direction < 0 ? 0 : limit;
        viewport.scrollLeft = offset;
        viewport.scrollTo({ left: destination, behavior: motion.matches || editing ? "instant" : "smooth" });
      }

      viewport.addEventListener("scroll", draw, { passive: true, signal });
      viewport.addEventListener("focus", syncMotion, { signal });
      viewport.addEventListener("blur", syncMotion, { signal });
      viewport.addEventListener("pointerover", (event) => {
        if (event.pointerType !== "mouse") return;
        hoveringCard = Boolean(event.target.closest(".akco-testimonials-slot"));
        syncMotion();
        trackPointer(event);
      }, { passive: true, signal });
      viewport.addEventListener("pointerout", (event) => {
        if (event.pointerType !== "mouse" || event.relatedTarget?.closest?.(".akco-testimonials-slot")) return;
        hoveringCard = false;
        syncMotion();
      }, { passive: true, signal });
      viewport.addEventListener("pointermove", trackPointer, { passive: true, signal });
      viewport.addEventListener("wheel", (event) => {
        if (event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) pause();
      }, { passive: true, signal });
      viewport.addEventListener("keydown", (event) => {
        if (!limit || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
        event.preventDefault();
        move(event.key === "ArrowLeft" ? -1 : 1);
      }, { signal });

      viewport.addEventListener("pointerdown", (event) => {
        if (!limit) return;
        if (event.pointerType !== "mouse") {
          pause();
        } else if (event.button === 0) {
          drag = { origin: event.clientX, start: viewport.scrollLeft };
        }
      }, { signal });
      viewport.addEventListener("pointermove", (event) => {
        if (!drag || event.pointerType !== "mouse" || !(event.buttons & 1)) return;
        const delta = event.clientX - drag.origin;
        if (!viewport.hasPointerCapture(event.pointerId)) {
          if (Math.abs(delta) < 6) return;
          viewport.setPointerCapture(event.pointerId);
          viewport.setAttribute("data-dragging", "");
          pause();
        }
        event.preventDefault();
        viewport.scrollLeft = drag.start - delta;
      }, { signal });
      viewport.addEventListener("dragstart", (event) => event.preventDefault(), { signal });
      for (const name of ["pointerup", "pointercancel", "lostpointercapture"]) {
        viewport.addEventListener(name, () => {
          drag = null;
          viewport.removeAttribute("data-dragging");
          syncMotion();
        }, { signal });
      }

      if (editing) {
        this.addEventListener("shopify:block:select", (event) => {
          const slot = event.target.closest(".akco-testimonials-slot");
          if (slot) viewport.scrollLeft = slot.offsetLeft - (width - slot.offsetWidth) / 2;
        }, { signal });
      }

      document.addEventListener("visibilitychange", syncMotion, { signal });
      motion.addEventListener("change", layout, { signal });
      const resize = new ResizeObserver(layout);
      resize.observe(group);
      resize.observe(viewport);
      const entry = new IntersectionObserver(([item]) => {
        visible = item.isIntersecting;
        syncMotion();
      });
      entry.observe(viewport);
      layout();

      this.cleanup = () => {
        controller.abort();
        resize.disconnect();
        entry.disconnect();
        clearTimeout(startTimer);
        cancelAnimationFrame(frame);
        for (const duplicate of duplicates) duplicate.remove();
      };
    }

    disconnectedCallback() {
      this.cleanup?.();
      this.cleanup = null;
    }
  }

  customElements.define("akco-testimonials", Testimonials);
})();
