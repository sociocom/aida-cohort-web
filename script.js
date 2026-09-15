(() => {
  const header = document.querySelector(".site-header");
  const navLinks = Array.from(document.querySelectorAll('.nav-list a[href^="#"]'));

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
    const current = trackedSections.find(({ section }) => {
      const bounds = section.getBoundingClientRect();
      return bounds.top <= readingLine && bounds.bottom > readingLine;
    });

    setActiveLink(current?.link ?? null);
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

  updateActiveSection();
})();
