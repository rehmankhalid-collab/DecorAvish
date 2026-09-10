document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('navToggle');
const body = document.body;

navToggle.addEventListener('click', () => {
  const isOpen = body.classList.toggle('nav-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.main-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    body.classList.remove('nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Artwork carousel ---------- */
(function initCarousel() {
  const track = document.getElementById('carouselTrack');
  const dotsWrap = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  if (!track) return;

  const slides = Array.from(track.children);
  let activeIndex = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', `Go to artwork ${i + 1}`);
    dot.addEventListener('click', () => scrollToSlide(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function scrollToSlide(i) {
    const clamped = Math.max(0, Math.min(slides.length - 1, i));
    slides[clamped].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  }

  prevBtn.addEventListener('click', () => scrollToSlide(activeIndex - 1));
  nextBtn.addEventListener('click', () => scrollToSlide(activeIndex + 1));

  const slideObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          activeIndex = slides.indexOf(entry.target);
          dots.forEach((d, di) => d.classList.toggle('is-active', di === activeIndex));
        }
      });
    },
    { root: track, threshold: [0.6] }
  );
  slides.forEach((s) => slideObserver.observe(s));

  let autoplayTimer = null;
  function startAutoplay() {
    if (prefersReducedMotion) return;
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      const next = (activeIndex + 1) % slides.length;
      scrollToSlide(next);
    }, 4500);
  }
  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  track.addEventListener('pointerenter', stopAutoplay);
  track.addEventListener('pointerleave', startAutoplay);
  track.addEventListener('touchstart', stopAutoplay, { passive: true });

  startAutoplay();
})();

/* ---------- Wall Lab: scroll-driven wall styling preview ---------- */
(function initWallLab() {
  const steps = Array.from(document.querySelectorAll('.wall-step'));
  const frame = document.getElementById('wallFrame');
  if (!steps.length || !frame) return;

  const layers = Array.from(frame.querySelectorAll('.wall-photo'));
  const colorNameEl = document.getElementById('wallColorName');
  const pieceNameEl = document.getElementById('wallPieceName');
  let topLayerIndex = 0;

  function activateStep(step) {
    steps.forEach((s) => s.classList.toggle('is-active', s === step));

    const color = step.dataset.color;
    const photo = step.dataset.photo;
    const name = step.dataset.name;
    const piece = step.dataset.piece;

    frame.style.backgroundColor = color;
    colorNameEl.textContent = name;
    pieceNameEl.textContent = piece;

    const showLayer = layers[topLayerIndex];
    const hideLayer = layers[1 - topLayerIndex];

    if (showLayer.src.endsWith(photo)) {
      showLayer.classList.add('is-visible');
      hideLayer.classList.remove('is-visible');
      return;
    }

    showLayer.onload = () => {
      showLayer.classList.add('is-visible');
      hideLayer.classList.remove('is-visible');
    };
    showLayer.onerror = () => {
      showLayer.classList.remove('is-visible');
    };
    showLayer.src = photo;
    topLayerIndex = 1 - topLayerIndex;
  }

  const wallObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) activateStep(entry.target);
      });
    },
    { root: null, rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );
  steps.forEach((step) => wallObserver.observe(step));

  activateStep(steps[0]);
})();
