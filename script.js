const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('#mobile-menu');

if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
    mobileMenu.hidden = isOpen;
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Abrir menu');
      mobileMenu.hidden = true;
    });
  });
}

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

// Analytics: ponto único para eventos futuros. Só envia se um dataLayer (ex.: GTM) já existir na página.
function trackEvent(name, detail = {}) {
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: name, ...detail });
  }
}

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-event]');
  if (!target) return;
  trackEvent(target.dataset.event, { label: target.textContent.trim() });
  if (target.classList.contains('checkout-button')) {
    trackEvent('checkout_started', { plan: target.dataset.plan });
  }
});

document.querySelectorAll('.faq-list details').forEach((item) => {
  item.addEventListener('toggle', () => {
    if (item.open) trackEvent('faq_open', { question: item.querySelector('summary').textContent.replace('+', '').trim() });
  });
});

// Demonstração: usa /assets/demo/demo-wephotly.mp4 quando existir; caso contrário, mantém o mockup animado.
const demoFrame = document.querySelector('[data-demo]');
if (demoFrame) {
  const video = demoFrame.querySelector('.demo-video');
  const playButton = demoFrame.querySelector('.demo-play');
  const toggleButton = demoFrame.querySelector('.demo-toggle');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let hasVideo = false;

  const setPlaying = (isPlaying) => {
    demoFrame.classList.toggle('is-playing', isPlaying);
    toggleButton.setAttribute('aria-label', isPlaying ? 'Pausar demonstração' : 'Reproduzir demonstração');
  };

  const enableVideo = () => {
    if (hasVideo) return;
    hasVideo = true;
    video.hidden = false;
    toggleButton.hidden = false;
    demoFrame.classList.add('has-video');
    if (prefersReducedMotion) {
      video.pause();
    } else if (video.paused) {
      video.play().catch(() => setPlaying(false));
    } else {
      setPlaying(true);
    }
  };

  const togglePlayback = () => {
    if (!hasVideo) {
      setPlaying(true);
      return;
    }
    if (video.paused) {
      video.play().catch(() => setPlaying(false));
    } else {
      video.pause();
    }
  };

  const poster = new Image();
  poster.onload = () => { video.poster = poster.src; };
  poster.src = '/assets/demo/demo-wephotly-poster.jpg';

  video.addEventListener('loadedmetadata', enableVideo);
  video.addEventListener('playing', () => setPlaying(true));
  video.addEventListener('pause', () => setPlaying(false));
  video.addEventListener('click', togglePlayback);
  playButton.addEventListener('click', togglePlayback);
  toggleButton.addEventListener('click', togglePlayback);

  if (video.readyState >= 1) enableVideo();
}
