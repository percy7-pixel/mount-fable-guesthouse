/* ==========================================================================
   Mount Fable Guesthouse — site behaviour
   --------------------------------------------------------------------------
   CONFIG below is the single source of truth for the guesthouse's contact
   details. Change whatsappNumber and every button, link and the footer
   number follow — nothing else in the project hard-codes it.
   ========================================================================== */

const CONFIG = {
  propertyName: 'Mount Fable Guesthouse',

  /* WhatsApp number in international format — digits only, no +, spaces or
     dashes (for Cameroon that is 237 followed by the 9-digit mobile number).
     This is a SHOWCASE PLACEHOLDER, not a real number: replace this single
     line before showing the site to a real guesthouse client. */
  whatsappNumber: '237653317507',

  generalMessage:
    'Hello Mount Fable Guesthouse, I found your website and would like to ask about ' +
    'a stay in Buea. Please let me know what is available and the rates. Thank you!'
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ---------- phone helpers ---------- */

const WA_NUMBER = String(CONFIG.whatsappNumber || '').replace(/[^\d]/g, '');

function isUsableNumber(value) {
  const digits = String(value || '').replace(/[^\d]/g, '');
  if (digits.length < 8 || digits.length > 15) return false;
  if (/^(\d)\1+$/.test(digits)) return false;
  return true;
}

/* +237 653 317 507 from the single configured value */
function formatNumber(value) {
  const d = String(value || '').replace(/[^\d]/g, '');
  if (d.length === 12) {
    return '+' + d.slice(0, 3) + ' ' + d.slice(3, 6) + ' ' + d.slice(6, 9) + ' ' + d.slice(9);
  }
  return '+' + d;
}

const WA_DISPLAY = formatNumber(WA_NUMBER);
const WA_OK = isUsableNumber(WA_NUMBER);

if (!WA_OK) {
  console.error(
    '[Mount Fable] CONFIG.whatsappNumber is not usable (' + WA_NUMBER + '). ' +
    'Set a real international number in assets/js/main.js.'
  );
}

function waLink(message) {
  return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message);
}

/* Every .js-wa element gets its destination here. Elements marked
   data-wa="booking" are handled by refresh() because their message is built
   from the form. */
function wireWhatsAppLinks() {
  $$('a.js-wa').forEach((el) => {
    if ((el.getAttribute('data-wa') || 'general') === 'booking') return;
    if (!WA_OK) {
      el.removeAttribute('href');
      el.setAttribute('aria-disabled', 'true');
      return;
    }
    el.setAttribute('href', waLink(CONFIG.generalMessage));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });
}

/* ---------- masthead ---------- */

const masthead = $('#masthead');
function onScroll() {
  if (masthead) masthead.classList.toggle('is-stuck', (window.scrollY || 0) > 12);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- full-screen menu ---------- */

(function menu() {
  const toggle = $('#menuToggle');
  const panel = $('#siteMenu');
  const close = $('#menuClose');
  if (!toggle || !panel) return;

  function open() {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-locked');
    const first = panel.querySelector('a');
    if (first) first.focus({ preventScroll: true });
  }
  function shut() {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
    toggle.focus({ preventScroll: true });
  }

  toggle.addEventListener('click', open);
  if (close) close.addEventListener('click', shut);
  $$('a', panel).forEach((a) => a.addEventListener('click', () => {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
  }));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) shut();
  });
})();

/* ---------- booking ---------- */

const form = $('#bookingForm');
const roomSelect = $('#room');
const checkin = $('#checkin');
const checkout = $('#checkout');
const guests = $('#guests');
const errorBox = $('#formError');
const summary = $('#summary');
const bookingCta = $('#bookingCta');
const DAY = 86400000;

function toISO(date) {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 10);
}
function fromISO(value) {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function shortDate(value) {
  const date = fromISO(value);
  if (!date) return '';
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}
function longDate(value) {
  const date = fromISO(value);
  if (!date) return '';
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
function nights(a, b) {
  const start = fromISO(a);
  const end = fromISO(b);
  if (!start || !end) return 0;
  return Math.round((end - start) / DAY);
}

function buildMessage() {
  const room = roomSelect ? roomSelect.value : '';
  const guestValue = guests ? guests.value : '';
  const guestLabel = guestValue === '1' ? '1 guest' : guestValue + ' guests';
  const inDate = longDate(checkin && checkin.value);
  const outDate = longDate(checkout && checkout.value);
  const stay = nights(checkin && checkin.value, checkout && checkout.value);

  const lines = [
    'Hello ' + CONFIG.propertyName + ',',
    '',
    'I would like to enquire about a stay:',
    '',
    '• Room: ' + (room === 'Not sure yet' ? 'Not sure yet — please advise' : room),
    '• Check-in: ' + (inDate || 'flexible'),
    '• Check-out: ' + (outDate || 'flexible')
  ];
  if (stay > 0) lines.push('• Nights: ' + stay);
  lines.push('• Guests: ' + guestLabel);
  lines.push('', 'Could you let me know if these dates are available and what the total would be? Thank you!');
  return lines.join('\n');
}

function findProblems() {
  const problems = [];
  if (!(roomSelect && roomSelect.value)) problems.push('Choose a room category.');
  if (!(checkin && checkin.value)) problems.push('Choose a check-in date.');
  if (!(checkout && checkout.value)) problems.push('Choose a check-out date.');
  if (!(guests && guests.value)) problems.push('Choose how many guests are coming.');

  if (checkin && checkin.value && checkout && checkout.value &&
      nights(checkin.value, checkout.value) <= 0) {
    problems.push('Your check-out date needs to be after your check-in.');
  }
  if (checkin && checkin.value && checkin.value < toISO(new Date())) {
    problems.push('Your check-in date can’t be in the past.');
  }
  return problems;
}

function setError(message) {
  if (!errorBox) return;
  if (message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  } else {
    errorBox.hidden = true;
  }
}

function validate(showNow) {
  const problems = findProblems();
  if (!problems.length) {
    setError('');
    return true;
  }
  setError(showNow ? problems.join(' ') : '');
  return false;
}

function refresh() {
  /* live summary line */
  if (summary) {
    const room = (roomSelect && roomSelect.value) || 'Room';
    const inD = shortDate(checkin && checkin.value);
    const outD = shortDate(checkout && checkout.value);
    const stay = nights(checkin && checkin.value, checkout && checkout.value);
    const g = guests ? guests.value : '';
    const guestLabel = g === '1' ? '1 guest' : (g ? g + ' guests' : '');
    if (inD && outD && stay > 0) {
      summary.textContent = room + ' · ' + inD + ' → ' + outD + ' · ' + stay +
        (stay === 1 ? ' night' : ' nights') + (guestLabel ? ' · ' + guestLabel : '');
    } else {
      summary.textContent = 'Choose your room and dates to see your request.';
    }
  }

  /* the booking link */
  if (bookingCta) {
    if (!WA_OK) {
      bookingCta.removeAttribute('href');
      bookingCta.setAttribute('aria-disabled', 'true');
    } else {
      bookingCta.setAttribute('href', waLink(buildMessage()));
      bookingCta.setAttribute('target', '_blank');
      bookingCta.setAttribute('rel', 'noopener');
    }
  }

  /* check-out can never precede check-in */
  if (checkin && checkin.value && checkout) {
    const min = toISO(new Date(fromISO(checkin.value).getTime() + DAY));
    checkout.min = min;
    if (checkout.value && checkout.value < min) checkout.value = '';
  }

  validate(false);
}

/* example window: tomorrow → three nights */
(function prefill() {
  if (!checkin || !checkout) return;
  const today = new Date();
  const start = new Date(today.getTime() + DAY);
  const end = new Date(today.getTime() + 4 * DAY);
  checkin.min = toISO(start);
  checkout.min = toISO(new Date(start.getTime() + DAY));
  checkin.value = toISO(start);
  checkout.value = toISO(end);
})();

if (form) {
  form.addEventListener('input', refresh);
  form.addEventListener('change', refresh);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (validate(true) && WA_OK) window.open(waLink(buildMessage()), '_blank', 'noopener');
  });
}

document.addEventListener('click', (event) => {
  const cta = event.target.closest('#bookingCta');
  if (!cta) return;
  if (!validate(true)) {
    event.preventDefault();
    cta.removeAttribute('href');
    if (errorBox) errorBox.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
});

/* "Reserve" links on each room carry the room into the form */
$$('.js-room').forEach((link) => {
  link.addEventListener('click', () => {
    const value = link.getAttribute('data-room');
    if (roomSelect && value) {
      roomSelect.value = value;
      refresh();
    }
    if (roomSelect) window.setTimeout(() => roomSelect.focus({ preventScroll: true }), 700);
  });
});

/* ---------- photo story viewer ---------- */

(function lightbox() {
  const dialog = $('#lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const img = $('#lbImg');
  const cap = $('#lbCap');
  const shots = $$('.shot');
  let index = 0;

  function show(i) {
    index = (i + shots.length) % shots.length;
    const shot = shots[index];
    const thumb = shot.querySelector('img');
    const full = shot.getAttribute('data-full') || (thumb ? thumb.src : '');
    img.src = full;
    img.alt = thumb ? thumb.alt : '';
    if (cap) cap.textContent = shot.getAttribute('data-caption') || '';
  }

  shots.forEach((shot, i) => {
    shot.addEventListener('click', () => {
      show(i);
      dialog.showModal();
    });
  });

  $('#lbClose').addEventListener('click', () => dialog.close());
  $('#lbPrev').addEventListener('click', () => show(index - 1));
  $('#lbNext').addEventListener('click', () => show(index + 1));
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
})();

/* ---------- footer bits ---------- */

$$('.js-wa-display').forEach((el) => { el.textContent = WA_DISPLAY; });
const year = $('#year');
if (year) year.textContent = String(new Date().getFullYear());

/* ---------- boot ---------- */
wireWhatsAppLinks();
refresh();
