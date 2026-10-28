const root = document.documentElement;
const themeButton = document.querySelector('#theme-toggle');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-nav');

const updateThemeControl = () => {
  const isDark = root.dataset.theme === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';
  themeButton.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
  themeButton.querySelector('.theme-label').textContent = isDark ? 'Light' : 'Dark';
  themeButton.querySelector('.theme-icon').textContent = isDark ? '☼' : '☾';
  document.querySelector('meta[name="theme-color"]').content = '#071321';
};

updateThemeControl();
themeButton.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = nextTheme;
  localStorage.setItem('portfolio-theme', nextTheme);
  updateThemeControl();
});

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  navigation.classList.toggle('is-open', !isOpen);
});

navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    navigation.classList.remove('is-open');
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    navigation.classList.remove('is-open');
    menuButton.focus();
  }
});

document.querySelector('#current-year').textContent = new Date().getFullYear();

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealElements = document.querySelectorAll(
  '.hero-content, .hero-portrait-wrap, .hero-stats, .about-copy, .about-highlights, .section-heading, .skill-card, .project-card, .career-column, .github-inner, .contact-copy, .contact-form',
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

  revealElements.forEach((element, index) => {
    element.classList.add('reveal-on-scroll');
    element.style.setProperty('--reveal-order', String(index % 4));
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

const githubProfileStatus = document.querySelector('#github-profile-status');
const githubStats = document.querySelector('#github-stats');
const githubRepoStatus = document.querySelector('#github-repo-status');
const githubRepoList = document.querySelector('#github-repo-list');
const githubLanguageStatus = document.querySelector('#github-language-status');
const githubLanguageList = document.querySelector('#github-language-list');

fetch('https://api.github.com/users/sunnyrebel286', {
  headers: { Accept: 'application/vnd.github+json' },
})
  .then((response) => {
    if (!response.ok) throw new Error(`GitHub profile request failed (${response.status})`);
    return response.json();
  })
  .then((profile) => {
    document.querySelector('#github-repos-count').textContent = profile.public_repos;
    document.querySelector('#github-followers-count').textContent = profile.followers;
    document.querySelector('#github-following-count').textContent = profile.following;
    githubStats.hidden = false;
    githubProfileStatus.textContent = '';
  })
  .catch(() => {
    githubProfileStatus.textContent = 'GitHub profile details are temporarily unavailable. Visit the profile directly.';
  });

fetch('https://api.github.com/users/sunnyrebel286/repos?sort=updated&per_page=100', {
  headers: { Accept: 'application/vnd.github+json' },
})
  .then((response) => {
    if (!response.ok) throw new Error(`GitHub repository request failed (${response.status})`);
    return response.json();
  })
  .then((repositories) => {
    const publicRepositories = repositories.filter((repository) => !repository.fork);
    if (publicRepositories.length === 0) {
      githubRepoStatus.textContent = 'No public repositories are available to show.';
      githubLanguageStatus.textContent = 'No public repository language data is available.';
      return;
    }

    githubRepoStatus.textContent = '';
    publicRepositories.slice(0, 3).forEach((repository) => {
      const card = document.createElement('article');
      card.className = 'github-repo-card';

      const title = document.createElement('h4');
      const link = document.createElement('a');
      link.href = repository.html_url;
      link.textContent = repository.name;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      title.append(link);

      const description = document.createElement('p');
      description.textContent = repository.description || 'Public repository by Sani Kumar.';

      const metadata = document.createElement('div');
      metadata.className = 'github-repo-meta';
      if (repository.language) {
        const language = document.createElement('span');
        language.className = 'github-repo-language';
        language.textContent = repository.language;
        metadata.append(language);
      }

      const updated = document.createElement('span');
      updated.textContent = `Updated ${new Date(repository.updated_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}`;
      metadata.append(updated);

      card.append(title, description, metadata);
      githubRepoList.append(card);
    });

    const languageCounts = new Map();
    publicRepositories.forEach((repository) => {
      if (repository.language) {
        languageCounts.set(repository.language, (languageCounts.get(repository.language) || 0) + 1);
      }
    });

    const languageTotal = Array.from(languageCounts.values()).reduce((total, count) => total + count, 0);
    if (languageTotal === 0) {
      githubLanguageStatus.textContent = 'No language data is available for public repositories.';
      return;
    }

    githubLanguageStatus.textContent = 'Share of public repositories by primary language.';
    const languageColors = {
      'C#': '#178600',
      CSS: '#563d7c',
      HTML: '#e34c26',
      Java: '#b07219',
      JavaScript: '#f1e05a',
      Python: '#3572a5',
      TypeScript: '#3178c6',
    };

    Array.from(languageCounts.entries())
      .sort((first, second) => second[1] - first[1])
      .slice(0, 5)
      .forEach(([language, count]) => {
        const percentage = Math.round((count / languageTotal) * 100);
        const row = document.createElement('div');
        row.className = 'github-language-row';

        const heading = document.createElement('div');
        heading.className = 'github-language-heading';

        const name = document.createElement('span');
        name.textContent = language;

        const value = document.createElement('strong');
        value.textContent = `${percentage}%`;
        heading.append(name, value);

        const track = document.createElement('div');
        track.className = 'github-language-bar';
        track.setAttribute('role', 'img');
        track.setAttribute('aria-label', `${language}: ${percentage}% of public repositories`);

        const bar = document.createElement('span');
        bar.style.width = `${percentage}%`;
        bar.style.setProperty('--language-color', languageColors[language] || '#4ad6a0');
        track.append(bar);
        row.append(heading, track);
        githubLanguageList.append(row);
      });
  })
  .catch(() => {
    githubRepoStatus.textContent = 'Recent repositories are temporarily unavailable. Visit GitHub to see them.';
    githubLanguageStatus.textContent = 'Public repository language details are temporarily unavailable.';
  });

const contactForm = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');
const formButton = contactForm.querySelector('button[type="submit"]');
const formEndpoint = contactForm.dataset.endpoint.trim();
const fields = [
  { input: document.querySelector('#contact-name'), error: document.querySelector('#error-name'), label: 'Name' },
  { input: document.querySelector('#contact-email'), error: document.querySelector('#error-email'), label: 'Email' },
  { input: document.querySelector('#contact-subject'), error: document.querySelector('#error-subject'), label: 'Subject' },
  { input: document.querySelector('#contact-message'), error: document.querySelector('#error-message'), label: 'Message' },
];

fields.forEach(({ input, error }) => {
  input.setAttribute('aria-describedby', error.id);
  input.addEventListener('input', () => {
    error.textContent = '';
    input.removeAttribute('aria-invalid');
  });
});

const hasValidEndpoint = /^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/.test(formEndpoint);
formButton.disabled = !hasValidEndpoint;

if (hasValidEndpoint) {
  formStatus.textContent = 'Your message will be sent securely through Formspree.';
}

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!hasValidEndpoint) {
    formStatus.textContent = 'The contact form is not configured yet. Please email me directly.';
    return;
  }

  let isValid = true;
  fields.forEach(({ input, error, label }) => {
    const message = !input.value.trim()
      ? `${label} is required.`
      : input.type === 'email' && !input.validity.valid
        ? 'Enter a valid email address.'
        : '';
    error.textContent = message;
    input.setAttribute('aria-invalid', String(Boolean(message)));
    if (message) isValid = false;
  });

  if (!isValid) {
    fields.find(({ error }) => error.textContent)?.input.focus();
    return;
  }

  formButton.disabled = true;
  formStatus.textContent = 'Sending your message…';

  try {
    const response = await fetch(formEndpoint, {
      method: 'POST',
      body: new FormData(contactForm),
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      formStatus.textContent = 'Your message could not be sent. Please try again or email me directly.';
      return;
    }

    contactForm.reset();
    fields.forEach(({ input }) => input.removeAttribute('aria-invalid'));
    formStatus.textContent = 'Your message was sent. Thank you for getting in touch.';
  } catch {
    formStatus.textContent = 'A network error prevented your message from sending. Please try again or email me directly.';
  } finally {
    formButton.disabled = false;
  }
});
