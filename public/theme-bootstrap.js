(function applyCachedNookTheme() {
  try {
    var preference = window.localStorage.getItem('nook-theme');
    var theme = preference === 'dark' || preference === 'light'
      ? preference
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
  } catch (_error) {
    document.documentElement.dataset.theme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
}());
