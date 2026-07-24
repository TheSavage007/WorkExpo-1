/**
 * spa-router.js
 * Single page navigation used across the Oasis, Farms, Axiom and Locksmith builds.
 *
 * Markup contract:
 *   <main id="page-home" class="page active">...</main>
 *   <main id="page-services" class="page">...</main>
 *   <a data-route="services">Services</a>
 *
 * Usage:
 *   import { initRouter, sp } from './spa-router.js';
 *   initRouter({ default: 'home', onChange: (id) => console.log(id) });
 */

const PAGE_SELECTOR = '.page';
const ACTIVE_CLASS = 'active';

let config = {
  default: 'home',
    scroll: true,
    onChange: null
};

/**
 * Show a page by id. "services" resolves to the element #page-services.
 */
export function sp(id) {
    const target = document.getElementById('page-' + id);
    if (!target) {
          console.warn('[router] no page found for id:', id);
          return false;
    }

  document.querySelectorAll(PAGE_SELECTOR).forEach((p) => p.classList.remove(ACTIVE_CLASS));
    target.classList.add(ACTIVE_CLASS);

  document.querySelectorAll('[data-route]').forEach((link) => {
        link.classList.toggle(ACTIVE_CLASS, link.dataset.route === id);
  });

  if (config.scroll) {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }

  history.replaceState(null, '', '#' + id);
    document.title = buildTitle(id);

  if (typeof config.onChange === 'function') config.onChange(id);
    return true;
}

function buildTitle(id) {
    const base = document.body.dataset.siteName || document.title.split(' | ')[0];
    if (id === config.default) return base;
    return base + ' | ' + id.charAt(0).toUpperCase() + id.slice(1);
}

/**
 * Wire every [data-route] element and honor the hash on first load.
 */
export function initRouter(options = {}) {
    config = { ...config, ...options };

  document.querySelectorAll('[data-route]').forEach((link) => {
        link.addEventListener('click', (e) => {
                e.preventDefault();
                sp(link.dataset.route);
        });
  });

  window.addEventListener('hashchange', () => {
        const id = location.hash.replace('#', '');
        if (id) sp(id);
  });

  const start = location.hash.replace('#', '') || config.default;
    sp(start);
}

/* Non module fallback for standalone HTML files */
if (typeof window !== 'undefined') {
    window.sp = sp;
    window.initRouter = initRouter;
}
