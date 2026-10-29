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
  document.querySelector('meta[name="theme-color"]').content = isDark ? '#0B1728' : '#F4F7FC';
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
  if (event.target.closest('a')) closeNavigation();
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

const projectFilterButtons = Array.from(document.querySelectorAll('[data-project-filter]'));
const moreProjectCards = Array.from(document.querySelectorAll('#more-projects [data-project-category]'));
const projectFilterStatus = document.querySelector('#project-filter-status');
const projectFilterLabels = new Map([
  ['web', 'web'],
  ['prototype', 'prototype'],
  ['portfolio', 'portfolio'],
]);

const updateProjectFilter = (category) => {
  const isAll = category === 'all';
  const visibleCount = moreProjectCards.reduce((count, card) => {
    const isVisible = isAll || card.dataset.projectCategory === category;
    card.hidden = !isVisible;
    return count + Number(isVisible);
  }, 0);

  projectFilterButtons.forEach((button) => {
    const isActive = button.dataset.projectFilter === category;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  const categoryLabel = projectFilterLabels.get(category);
  projectFilterStatus.textContent = isAll
    ? `Showing all ${visibleCount} projects.`
    : `Showing ${visibleCount} ${categoryLabel} project${visibleCount === 1 ? '' : 's'}.`;
};

projectFilterButtons.forEach((button) => {
  button.addEventListener('click', () => updateProjectFilter(button.dataset.projectFilter));
});

const githubProfileStatus = document.querySelector('#github-profile-status');
const githubStats = document.querySelector('#github-stats');
const githubRepoStatus = document.querySelector('#github-repo-status');
const githubRepoList = document.querySelector('#github-repo-list');
const githubLanguageStatus = document.querySelector('#github-language-status');
const githubLanguageList = document.querySelector('#github-language-list');

class GitHubApiError extends Error {
  constructor(resource, response) {
    const rateLimited = response.status === 429
      || (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0');
    super(`GitHub ${resource} request failed (${response.status}).`);
    this.name = 'GitHubApiError';
    this.rateLimited = rateLimited;
  }
}

const requireGitHubSuccess = (response, resource) => {
  if (!response.ok) throw new GitHubApiError(resource, response);
  return response;
};

fetch('https://api.github.com/users/sunnyrebel286', {
  headers: { Accept: 'application/vnd.github+json' },
})
  .then((response) => requireGitHubSuccess(response, 'profile').json())
  .then((profile) => {
    document.querySelector('#github-repos-count').textContent = profile.public_repos;
    document.querySelector('#github-followers-count').textContent = profile.followers;
    document.querySelector('#github-following-count').textContent = profile.following;
    githubStats.hidden = false;
    githubProfileStatus.textContent = '';
  })
  .catch((error) => {
    githubProfileStatus.textContent = error instanceof GitHubApiError && error.rateLimited
      ? 'GitHub API rate limit reached. Try again later or visit the profile directly.'
      : 'GitHub profile details are temporarily unavailable. Visit the profile directly.';
  });

fetch('https://api.github.com/users/sunnyrebel286/repos?sort=updated&per_page=100', {
  headers: { Accept: 'application/vnd.github+json' },
})
  .then((response) => requireGitHubSuccess(response, 'repositories').json())
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

      if (Number.isFinite(repository.stargazers_count)) {
        const stars = document.createElement('span');
        stars.textContent = `Stars ${repository.stargazers_count.toLocaleString()}`;
        metadata.append(stars);
      }

      if (Number.isFinite(repository.forks_count)) {
        const forks = document.createElement('span');
        forks.textContent = `Forks ${repository.forks_count.toLocaleString()}`;
        metadata.append(forks);
      }

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
  .catch((error) => {
    const isRateLimited = error instanceof GitHubApiError && error.rateLimited;
    githubRepoStatus.textContent = isRateLimited
      ? 'GitHub API rate limit reached. Try again later or view repositories on GitHub.'
      : 'Recent repositories are temporarily unavailable. Visit GitHub to see them.';
    githubLanguageStatus.textContent = isRateLimited
      ? 'Language details are unavailable until the GitHub API limit resets.'
      : 'Public repository language details are temporarily unavailable.';
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
