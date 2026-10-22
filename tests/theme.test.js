import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../public/site.js', import.meta.url), 'utf8');

function browser({ saved = null, dark = false, blocked = false } = {}) {
  const root = { dataset: {} };
  const events = {};
  const attributes = {};
  const label = {};
  const button = {
    dataset: { light: 'Chiaro', dark: 'Scuro', toLight: 'Attiva tema chiaro', toDark: 'Attiva tema scuro' },
    hidden: true,
    setAttribute: (name, value) => { attributes[name] = value; },
    querySelector: () => label,
    addEventListener: (name, callback) => { events[name] = callback; },
  };
  const system = {
    matches: dark,
    addEventListener: (_, callback) => { events.system = callback; },
  };
  let ready = false;
  let stored = saved;
  const context = {
    document: {
      documentElement: root,
      querySelector: () => ready ? button : null,
      addEventListener: (_, callback) => { events.ready = () => { ready = true; callback(); }; },
    },
    window: {
      matchMedia: (query) => query.includes('color-scheme') ? system : { matches: true },
      addEventListener: (name, callback) => { events[name] = callback; },
    },
    localStorage: {
      getItem: () => { if (blocked) throw new Error('Storage blocked'); return stored; },
      setItem: (_, value) => { if (blocked) throw new Error('Storage blocked'); stored = value; },
    },
  };
  runInNewContext(source, context);
  return { root, events, button, attributes, label, system, saved: () => stored };
}

test('system preference applies before the DOM is ready, then the control becomes available', () => {
  for (const dark of [false, true]) {
    const page = browser({ dark });
    assert.equal(page.root.dataset.theme, dark ? 'dark' : 'light');
    assert.equal(page.button.hidden, true);
    page.events.ready();
    assert.equal(page.button.hidden, false);
    assert.equal(page.attributes['aria-pressed'], String(dark));
  }
});

test('manual selection persists and overrides later system changes', () => {
  const page = browser();
  page.events.ready();
  page.events.click();
  assert.equal(page.root.dataset.theme, 'dark');
  assert.equal(page.saved(), 'dark');
  assert.equal(page.label.textContent, 'Scuro');
  assert.equal(page.button.title, 'Attiva tema chiaro');
  assert.equal(page.attributes['aria-pressed'], 'true');
  page.system.matches = false;
  page.events.system();
  assert.equal(page.root.dataset.theme, 'dark');
  page.events.click();
  assert.equal(page.saved(), 'light');
  assert.equal(page.attributes['aria-pressed'], 'false');
});

test('a saved light theme overrides a dark system and survives another page load', () => {
  const first = browser({ dark: true });
  first.events.ready();
  first.events.click();
  const next = browser({ saved: first.saved(), dark: true });
  assert.equal(next.root.dataset.theme, 'light');
});

test('invalid storage values fall back to the system, which is followed until a manual choice', () => {
  const page = browser({ saved: 'invalid' });
  page.events.ready();
  assert.equal(page.root.dataset.theme, 'light');
  page.system.matches = true;
  page.events.system();
  assert.equal(page.root.dataset.theme, 'dark');
});

test('blocked storage does not prevent initialization or theme switching', () => {
  const page = browser({ blocked: true, dark: true });
  page.events.ready();
  page.events.click();
  assert.equal(page.root.dataset.theme, 'light');
});

test('theme changes and cleared preferences synchronize between tabs', () => {
  const page = browser({ dark: true });
  page.events.ready();
  page.events.storage({ key: 'unrelated', newValue: 'light' });
  assert.equal(page.root.dataset.theme, 'dark');
  page.events.storage({ key: 'portfolio-theme', newValue: 'light' });
  assert.equal(page.root.dataset.theme, 'light');
  page.events.storage({ key: null, newValue: null });
  assert.equal(page.root.dataset.theme, 'dark');
});
