# Sani Kumar Portfolio

A responsive static developer portfolio built with HTML5, CSS3 and vanilla JavaScript. No build step or runtime dependency is required. The profile photo and resume are stored in the repository.

## Run locally

Open `index.html` in a browser or use VS Code Live Server.

## Features

- Responsive layout with dark and light themes.
- Accessible navigation, theme controls, keyboard focus states and reduced-motion support.
- Public GitHub profile and repository information loaded with the unauthenticated GitHub REST API. No GitHub token is used in browser code.
- Contact form validates fields but stays disabled until a Formspree endpoint is configured.

## Configure the contact form

Create a Formspree form, then set the form's `data-endpoint` attribute in `index.html` to its HTTPS form URL (`https://formspree.io/f/<form-id>`). The site only enables submissions for a Formspree endpoint matching that format. Do not put an email-service password or private API key in this static site.

Until that endpoint is configured, visitors can use the direct email link instead. Form submissions are not reported as successful unless Formspree confirms the request.

## Deploy with GitHub Pages

The workflow in `.github/workflows/pages.yml` deploys the repository root when changes are pushed to `main`. Enable **GitHub Actions** as the Pages source in the repository settings. The live site is `https://sunnyrebel286.github.io/Portfolio/`.
