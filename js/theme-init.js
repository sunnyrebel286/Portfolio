(() => {
  const savedTheme = localStorage.getItem('portfolio-theme');
  const theme = savedTheme === 'dark' || savedTheme === 'light'
    ? savedTheme
    : 'light';
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#07151e' : '#ffffff';
})();
