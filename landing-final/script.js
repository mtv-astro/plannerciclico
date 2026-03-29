const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const faqItems = document.querySelectorAll(".faq details");
faqItems.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    faqItems.forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

const salesCounter = document.querySelector(".sales-counter");
const salesCounterValue = document.querySelector("[data-sales-value]");
const stickyBuyCount = document.querySelector(".sticky-buy-count");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (salesCounter && salesCounterValue) {
  const total = Number(salesCounter.dataset.total || 0);
  const sold = Number(salesCounter.dataset.sold || 0);
  const safeTotal = total > 0 ? total : 1;
  const clampedSold = Math.max(0, Math.min(sold, safeTotal));
  const soldPercent = Math.round((clampedSold / safeTotal) * 100);
  const segmentSize = 360 / safeTotal;
  const segmentGap = Math.min(0.8, segmentSize * 0.22);
  const segmentFill = Math.max(0.6, segmentSize - segmentGap);
  const animationStart = 0;
  const duration = 900;
  const rerunDelay = 9000;

  const setRingFilled = (filledCount) => {
    const filledSegments = [];
    for (let index = 0; index < filledCount; index += 1) {
      const start = index * segmentSize;
      const end = start + segmentFill;
      filledSegments.push(
        `color-mix(in srgb, #d89f2f 96%, white) ${start}deg ${end}deg`,
        `transparent ${end}deg ${(index + 1) * segmentSize}deg`
      );
    }

    salesCounter.style.setProperty(
      "--sales-ring-filled",
      filledSegments.length
        ? `conic-gradient(from 270deg, ${filledSegments.join(", ")})`
        : "none"
    );
  };

  salesCounter.setAttribute(
    "aria-label",
    `${soldPercent} por cento vendidos. Ver oferta.`
  );
  salesCounter.style.setProperty("--sales-segment-size", `${segmentSize}deg`);
  salesCounter.style.setProperty("--sales-segment-fill", `${segmentFill}deg`);

  if (reduceMotion) {
    salesCounterValue.textContent = `${soldPercent}%`;
    setRingFilled(clampedSold);
  } else {
    const runSalesCounterAnimation = () => {
      let startTime = 0;

      const tick = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const currentValue = Math.round(
          animationStart + (soldPercent - animationStart) * progress
        );
        const currentFilled = Math.max(0, Math.min(Math.round((currentValue / 100) * safeTotal), clampedSold));

        salesCounterValue.textContent = `${currentValue}%`;
        setRingFilled(currentFilled);

        if (progress < 1) {
          window.requestAnimationFrame(tick);
        } else {
          salesCounterValue.textContent = `${soldPercent}%`;
          setRingFilled(clampedSold);
          window.setTimeout(runSalesCounterAnimation, rerunDelay);
        }
      };

      salesCounterValue.textContent = `${animationStart}%`;
      setRingFilled(0);
      window.requestAnimationFrame(tick);
    };

    runSalesCounterAnimation();
  }
}

const fitStickyBuyCount = () => {
  if (!stickyBuyCount) return;
  stickyBuyCount.style.fontSize = "";
  const rootFont = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
  let currentFont = parseFloat(window.getComputedStyle(stickyBuyCount).fontSize);
  const minFontRem = 0.52;
  let guard = 0;

  while (stickyBuyCount.scrollWidth > stickyBuyCount.clientWidth && currentFont / rootFont > minFontRem && guard < 20) {
    currentFont -= 0.3;
    stickyBuyCount.style.fontSize = `${(currentFont / rootFont).toFixed(3)}rem`;
    guard += 1;
  }
};

fitStickyBuyCount();
window.addEventListener("resize", fitStickyBuyCount);

const interactiveChecklistItems = document.querySelectorAll(".check-list-interactive li");
if (interactiveChecklistItems.length) {
  interactiveChecklistItems.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      item.classList.add("is-active");
    });

    item.addEventListener("mouseleave", () => {
      item.classList.remove("is-active");
      item.style.removeProperty("--mx");
      item.style.removeProperty("--my");
    });

    item.addEventListener("focus", () => item.classList.add("is-active"));
    item.addEventListener("blur", () => item.classList.remove("is-active"));
    item.addEventListener("click", () => item.classList.toggle("is-active"));

    item.addEventListener("pointermove", (event) => {
      const rect = item.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      item.style.setProperty("--mx", `${x.toFixed(2)}%`);
      item.style.setProperty("--my", `${y.toFixed(2)}%`);
    });
  });
}

const showcasePhoto = document.getElementById("showcase-photo");
const showcaseCards = document.querySelectorAll(".showcase-card");
const showcaseInteractiveCards = Array.from(showcaseCards).filter((card) =>
  card.hasAttribute("data-showcase-image")
);
if (showcasePhoto && showcaseInteractiveCards.length) {
  let showcaseIndex = Math.max(
    0,
    showcaseInteractiveCards.findIndex((card) => card.classList.contains("is-active"))
  );
  let showcaseTimerId = 0;

  const setShowcaseState = (card) => {
    const nextSrc = card.getAttribute("data-showcase-image");
    const nextAlt = card.getAttribute("data-showcase-alt");
    if (!nextSrc) return;

    showcasePhoto.classList.add("is-fading");
    window.setTimeout(() => {
      showcasePhoto.src = nextSrc;
      if (nextAlt) showcasePhoto.alt = nextAlt;
      showcasePhoto.classList.remove("is-fading");
    }, 280);

    showcaseInteractiveCards.forEach((item) => item.classList.toggle("is-active", item === card));
    showcaseIndex = showcaseInteractiveCards.indexOf(card);
  };

  const restartShowcaseTimer = () => {
    if (showcaseTimerId) window.clearInterval(showcaseTimerId);
    if (reduceMotion || showcaseInteractiveCards.length < 2) return;
    showcaseTimerId = window.setInterval(() => {
      showcaseIndex = (showcaseIndex + 1) % showcaseInteractiveCards.length;
      setShowcaseState(showcaseInteractiveCards[showcaseIndex]);
    }, 30000);
  };

  showcaseInteractiveCards.forEach((card) => {
    const activateCard = () => {
      setShowcaseState(card);
      restartShowcaseTimer();
    };

    card.addEventListener("mouseenter", activateCard);
    card.addEventListener("focus", activateCard);
    card.addEventListener("click", activateCard);
  });

  restartShowcaseTimer();
}

const testimonialsCarousel = document.querySelector("[data-testimonials-carousel]");
const testimonialsTrack = document.querySelector("[data-testimonials-track]");
const testimonialPrevButton = document.querySelector("[data-testimonial-prev]");
const testimonialNextButton = document.querySelector("[data-testimonial-next]");
const testimonialSlides = Array.from(document.querySelectorAll(".testimonial-slide"));

if (testimonialsCarousel && testimonialsTrack && testimonialSlides.length) {
  const testimonialsTransition = "transform 420ms var(--ease-standard)";
  const firstClone = testimonialSlides[0].cloneNode(true);
  const lastClone = testimonialSlides[testimonialSlides.length - 1].cloneNode(true);
  testimonialsTrack.insertBefore(lastClone, testimonialsTrack.firstChild);
  testimonialsTrack.appendChild(firstClone);

  const totalTestimonials = testimonialSlides.length;
  let testimonialIndex = 1;
  let testimonialTimerId = 0;
  let isTestimonialsPointerDown = false;
  let isTestimonialsJumping = false;

  const updateTestimonialsLabel = () => {
    const realIndex = ((testimonialIndex - 1 + totalTestimonials) % totalTestimonials) + 1;
    testimonialsCarousel.setAttribute(
      "aria-label",
      `Carrossel de depoimentos. Slide ${realIndex} de ${totalTestimonials}.`
    );
  };

  const renderTestimonialSlide = (index, instant = false) => {
    testimonialIndex = index;
    testimonialsTrack.style.transition = instant ? "none" : testimonialsTransition;
    testimonialsTrack.style.transform = `translateX(-${testimonialIndex * 100}%)`;
    updateTestimonialsLabel();
  };

  const jumpTestimonialsTo = (index) => {
    isTestimonialsJumping = true;
    renderTestimonialSlide(index, true);
    void testimonialsTrack.offsetHeight;
    testimonialsTrack.style.transition = testimonialsTransition;
    isTestimonialsJumping = false;
  };

  const restartTestimonialsTimer = () => {
    if (testimonialTimerId) window.clearInterval(testimonialTimerId);
    if (reduceMotion || totalTestimonials < 2 || isTestimonialsPointerDown) return;
    testimonialTimerId = window.setInterval(() => {
      renderTestimonialSlide(testimonialIndex + 1);
    }, 8000);
  };

  testimonialPrevButton?.addEventListener("click", () => {
    renderTestimonialSlide(testimonialIndex - 1);
    restartTestimonialsTimer();
  });

  testimonialNextButton?.addEventListener("click", () => {
    renderTestimonialSlide(testimonialIndex + 1);
    restartTestimonialsTimer();
  });

  testimonialsCarousel.addEventListener("mouseenter", () => {
    if (testimonialTimerId) window.clearInterval(testimonialTimerId);
  });

  testimonialsCarousel.addEventListener("mouseleave", () => {
    restartTestimonialsTimer();
  });

  const pauseTestimonialsWhilePressed = () => {
    isTestimonialsPointerDown = true;
    if (testimonialTimerId) window.clearInterval(testimonialTimerId);
  };

  const resumeTestimonialsAfterPress = () => {
    if (!isTestimonialsPointerDown) return;
    isTestimonialsPointerDown = false;
    restartTestimonialsTimer();
  };

  testimonialsCarousel.addEventListener("pointerdown", pauseTestimonialsWhilePressed);
  testimonialsCarousel.addEventListener("pointerup", resumeTestimonialsAfterPress);
  testimonialsCarousel.addEventListener("pointercancel", resumeTestimonialsAfterPress);
  testimonialsCarousel.addEventListener("pointerleave", resumeTestimonialsAfterPress);

  testimonialsTrack.addEventListener("transitionend", () => {
    if (isTestimonialsJumping) return;

    if (testimonialIndex === 0) {
      jumpTestimonialsTo(totalTestimonials);
      return;
    }

    if (testimonialIndex === totalTestimonials + 1) {
      jumpTestimonialsTo(1);
    }
  });

  renderTestimonialSlide(1, true);
  void testimonialsTrack.offsetHeight;
  testimonialsTrack.style.transition = testimonialsTransition;
  restartTestimonialsTimer();
}

const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
const isLowPowerViewport = window.innerWidth < 1100;
const progressEl = document.querySelector(".scroll-progress");
const stickyBuy = document.querySelector(".sticky-buy");
const whatsappFloat = document.querySelector(".whatsapp-float");
const investSection = document.getElementById("investimento");
const heroPrimaryCta = document.querySelector(".hero-cta");
let scrollRafId = 0;

const painFlowCards = document.querySelectorAll(".pain-flow-card");
if (painFlowCards.length) {
  const painColumns = document.querySelectorAll(".pain-twoflow .pain-flow-card");
  const leftSteps = painColumns[0]?.querySelectorAll(".pain-step-item") || [];
  const rightSteps = painColumns[1]?.querySelectorAll(".pain-step-item") || [];

  const toggleLinked = (index, active) => {
    const left = leftSteps[index];
    const right = rightSteps[index];
    if (left) left.classList.toggle("is-linked", active);
    if (right) right.classList.toggle("is-linked", active);
  };

  painFlowCards.forEach((card) => {
    const steps = card.querySelectorAll(".pain-step-item");
    steps.forEach((step, index) => {
      step.style.setProperty("--step-delay", `${120 + index * 90}ms`);
      step.addEventListener("mouseenter", () => {
        step.classList.add("is-active");
        toggleLinked(index, true);
      });
      step.addEventListener("mouseleave", () => {
        step.classList.remove("is-active");
        toggleLinked(index, false);
      });
      step.addEventListener("focusin", () => {
        step.classList.add("is-active");
        toggleLinked(index, true);
      });
      step.addEventListener("focusout", () => {
        step.classList.remove("is-active");
        toggleLinked(index, false);
      });
    });
  });

  if (reduceMotion) {
    painFlowCards.forEach((card) => card.classList.add("is-visible"));
  } else {
    const painObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.28 }
    );
    painFlowCards.forEach((card) => painObserver.observe(card));
  }

  if (!isCoarsePointer && !isLowPowerViewport) {
    painFlowCards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--mx", `${x.toFixed(2)}%`);
        card.style.setProperty("--my", `${y.toFixed(2)}%`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.removeProperty("--mx");
        card.style.removeProperty("--my");
      });
    });
  }
}

const plannerMockup = document.querySelector(".planner-image-cover");
const mockupLightbox = document.getElementById("mockup-lightbox");
const legalModal = document.getElementById("legal-modal");
const legalModalFrame = document.getElementById("legal-modal-frame");
const legalModalTitle = document.getElementById("legal-modal-title");
const legalModalClose = document.getElementById("legal-modal-close");
const legalModalLinks = document.querySelectorAll("[data-legal-modal]");
const openMockupLightbox = () => {
  if (!mockupLightbox) return;
  mockupLightbox.hidden = false;
  requestAnimationFrame(() => {
    mockupLightbox.classList.add("is-open");
    mockupLightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  });
};

const closeMockupLightbox = () => {
  if (!mockupLightbox) return;
  mockupLightbox.classList.remove("is-open");
  mockupLightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  window.setTimeout(() => {
    if (!mockupLightbox.classList.contains("is-open")) mockupLightbox.hidden = true;
  }, 260);
};

const openLegalModal = (href, title) => {
  if (!legalModal || !legalModalFrame || !legalModalTitle) return;
  legalModalTitle.textContent = title || "Informações";
  legalModalFrame.src = href;
  legalModal.hidden = false;
  requestAnimationFrame(() => {
    legalModal.classList.add("is-open");
    legalModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("legal-modal-open");
  });
};

const closeLegalModal = () => {
  if (!legalModal || !legalModalFrame) return;
  legalModal.classList.remove("is-open");
  legalModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("legal-modal-open");
  window.setTimeout(() => {
    if (!legalModal.classList.contains("is-open")) {
      legalModal.hidden = true;
      legalModalFrame.src = "about:blank";
    }
  }, 220);
};

if (plannerMockup && mockupLightbox) {
  plannerMockup.addEventListener("click", openMockupLightbox);
  plannerMockup.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openMockupLightbox();
  });

  mockupLightbox.addEventListener("click", (event) => {
    if (event.target !== mockupLightbox) return;
    closeMockupLightbox();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!mockupLightbox.classList.contains("is-open")) return;
    closeMockupLightbox();
  });
}

if (legalModal && legalModalFrame && legalModalLinks.length) {
  legalModalLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      const title = link.getAttribute("data-legal-modal") || link.textContent?.trim() || "Informações";
      if (!href) return;
      event.preventDefault();
      openLegalModal(href, title);
    });
  });

  legalModalClose?.addEventListener("click", closeLegalModal);

  legalModal.addEventListener("click", (event) => {
    if (event.target !== legalModal) return;
    closeLegalModal();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!legalModal.classList.contains("is-open")) return;
    closeLegalModal();
  });
}

const updateScrollUI = () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (progressEl) progressEl.style.width = `${Math.min(100, Math.max(0, progress))}%`;

  if (stickyBuy && investSection) {
    const ctaBottom = heroPrimaryCta?.getBoundingClientRect().bottom ?? Number.POSITIVE_INFINITY;
    const hasPassedHeroCta = ctaBottom < 0;
    const shouldHide = !hasPassedHeroCta;
    stickyBuy.style.opacity = shouldHide ? "0" : "1";
    stickyBuy.style.transform = shouldHide ? "translateY(12px)" : "translateY(0)";
    stickyBuy.style.pointerEvents = shouldHide ? "none" : "auto";

    if (whatsappFloat) {
      whatsappFloat.style.opacity = "1";
      whatsappFloat.style.pointerEvents = "auto";
      whatsappFloat.style.transform = "translateY(0)";
    }
  }
};

window.addEventListener(
  "scroll",
  () => {
    if (scrollRafId) return;
    scrollRafId = requestAnimationFrame(() => {
      updateScrollUI();
      scrollRafId = 0;
    });
  },
  { passive: true }
);
window.addEventListener("resize", updateScrollUI);
updateScrollUI();

const zodiacSteps = document.querySelectorAll(".zodiac-step");
if (zodiacSteps.length) {
  zodiacSteps.forEach((step) => {
    step.addEventListener("click", () => {
      const targetId = step.dataset.target;
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const zodiacObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute("id");
        zodiacSteps.forEach((step) => {
          step.classList.toggle("is-active", step.dataset.target === id);
        });
      });
    },
    { threshold: 0.5 }
  );

  zodiacSteps.forEach((step) => {
    const sectionId = step.dataset.target;
    if (!sectionId) return;
    const section = document.getElementById(sectionId);
    if (section) zodiacObserver.observe(section);
  });
}

if (!reduceMotion) {
  const revealTargets = document.querySelectorAll(".section .container, .offer-box, .hero");
  revealTargets.forEach((target) => target.classList.add("reveal"));

  const staggerTargets = document.querySelectorAll(
    ".cards, .showcase-copy, .offer-badges"
  );
  staggerTargets.forEach((group) => {
    group.classList.add("stagger");
    group.classList.add("reveal");
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("reveal-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  revealTargets.forEach((target) => observer.observe(target));
  staggerTargets.forEach((target) => observer.observe(target));

  const heroVisual = document.querySelector(".hero-visual");
  const parallaxItems = document.querySelectorAll(".parallax-item");

  if (heroVisual && parallaxItems.length && !isCoarsePointer && !isLowPowerViewport) {
    const updateParallax = (xRatio, yRatio) => {
      parallaxItems.forEach((item) => {
        const depth = Number(item.getAttribute("data-depth") || 0.1);
        const offsetX = xRatio * 28 * depth;
        const offsetY = yRatio * 28 * depth;
        item.style.setProperty("--px", `${offsetX}px`);
        item.style.setProperty("--py", `${offsetY}px`);
      });
    };

    let parallaxRafId = 0;
    let nextParallaxX = 0;
    let nextParallaxY = 0;

    heroVisual.addEventListener("pointermove", (event) => {
      const rect = heroVisual.getBoundingClientRect();
      nextParallaxX = (event.clientX - rect.left) / rect.width - 0.5;
      nextParallaxY = (event.clientY - rect.top) / rect.height - 0.5;
      if (parallaxRafId) return;
      parallaxRafId = requestAnimationFrame(() => {
        updateParallax(nextParallaxX, nextParallaxY);
        parallaxRafId = 0;
      });
    });

    heroVisual.addEventListener("pointerleave", () => {
      parallaxItems.forEach((item) => {
        item.style.removeProperty("--px");
        item.style.removeProperty("--py");
      });
    });
  }

  const cursorGlow = document.querySelector(".cursor-glow");
  const cursorDot = document.querySelector(".cursor-dot");
  if (cursorGlow && cursorDot && !isCoarsePointer && !isLowPowerViewport) {
    let mouseX = 0;
    let mouseY = 0;
    let glowX = 0;
    let glowY = 0;
    let cursorVisible = false;

    window.addEventListener("pointermove", (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      cursorDot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
      if (!cursorVisible) {
        cursorDot.style.opacity = "1";
        cursorGlow.style.opacity = "1";
        cursorVisible = true;
      }
    });

    const animateCursor = () => {
      glowX += (mouseX - glowX) * 0.15;
      glowY += (mouseY - glowY) * 0.15;
      cursorGlow.style.transform = `translate(${glowX - 21}px, ${glowY - 21}px)`;
      requestAnimationFrame(animateCursor);
    };
    animateCursor();
  }

  const magneticButtons = document.querySelectorAll(".magnetic");
  if (!isCoarsePointer) {
    magneticButtons.forEach((button) => {
      let magneticRafId = 0;
      let targetX = 0;
      let targetY = 0;

      button.addEventListener("pointermove", (event) => {
        const rect = button.getBoundingClientRect();
        targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 9;
        targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 9;
        if (magneticRafId) return;
        magneticRafId = requestAnimationFrame(() => {
          button.style.transform = `translate(${targetX}px, ${targetY}px)`;
          magneticRafId = 0;
        });
      });

      button.addEventListener("pointerleave", () => {
        button.style.transform = "";
      });
    });
  }

  const tiltTargets = document.querySelectorAll(".tilt");
  if (!isCoarsePointer && !isLowPowerViewport) {
    tiltTargets.forEach((element) => {
      let tiltRafId = 0;
      let tiltX = 0;
      let tiltY = 0;

      element.addEventListener("pointermove", (event) => {
        const rect = element.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        tiltX = (0.5 - py) * 5;
        tiltY = (px - 0.5) * 5;
        if (tiltRafId) return;
        tiltRafId = requestAnimationFrame(() => {
          element.style.transform = `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-2px)`;
          tiltRafId = 0;
        });
      });

      element.addEventListener("pointerleave", () => {
        element.style.transform = "";
      });
    });
  }
}
