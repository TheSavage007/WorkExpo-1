/**
 * concierge.js
 * Rules based site chat concierge. Same engine behind Poseidon, Sage, and Chris Lyon.
 *
 * No API key, no network call, no CORS problem. Ordered pattern matching with a
 * catch all. If you later add a real model call, put it behind a server function
 * and keep this file as the fallback.
 *
 * Usage:
 *   import { mountConcierge } from './concierge.js';
 *   mountConcierge({
 *     name: 'Poseidon',
 *     avatar: '\u{1F30A}',
 *     greeting: 'Welcome. Ask me about services, pricing, or booking.',
 *     rules: myRules,          // optional, see RULES below for the shape
 *     contact: { email: 'you@example.com', phone: '(000) 000-0000' }
 *   });
 */

const RULES = [
  {
        match: /\b(hi|hey|hello|good (morning|afternoon|evening))\b/i,
        reply: (c) => `Hey. I am ${c.name}. Ask me about services, pricing, hours, or how to get started.`
  },
  {
        match: /\b(price|pricing|cost|how much|rate|quote)\b/i,
        reply: (c) => c.pricing || 'Pricing depends on scope. Send a request through the contact form and you get a firm number back the same day.'
  },
  {
        match: /\b(hour|open|closed|available|24|weekend)\b/i,
        reply: (c) => c.hours || 'We take requests seven days a week and respond within one business day.'
  },
  {
        match: /\b(where|located|location|address|service area|near me)\b/i,
        reply: (c) => c.location || 'We are based in Phoenix, Arizona and serve the surrounding metro.'
  },
  {
        match: /\b(start|begin|get going|sign up|book|schedule|appointment)\b/i,
        reply: () => 'Easiest path is the contact form on this page. Name, email, service, and one line about what you need. We take it from there.'
  },
  {
        match: /\b(contact|email|phone|call|reach)\b/i,
        reply: (c) => {
                const parts = [];
                if (c.contact && c.contact.email) parts.push(`email ${c.contact.email}`);
                if (c.contact && c.contact.phone) parts.push(`call ${c.contact.phone}`);
                return parts.length ? parts.join(', or ') + '.' : 'Use the contact form on this page and we respond within one business day.';
        }
  },
  {
        match: /\b(how long|timeline|turnaround|when|fast)\b/i,
        reply: () => 'Most jobs run one to two weeks depending on scope. Rush work is possible. Ask and we will tell you straight.'
  },
  {
        match: /\b(thank|thanks|appreciate)\b/i,
        reply: () => 'Anytime. Anything else you want to know?'
  }
  ];

const FALLBACK = 'I do not have that one on file. Send it through the contact form and a person answers directly.';

export function reply(input, cfg) {
    const text = String(input || '').trim();
    if (!text) return FALLBACK;

  const rules = (cfg.rules || []).concat(RULES);
    for (const rule of rules) {
          if (rule.match.test(text)) {
                  return typeof rule.reply === 'function' ? rule.reply(cfg) : rule.reply;
          }
    }
    return cfg.fallback || FALLBACK;
}

export function mountConcierge(options = {}) {
    const cfg = {
          name: 'Concierge',
          avatar: '\u{1F4AC}',
          greeting: 'How can I help?',
          accent: '#5FBFB5',
          ...options
    };

  const host = document.createElement('div');
    host.className = 'cnc';
    host.innerHTML = `
        <button class="cnc-toggle" aria-label="Open chat">${cfg.avatar}</button>
            <div class="cnc-panel" hidden>
                  <div class="cnc-head"><span>${cfg.avatar}</span> ${cfg.name}
                          <button class="cnc-close" aria-label="Close chat">&times;</button></div>
                                <div class="cnc-log" role="log" aria-live="polite"></div>
                                      <div class="cnc-input">
                                              <input type="text" placeholder="Type a question" aria-label="Message" />
                                                      <button class="cnc-send">Send</button>
                                                            </div>
                                                                </div>`;
    document.body.appendChild(host);
    injectStyles(cfg.accent);

  const panel = host.querySelector('.cnc-panel');
    const log = host.querySelector('.cnc-log');
    const input = host.querySelector('input');

  host.querySelector('.cnc-toggle').addEventListener('click', () => {
        panel.hidden = !panel.hidden;
        if (!panel.hidden && !log.children.length) push('bot', cfg.greeting);
        if (!panel.hidden) input.focus();
  });
    host.querySelector('.cnc-close').addEventListener('click', () => { panel.hidden = true; });
    host.querySelector('.cnc-send').addEventListener('click', send);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });

  function send() {
        const text = input.value.trim();
        if (!text) return;
        push('you', text);
        input.value = '';
        setTimeout(() => push('bot', reply(text, cfg)), 260);
  }

  function push(who, text) {
        const row = document.createElement('div');
        row.className = 'cnc-msg cnc-' + who;
        row.textContent = text;
        log.appendChild(row);
        log.scrollTop = log.scrollHeight;
  }

  return { push, reply: (t) => reply(t, cfg) };
}

function injectStyles(accent) {
    if (document.getElementById('cnc-styles')) return;
    const css = `
      .cnc-toggle{position:fixed;right:22px;bottom:22px;z-index:300;width:54px;height:54px;border-radius:50%;
          border:0;background:${accent};color:#1C1C1E;font-size:22px;cursor:pointer;}
            .cnc-panel{position:fixed;right:22px;bottom:88px;z-index:300;width:330px;max-width:calc(100vw - 44px);
                background:#232326;border:1px solid #3A3A3F;border-radius:12px;overflow:hidden;
                    font-family:Inter,system-ui,sans-serif;color:#F1EFEB;}
                      .cnc-head{padding:12px 14px;border-bottom:1px solid #3A3A3F;font-size:13px;font-weight:600;
                          display:flex;align-items:center;gap:8px;}
                            .cnc-close{margin-left:auto;background:none;border:0;color:#A5A5AC;font-size:20px;cursor:pointer;line-height:1;}
                              .cnc-log{height:300px;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:9px;}
                                .cnc-msg{font-size:13.5px;line-height:1.5;padding:9px 12px;border-radius:9px;max-width:85%;}
                                  .cnc-bot{background:#2E2E32;align-self:flex-start;}
                                    .cnc-you{background:${accent};color:#1C1C1E;align-self:flex-end;font-weight:500;}
                                      .cnc-input{display:flex;gap:6px;padding:10px;border-top:1px solid #3A3A3F;}
                                        .cnc-input input{flex:1;background:#1C1C1E;border:1px solid #3A3A3F;border-radius:6px;padding:9px 11px;
                                            color:#F1EFEB;font-size:13px;font-family:inherit;}
                                              .cnc-input input:focus{outline:none;border-color:${accent};}
                                                .cnc-send{background:${accent};color:#1C1C1E;border:0;border-radius:6px;padding:0 14px;
                                                    font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;}`;
    const tag = document.createElement('style');
    tag.id = 'cnc-styles';
    tag.textContent = css;
    document.head.appendChild(tag);
}

if (typeof window !== 'undefined') window.mountConcierge = mountConcierge;

if (typeof window !== 'undefined') window.mountConcierge = mountConcierge;
