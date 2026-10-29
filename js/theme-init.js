(() => {
  const savedTheme = localStorage.getItem('portfolio-theme');
  const hasSavedTheme = savedTheme === 'dark' || savedTheme === 'light';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = hasSavedTheme ? savedTheme : prefersDark ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#0B1728' : '#F4F7FC';
})();
