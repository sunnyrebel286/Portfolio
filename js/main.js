const root = document.documentElement;
const themeButton = document.querySelector('#theme-toggle');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-nav');
const systemThemePreference = window.matchMedia('(prefers-color-scheme: dark)');

const updateThemeControl = () => {
  const isDark = root.dataset.theme === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';
  themeButton.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
  themeButton.querySelector('.theme-label').textContent = isDark ? 'Light' : 'Dark';
  themeButton.querySelector('.theme-icon').textContent = isDark ? '☼' : '☾';
  document.querySelector('meta[name="theme-color"]').content = isDark ? '#0B1020' : '#F7F7F4';
};

const savedTheme = localStorage.getItem('portfolio-theme');
let hasSavedTheme = savedTheme === 'dark' || savedTheme === 'light';
const applyTheme = (theme) => {
  root.dataset.theme = theme;
  updateThemeControl();
};

if (!hasSavedTheme) {
  applyTheme(systemThemePreference.matches ? 'dark' : 'light');
}

updateThemeControl();
themeButton.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('portfolio-theme', nextTheme);
  hasSavedTheme = true;
  applyTheme(nextTheme);
});

systemThemePreference.addEventListener('change', (event) => {
  if (!hasSavedTheme) applyTheme(event.matches ? 'dark' : 'light');
});

const closeNavigation = () => {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  navigation.classList.remove('is-open');
};

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  if (isOpen) {
    closeNavigation();
    return;
  }
  menuButton.setAttribute('aria-expanded', 'true');
  menuButton.setAttribute('aria-label', 'Close navigation');
  navigation.classList.add('is-open');
});

navigation.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link) return;

  const wasOpen = menuButton.getAttribute('aria-expanded') === 'true';
  closeNavigation();
  if (wasOpen && event.detail === 0) menuButton.focus();
});

document.addEventListener('pointerdown', (event) => {
  if (menuButton.getAttribute('aria-expanded') === 'true'
      && !navigation.contains(event.target)
      && !menuButton.contains(event.target)) {
    closeNavigation();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeNavigation();
    menuButton.focus();
  }
});

window.matchMedia('(min-width: 861px)').addEventListener('change', (event) => {
  if (event.matches) closeNavigation();
});

document.querySelector('#current-year').textContent = new Date().getFullYear();

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealElements = document.querySelectorAll(
  '.hero-portrait-wrap, .about-intro, .section-heading, .section-heading-row > div',
);

if ('IntersectionObserver' in window && !prefersReducedMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });

  revealElements.forEach((element) => {
    element.classList.add('reveal-on-scroll');
    revealObserver.observe(element);
  });
}

if ('IntersectionObserver' in window) {
  const sectionLinks = new Map(
    Array.from(navigation.querySelectorAll('a[href^="#"]'))
      .map((link) => [document.querySelector(link.getAttribute('href')), link])
      .filter(([section]) => section),
  );
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        sectionLinks.forEach((link) => link.removeAttribute('aria-current'));
        sectionLinks.get(entry.target)?.setAttribute('aria-current', 'location');
      }
    });
  }, { rootMargin: '-22% 0px -68% 0px' });

  sectionLinks.forEach((_, section) => sectionObserver.observe(section));
}
