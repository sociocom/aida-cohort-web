(() => {
  const header = document.querySelector(".site-header");
  const navLinks = Array.from(document.querySelectorAll('.nav-list a[href^="#"]'));
  const navToggle = document.querySelector(".nav-toggle");
  const currentLabel = document.querySelector(".nav-current");
  const compactNavigation = window.matchMedia("(max-width: 1060px)");

  if (!header || navLinks.length === 0) {
    return;
  }

  const trackedSections = navLinks
    .map((link) => ({
      link,
      section: document.querySelector(link.hash),
    }))
    .filter(({ section }) => section);

  let activeLink = null;
  let animationFrame = null;

  const setMenuOpen = (open, restoreFocus = false) => {
    header.classList.toggle("is-menu-open", open);
    navToggle?.setAttribute("aria-expanded", String(open));
    if (restoreFocus) {
      navToggle?.focus({ preventScroll: true });
    }
  };

  if (navToggle) {
    header.classList.add("navigation-ready");
    navToggle.addEventListener("click", () => {
      setMenuOpen(navToggle.getAttribute("aria-expanded") !== "true");
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (!compactNavigation.matches || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      setMenuOpen(false);
      const section = document.querySelector(link.hash);
      const heading = section?.querySelector("h2");
      if (heading) {
        // Native fragment navigation runs first; focus then follows the reader.
        window.requestAnimationFrame(() => {
          heading.setAttribute("tabindex", "-1");
          heading.focus({ preventScroll: true });
          heading.addEventListener("blur", () => heading.removeAttribute("tabindex"), { once: true });
        });
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("is-menu-open")) {
      setMenuOpen(false, true);
    }
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) setMenuOpen(false);
  });

  header.addEventListener("focusout", (event) => {
    if (!header.contains(event.relatedTarget)) setMenuOpen(false);
  });

  compactNavigation.addEventListener("change", () => {
    const focusWillBeHidden = compactNavigation.matches
      ? document.querySelector(".primary-nav")?.contains(document.activeElement)
      : document.activeElement === navToggle;
    setMenuOpen(false, focusWillBeHidden && compactNavigation.matches);
    if (focusWillBeHidden && !compactNavigation.matches) {
      (activeLink ?? navLinks[0]).focus({ preventScroll: true });
    }
  });

  const setActiveLink = (nextLink) => {
    if (nextLink === activeLink) {
      return;
    }

    trackedSections.forEach(({ link }) => {
      if (link === nextLink) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    activeLink = nextLink;
  };

  const updateActiveSection = () => {
    animationFrame = null;

    const headerBottom = Math.max(0, header.getBoundingClientRect().bottom);
    const visibleHeight = Math.max(0, window.innerHeight - headerBottom);
    const readingLine = headerBottom + Math.min(visibleHeight * 0.28, 160);
    const current = trackedSections.findLast(({ section }) => {
      const bounds = section.getBoundingClientRect();
      return bounds.top <= readingLine;
    });

    setActiveLink(current?.link ?? null);
    const label = current?.link.textContent ?? "研究の概要";
    if (currentLabel && currentLabel.textContent !== label) currentLabel.textContent = label;
  };

  const scheduleUpdate = () => {
    if (animationFrame === null) {
      animationFrame = window.requestAnimationFrame(updateActiveSection);
    }
  };

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("hashchange", scheduleUpdate);
  window.addEventListener("load", scheduleUpdate, { once: true });

  // Keep anchor destinations clear of the header, including after text resizing.
  if ("ResizeObserver" in window) {
    new ResizeObserver(() => {
      document.documentElement.style.setProperty("--header-height", `${header.offsetHeight}px`);
      scheduleUpdate();
    }).observe(header);
  }

  document.querySelectorAll("details").forEach((details) => {
    details.addEventListener("toggle", scheduleUpdate);
  });

  updateActiveSection();
})();
