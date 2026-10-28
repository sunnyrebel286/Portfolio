const themeButton = document.querySelector('#theme');
const menuButton = document.querySelector('.menu-btn');
const navigation = document.querySelector('#links');

const setThemeLabel = () => {
  const dark = document.documentElement.dataset.theme === 'dark';
  themeButton.textContent = dark ? 'Light theme' : 'Dark theme';
  themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} colour theme`);
};

setThemeLabel();
themeButton.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem('portfolio-theme', nextTheme);
  setThemeLabel();
});

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
  navigation.classList.toggle('is-open', !isOpen);
});

navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation menu');
    navigation.classList.remove('is-open');
  }
});

document.querySelector('#year').textContent = new Date().getFullYear();

const resumeLink = document.querySelector('#resume-link');
fetch(resumeLink.href, { method: 'HEAD' })
  .then((response) => {
    resumeLink.hidden = !response.ok;
  })
  .catch(() => {
    resumeLink.hidden = true;
  });

document.querySelector('.photo').addEventListener('error', (event) => {
  event.currentTarget.hidden = true;
  document.querySelector('.visual').classList.add('visual--no-photo');
});

const githubStatus = document.querySelector('#gh-status');
const githubList = document.querySelector('#gh-list');

fetch('https://api.github.com/users/sunnyrebel286/repos?sort=updated&per_page=6')
  .then((response) => {
    if (!response.ok) throw new Error('Repository request failed');
    return response.json();
  })
  .then((repositories) => {
    const visibleRepositories = repositories.filter((repository) => !repository.fork);
    if (visibleRepositories.length === 0) {
      githubStatus.textContent = 'No public repositories to show yet.';
      return;
    }

    githubStatus.textContent = '';
    visibleRepositories.forEach((repository) => {
      const card = document.createElement('article');
      card.className = 'card repo';

      const title = document.createElement('h3');
      const link = document.createElement('a');
      link.href = repository.html_url;
      link.textContent = repository.name;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      title.append(link);

      const description = document.createElement('p');
      description.textContent = repository.description || 'No description provided.';

      const details = document.createElement('div');
      details.className = 'repo-meta';
      const language = document.createElement('span');
      language.textContent = repository.language || 'Code';
      const stars = document.createElement('span');
      stars.textContent = `★ ${repository.stargazers_count}`;
      details.append(language, stars);

      card.append(title, description, details);
      githubList.append(card);
    });
  })
  .catch(() => {
    githubStatus.textContent = 'GitHub repositories could not be loaded right now.';
  });

const contactForm = document.querySelector('#form');
const fields = [
  { input: document.querySelector('#name'), error: document.querySelector('#e-name'), label: 'Name' },
  { input: document.querySelector('#email'), error: document.querySelector('#e-email'), label: 'Email' },
  { input: document.querySelector('#msg'), error: document.querySelector('#e-msg'), label: 'Message' },
];

contactForm.addEventListener('submit', (event) => {
  event.preventDefault();
  let isValid = true;

  fields.forEach(({ input, error, label }) => {
    const isEmailInvalid = input.type === 'email' && input.value.trim() && !input.validity.valid;
    const message = !input.value.trim()
      ? `${label} is required.`
      : isEmailInvalid
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

  const subject = `Portfolio message from ${fields[0].input.value.trim()}`;
  const body = `${fields[2].input.value.trim()}\n\nFrom: ${fields[0].input.value.trim()} (${fields[1].input.value.trim()})`;
  window.location.href = `mailto:sunnyrebel286@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
