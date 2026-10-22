// Run on a fresh page at each supported viewport.
(async () => {
  const assert = (value, message) => { if (!value) throw Error(message); };
  const visible = (element) => {
    const rect = element.getBoundingClientRect();
    assert(rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.left >= 0 && rect.bottom <= innerHeight + 1 && rect.right <= innerWidth + 1, 'Control leaves viewport');
    const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    assert(hit && element.contains(hit), 'Control is clipped or covered');
  };
  const settle = () => new Promise(requestAnimationFrame);
  const desktop = document.querySelector('.desktop');
  if (matchMedia('(max-width: 700px)').matches) {
    assert(desktop.clientHeight >= 140, 'Phone display is too short to use');
    for (const icon of document.querySelectorAll('.desktop-icons [data-open]')) {
      icon.scrollIntoView({ block: 'nearest' });
      await settle();
      visible(icon);
      icon.click();
      const back = document.querySelector('.phone-softkeys [data-phone-back]');
      visible(back);
      back.click();
    }
  } else {
    const frame = document.querySelector('#benvenuto');
    assert(frame.getBoundingClientRect().bottom <= desktop.getBoundingClientRect().bottom + 1, 'Window exceeds desktop work area');
    visible(frame.querySelector('[data-resize]'));
    document.querySelector('[data-start]').click();
    const menu = document.querySelector('#start-menu');
    assert(menu.getBoundingClientRect().top >= 0, 'Start menu leaves viewport');
    for (const link of menu.querySelectorAll('[data-open]')) {
      link.focus();
      await settle();
      visible(link);
    }
    document.querySelector('[data-start]').click();
  }
  assert(document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight, 'Page overflows viewport');
  return `PASS: visible controls and layout at ${innerWidth}×${innerHeight}`;
})();
