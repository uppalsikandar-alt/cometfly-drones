// CometFly Drones — site interactions

document.addEventListener('DOMContentLoaded', () => {

  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      navToggle.textContent = isOpen ? '✕' : '☰';
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.textContent = '☰';
      });
    });
  }

  // Scroll-reveal
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -10% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      item.closest('section').querySelectorAll('.faq-item.open').forEach(open => {
        if (open !== item) open.classList.remove('open');
      });
      item.classList.toggle('open', !wasOpen);
    });
  });

  // Forms — delivered to the business inbox via FormSubmit (works on GitHub Pages, no server needed)
  const INBOX = 'kamran.avin@cometflydrones.com.au';
  ['contact-form', 'quote-form'].forEach(id => {
    const form = document.getElementById(id);
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;
      let note = form.querySelector('.form-note');
      if (!note) {
        note = document.createElement('p');
        note.className = 'form-note';
        note.setAttribute('role', 'status');
        form.appendChild(note);
      }
      const data = Object.fromEntries(new FormData(form).entries());
      if (data._honey) return; // spam bot
      delete data._honey;
      data._subject = form.dataset.subject || 'Website enquiry — CometFly Drones';
      data._template = 'table';
      if (data.email) data._replyto = data.email;

      btn.textContent = 'Sending…';
      btn.disabled = true;
      note.classList.remove('err');
      note.textContent = '';
      try {
        const res = await fetch('https://formsubmit.co/ajax/' + INBOX, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || String(out.success) === 'false') throw new Error(out.message || 'Send failed');
        btn.textContent = 'Sent ✓';
        note.textContent = "Thanks — we've received your details and will be in touch shortly.";
        form.reset();
        setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 3200);
      } catch (err) {
        btn.textContent = original;
        btn.disabled = false;
        note.classList.add('err');
        const body = encodeURIComponent(Object.entries(data).filter(([k]) => !k.startsWith('_')).map(([k, v]) => k.replace(/_/g, ' ') + ': ' + v).join('\n'));
        note.innerHTML = 'Sorry, the message could not be sent. Please call <a href="tel:0412400097">0412 400 097</a> or <a href="mailto:' + INBOX + '?subject=' + encodeURIComponent(data._subject) + '&body=' + body + '">email us directly</a>.';
      }
    });
  });

});
