import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../public/site.js', import.meta.url), 'utf8');

function browser({ saved = null, dark = false, blocked = false } = {}) {
  const root = { dataset: {} };
  const events = {};
  const select = {
    value: 'system',
    disabled: true,
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
      querySelector: () => ready ? select : null,
      addEventListener: (_, callback) => { events.ready = () => { ready = true; callback(); }; },
    },
    window: {
      matchMedia: (query) => query.includes('color-scheme') ? system : { matches: true },
      addEventListener: (name, callback) => { events[name] = callback; },
    },
    localStorage: {
      getItem: () => { if (blocked) throw new Error('Storage blocked'); return stored; },
      setItem: (_, value) => { if (blocked) throw new Error('Storage blocked'); stored = value; },
      removeItem: () => { if (blocked) throw new Error('Storage blocked'); stored = null; },
    },
  };
  runInNewContext(source, context);
  const choose = (value) => { select.value = value; events.change(); };
  return { root, events, select, choose, system, saved: () => stored };
}

test('system applies before rendering and the visible selector becomes interactive', () => {
  for (const dark of [false, true]) {
    const page = browser({ dark });
    assert.equal(page.root.dataset.theme, dark ? 'dark' : 'light');
    assert.equal(page.select.disabled, true);
    page.events.ready();
    assert.equal(page.select.disabled, false);
    assert.equal(page.select.value, 'system');
    page.system.matches = !dark;
    page.events.system();
    assert.equal(page.root.dataset.theme, dark ? 'light' : 'dark');
  }
});

test('manual choices persist and override system changes and reloads', () => {
  const page = browser();
  page.events.ready();
  page.choose('dark');
  assert.equal(page.root.dataset.theme, 'dark');
  assert.equal(page.saved(), 'dark');
  page.events.system();
  assert.equal(page.root.dataset.theme, 'dark');
  page.choose('light');
  assert.equal(page.saved(), 'light');
  const next = browser({ saved: page.saved(), dark: true });
  next.events.ready();
  assert.equal(next.root.dataset.theme, 'light');
  assert.equal(next.select.value, 'light');
});

test('returning to System clears the override and resumes live system updates', () => {
  const page = browser({ saved: 'light', dark: true });
  page.events.ready();
  page.choose('system');
  assert.equal(page.saved(), null);
  assert.equal(page.select.value, 'system');
  assert.equal(page.root.dataset.theme, 'dark');
  page.system.matches = false;
  page.events.system();
  assert.equal(page.root.dataset.theme, 'light');
});

test('invalid storage falls back to system', () => {
  const page = browser({ saved: 'invalid', dark: true });
  page.events.ready();
  assert.equal(page.select.value, 'system');
  assert.equal(page.root.dataset.theme, 'dark');
});

test('blocked storage allows manual choices and returning to System', () => {
  const page = browser({ blocked: true, dark: true });
  page.events.ready();
  page.choose('light');
  assert.equal(page.root.dataset.theme, 'light');
  page.choose('system');
  assert.equal(page.root.dataset.theme, 'dark');
});

test('theme changes and cleared preferences synchronize between tabs', () => {
  const page = browser({ dark: true });
  page.events.ready();
  page.events.storage({ key: 'unrelated', newValue: 'light' });
  assert.equal(page.root.dataset.theme, 'dark');
  page.events.storage({ key: 'portfolio-theme', newValue: 'light' });
  assert.equal(page.root.dataset.theme, 'light');
  assert.equal(page.select.value, 'light');
  page.events.storage({ key: null, newValue: null });
  assert.equal(page.root.dataset.theme, 'dark');
  assert.equal(page.select.value, 'system');
});
