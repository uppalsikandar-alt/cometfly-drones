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

  // Form handling (no backend — friendly inline confirmation)
  ['contact-form', 'quote-form'].forEach(id => {
    const form = document.getElementById(id);
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.textContent = 'Sent ✓';
      btn.disabled = true;
      let note = form.querySelector('.form-note');
      if (!note) {
        note = document.createElement('p');
        note.className = 'form-note';
        note.style.cssText = 'margin-top:14px;font-size:13.5px;color:#2F6FED;';
        form.appendChild(note);
      }
      note.textContent = "Thanks — we've received your details and will be in touch shortly.";
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
        form.reset();
      }, 3200);
    });
  });

});

// v3 — photo library filters + lightbox
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.filter-bar').forEach(bar => {
    const grid = document.querySelector(bar.dataset.target);
    if (!grid) return;
    bar.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        bar.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        grid.querySelectorAll('.ph-img').forEach(el => {
          el.classList.toggle('hide', f !== 'all' && el.dataset.cat !== f);
        });
      });
    });
  });

  const items = Array.from(document.querySelectorAll('.photo-grid .ph-img'));
  if (!items.length) return;
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = '<button class="lb-close" aria-label="Close">✕</button><button class="lb-prev" aria-label="Previous">‹</button><figure><img alt=""><figcaption></figcaption></figure><button class="lb-next" aria-label="Next">›</button>';
  document.body.appendChild(lb);
  const img = lb.querySelector('img'), cap = lb.querySelector('figcaption');
  let idx = 0;
  const visible = () => items.filter(el => !el.classList.contains('hide'));
  const show = (el) => {
    const v = visible(); idx = v.indexOf(el);
    const i = el.querySelector('img');
    img.src = i.src; img.alt = i.alt;
    const tag = el.querySelector('.ph-tag'), ref = el.querySelector('.ph-ref');
    cap.textContent = (ref ? ref.textContent + ' · ' : '') + (tag ? tag.textContent : i.alt);
    lb.classList.add('open'); document.body.style.overflow = 'hidden';
  };
  const step = (d) => { const v = visible(); if (!v.length) return; show(v[(idx + d + v.length) % v.length]); };
  const close = () => { lb.classList.remove('open'); document.body.style.overflow = ''; };
  items.forEach(el => el.addEventListener('click', () => show(el)));
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', (e) => { e.stopPropagation(); step(-1); });
  lb.querySelector('.lb-next').addEventListener('click', (e) => { e.stopPropagation(); step(1); });
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
});

// v3.1 — hero photo slideshow
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.hero-slides').forEach(box => {
    const slides = Array.from(box.querySelectorAll('img'));
    if (slides.length < 2) return;
    const dots = Array.from((box.parentElement.querySelector('.hero-dots') || document.createElement('div')).querySelectorAll('button'));
    let i = 0, timer;
    const go = (n) => {
      slides[i].classList.remove('active'); if (dots[i]) dots[i].classList.remove('active');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('active'); if (dots[i]) dots[i].classList.add('active');
    };
    const start = () => { clearInterval(timer); timer = setInterval(() => go(i + 1), 5500); };
    dots.forEach((d, n) => d.addEventListener('click', () => { go(n); start(); }));
    start();
  });
});
