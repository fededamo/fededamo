(async () => {
  const assert = (value, message) => { if (!value) throw Error(message); };
  const select = document.querySelector('[data-theme-select]');
  const root = document.documentElement;
  const settle = () => Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => {})));
  const choose = async (value) => {
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await settle();
  };
  assert(!select.disabled && select.options.length === 3, 'Theme selector must expose three usable modes');
  await choose('dark');
  assert(root.dataset.theme === 'dark' && localStorage.getItem('portfolio-theme') === 'dark', 'Dark selection failed');
  await choose('light');
  assert(root.dataset.theme === 'light' && localStorage.getItem('portfolio-theme') === 'light', 'Light selection failed');
  await choose('system');
  assert(localStorage.getItem('portfolio-theme') === null, 'System must clear the manual override');
  assert(root.dataset.theme === (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'), 'System mode did not follow the browser');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelector('.desktop-icons [data-open="profilo"]').click();
  const animations = document.querySelector('#profilo').getAnimations({ subtree: true });
  assert(reduced ? animations.length === 0 : animations.some((animation) => animation.animationName === 'window-open'), 'Window animation does not respect the motion preference');
  await settle();
  if (matchMedia('(max-width: 700px)').matches) {
    document.querySelector('.phone-softkeys [data-phone-menu]').click();
  } else {
    document.querySelector('[data-start]').click();
    const menuAnimations = document.querySelector('#start-menu').getAnimations({ subtree: true });
    assert(reduced ? menuAnimations.length === 0 : menuAnimations.some((animation) => animation.animationName === 'window-open'), 'Start animation does not respect the motion preference');
    document.querySelector('[data-start]').click();
    document.querySelector('.desktop-icons [data-open="benvenuto"]').click();
  }
  await settle();
  return `PASS: System/Light/Dark selector and ${reduced ? 'reduced' : 'normal'} motion`;
})();
