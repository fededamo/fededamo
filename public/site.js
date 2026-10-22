(() => {
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const key = 'portfolio-theme';
  let preference = null;

  try {
    const saved = localStorage.getItem(key);
    if (saved === 'light' || saved === 'dark') preference = saved;
  } catch {
    // Storage may be unavailable in private or restricted browsing.
  }

  const applyTheme = () => {
    root.dataset.theme = preference ?? (system.matches ? 'dark' : 'light');
    const button = document.querySelector('[data-theme-toggle]');
    if (!button) return;
    const dark = root.dataset.theme === 'dark';
    button.setAttribute('aria-pressed', String(dark));
    button.title = dark ? button.dataset.toLight : button.dataset.toDark;
    button.querySelector('[data-theme-label]').textContent = dark
      ? button.dataset.dark
      : button.dataset.light;
  };

  applyTheme();
  system.addEventListener('change', applyTheme);
  window.addEventListener('storage', (event) => {
    if (event.key !== key && event.key !== null) return;
    preference = ['light', 'dark'].includes(event.newValue) ? event.newValue : null;
    applyTheme();
  });

  document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('[data-theme-toggle]');
    button.hidden = false;
    applyTheme();
    button.addEventListener('click', () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(key, preference);
      } catch {
        // The choice still works for this page when storage is blocked.
      }
      applyTheme();
    });

  });
})();
