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
    const select = document.querySelector('[data-theme-select]');
    if (select) select.value = preference ?? 'system';
  };

  applyTheme();
  system.addEventListener('change', applyTheme);
  window.addEventListener('storage', (event) => {
    if (event.key !== key && event.key !== null) return;
    preference = ['light', 'dark'].includes(event.newValue) ? event.newValue : null;
    applyTheme();
  });

  document.addEventListener('DOMContentLoaded', () => {
    const select = document.querySelector('[data-theme-select]');
    select.disabled = false;
    applyTheme();
    select.addEventListener('change', () => {
      preference = ['light', 'dark'].includes(select.value) ? select.value : null;
      try {
        if (preference) localStorage.setItem(key, preference);
        else localStorage.removeItem(key);
      } catch {
        // The choice still works for this page when storage is blocked.
      }
      applyTheme();
    });

  });
})();
