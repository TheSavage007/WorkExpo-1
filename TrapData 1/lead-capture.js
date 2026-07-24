/**
 * lead-capture.js
 * Three step lead capture used on the Farms locator, the Axiom property viewer,
 * and the Oasis service pages.
 *
 * Step 1 contact, step 2 detail, step 3 confirm and submit.
 * Ships with no framework. Drop it in any HTML file.
 *
 * Markup contract:
 *   <div id="lead" data-endpoint="https://formspree.io/f/XXXXXXX"></div>
 *   <script type="module">
 *     import { mountLeadCapture } from './lead-capture.js';
 *     mountLeadCapture('#lead', { services: ['Website Design','Database Management'] });
 *   </script>
 */

const DEFAULTS = {
    services: ['General Inquiry'],
    endpoint: null,          // Formspree URL, or null to use Netlify Forms
    formName: 'lead',
    successMessage: 'Request received. We reply within one business day.',
    onSubmit: null           // optional async (payload) => {}
};

export function mountLeadCapture(selector, options = {}) {
    const root = document.querySelector(selector);
    if (!root) return null;

  const cfg = { ...DEFAULTS, ...options, endpoint: options.endpoint || root.dataset.endpoint || null };
    const state = { step: 1, data: {} };

  render();

  function render() {
        root.innerHTML = `
              <div class="lead">
                      <div class="lead-steps">
                                ${[1, 2, 3].map((n) => `<span class="lead-dot${n <= state.step ? ' on' : ''}">${n}</span>`).join('')}
                                        </div>
                                                ${state.step === 1 ? stepOne() : ''}
                                                        ${state.step === 2 ? stepTwo(cfg) : ''}
                                                                ${state.step === 3 ? stepThree(state.data) : ''}
                                                                      </div>`;
        bind();
  }

  function stepOne() {
        return `
              <div class="field"><label for="lc-name">Name</label>
                      <input id="lc-name" type="text" value="${esc(state.data.name)}" required /></div>
                            <div class="field"><label for="lc-email">Email</label>
                                    <input id="lc-email" type="email" value="${esc(state.data.email)}" required /></div>
                                          <div class="field"><label for="lc-phone">Phone</label>
                                                  <input id="lc-phone" type="tel" value="${esc(state.data.phone)}" /></div>
                                                        <button class="btn btn-primary btn-block" data-act="next">Continue</button>
                                                              <p class="lead-error" hidden></p>`;
  }

  function stepTwo(cfg) {
        return `
              <div class="field"><label for="lc-service">Service</label>
                      <select id="lc-service">
                                <option value="">Select a service</option>
                                          ${cfg.services.map((s) => `<option${state.data.service === s ? ' selected' : ''}>${esc(s)}</option>`).join('')}
                                                  </select></div>
                                                        <div class="field"><label for="lc-address">Address or city</label>
                                                                <input id="lc-address" type="text" value="${esc(state.data.address)}" /></div>
                                                                      <div class="field"><label for="lc-message">Details</label>
                                                                              <textarea id="lc-message">${esc(state.data.message)}</textarea></div>
                                                                                    <button class="btn btn-outline" data-act="back">Back</button>
                                                                                          <button class="btn btn-primary" data-act="next">Review</button>
                                                                                                <p class="lead-error" hidden></p>`;
  }

  function stepThree(d) {
        return `
              <ul class="lead-review">
                      <li><b>Name</b><span>${esc(d.name)}</span></li>
                              <li><b>Email</b><span>${esc(d.email)}</span></li>
                                      <li><b>Phone</b><span>${esc(d.phone) || 'Not provided'}</span></li>
                                              <li><b>Service</b><span>${esc(d.service) || 'Not selected'}</span></li>
                                                      <li><b>Location</b><span>${esc(d.address) || 'Not provided'}</span></li>
                                                              <li><b>Details</b><span>${esc(d.message) || 'None'}</span></li>
                                                                    </ul>
                                                                          <button class="btn btn-outline" data-act="back">Back</button>
                                                                                <button class="btn btn-primary" data-act="submit">Submit Request</button>
                                                                                      <p class="lead-error" hidden></p>`;
  }

  function bind() {
        root.querySelectorAll('[data-act]').forEach((btn) => {
                btn.addEventListener('click', () => handle(btn.dataset.act, btn));
        });
  }

  function handle(act, btn) {
        if (act === 'back') { state.step--; render(); return; }
        if (act === 'next') {
                collect();
                const problem = validate();
                if (problem) return showError(problem);
                state.step++;
                render();
                return;
        }
        if (act === 'submit') {
                collect();
                submit(btn);
        }
  }

  function collect() {
        const get = (id) => (root.querySelector(id) ? root.querySelector(id).value.trim() : state.data[id.slice(4)]);
        if (state.step === 1) {
                state.data.name = get('#lc-name');
                state.data.email = get('#lc-email');
                state.data.phone = get('#lc-phone');
        }
        if (state.step === 2) {
                state.data.service = get('#lc-service');
                state.data.address = get('#lc-address');
                state.data.message = get('#lc-message');
        }
  }

  function validate() {
        if (state.step === 1) {
                if (!state.data.name) return 'Enter your name.';
                if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(state.data.email || '')) return 'Enter a valid email address.';
        }
        if (state.step === 2 && !state.data.service) return 'Select a service.';
        return null;
  }

  function showError(msg) {
        const el = root.querySelector('.lead-error');
        if (!el) return;
        el.textContent = msg;
        el.hidden = false;
  }

  async function submit(btn) {
        btn.disabled = true;
        btn.textContent = 'Sending';
        const payload = { ...state.data, submitted_at: new Date().toISOString(), source: location.href };
        try {
                if (typeof cfg.onSubmit === 'function') {
                          await cfg.onSubmit(payload);
                } else if (cfg.endpoint) {
                          const res = await fetch(cfg.endpoint, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                                      body: JSON.stringify(payload)
                          });
                          if (!res.ok) throw new Error('Request failed with status ' + res.status);
                } else {
                          const body = new URLSearchParams({ 'form-name': cfg.formName, ...payload });
                          const res = await fetch('/', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                      body: body.toString()
                          });
                          if (!res.ok) throw new Error('Request failed with status ' + res.status);
                }
                root.innerHTML = `<div class="lead lead-done"><h3>Thank you</h3><p>${esc(cfg.successMessage)}</p></div>`;
        } catch (err) {
                btn.disabled = false;
                btn.textContent = 'Submit Request';
                showError('That did not go through. Try again or email us directly.');
                console.error('[lead-capture]', err);
        }
  }

  return { getData: () => ({ ...state.data }), reset: () => { state.step = 1; state.data = {}; render(); } };
}

function esc(v) {
    if (v === undefined || v === null) return '';
    return String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

if (typeof window !== 'undefined') window.mountLeadCapture = mountLeadCapture;
