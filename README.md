# Sani Kumar Portfolio

A responsive static developer portfolio built with HTML5, CSS3 and vanilla JavaScript. No build step or runtime dependency is required. The profile photo and resume are stored in the repository.

## Run locally

Open `index.html` in a browser or use VS Code Live Server.

## Features

- Responsive layout inspired by the supplied portfolio reference, with dark and light themes.
- Accessible navigation, keyboard focus states, reduced-motion support, and a theme that follows the system preference until a choice is saved.
- Category filters for the secondary public-project cards; every filter updates an accessible result status.
- Public GitHub profile, latest repositories, available star/fork counts and primary-language breakdown loaded with the unauthenticated GitHub REST API. Language percentages represent the share of public repositories by primary language; no GitHub token is used in browser code.
- GitHub loading, empty, network-error and API-rate-limit states with direct profile/repository links as fallbacks.
- Contact form validates fields but stays disabled until a Formspree endpoint is configured.

## Configure the contact form

Create a Formspree form, then set the form's `data-endpoint` attribute in `index.html` to its HTTPS form URL (`https://formspree.io/f/<form-id>`). The site only enables submissions for a Formspree endpoint matching that format. Do not put an email-service password or private API key in this static site.

Until that endpoint is configured, visitors can use the direct email link instead. Form submissions are not reported as successful unless Formspree confirms the request.

## Deploy with GitHub Pages

The workflow in `.github/workflows/pages.yml` deploys the repository root when changes are pushed to `main`. Enable **GitHub Actions** as the Pages source in the repository settings. The live site is `https://sunnyrebel286.github.io/Portfolio/`.
