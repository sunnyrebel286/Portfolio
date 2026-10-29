# Sani Kumar Portfolio

A responsive static developer portfolio built with HTML5, CSS3 and vanilla JavaScript. No build step or runtime dependency is required. The profile photo and resume are stored in the repository.

## Run locally

Open `index.html` in a browser or serve the repository root with VS Code Live Server or `python -m http.server 8000`. No package installation or build step is required.

## Project structure

```text
.
├── .github/workflows/pages.yml  # GitHub Pages deployment workflow
├── assets/images/profile.jpg    # Profile portrait
├── css/style.css                # Design tokens, layouts, and responsive styles
├── js/main.js                   # Page interactions and integrations
├── js/theme-init.js             # Early theme selection to reduce theme flash
├── index.html                   # Portfolio page
├── Sani kumar Resume.pdf        # Downloadable resume
├── robots.txt
└── sitemap.xml
```

CSS custom properties in `css/style.css` define the warm-paper, midnight, cobalt, ice-blue, and restrained warm-accent palette, plus typography, spacing, containers, focus rings, radii, shadows, layering, and motion. Inter is used for interface/body text, with DM Serif Display reserved for editorial headings. Shared media-frame utilities provide portrait and landscape aspect ratios. The existing responsive breakpoints are 1100px, 860px, 760px, 640px, and 520px, with a 1440px wide-screen adjustment.

## Features

- Responsive layout inspired by the supplied portfolio reference, with dark and light themes.
- Accessible navigation, keyboard focus states, reduced-motion support, and a theme that follows the system preference until a choice is saved.
- A compact, filter-free explorer for additional public projects, with verified repository and demo links.
- Selected public GitHub repositories with verified static links and primary-language labels; the portfolio does not depend on GitHub API data or expose an API token.
- Direct email, LinkedIn, and GitHub contact links; no unconfigured form or false send-confirmation flow.

## Deploy with GitHub Pages

The workflow in `.github/workflows/pages.yml` deploys the repository root when changes are pushed to `main`. Enable **GitHub Actions** as the Pages source in the repository settings. The live site is `https://sunnyrebel286.github.io/Portfolio/`.
