/* =========================================================
   Tejiendo Amor · interacciones
   ========================================================= */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ---------- Año del footer ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Menú móvil ---------- */
  const nav = $('#mainNav');
  const toggle = $('#navToggle');

  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };

  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Animación de entrada al hacer scroll ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 3) * 90}ms`;
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* ---------- Fotos que no cargan: placeholder lavanda ---------- */
  const showPlaceholder = (img) => {
    if (img.dataset.failed) return;
    img.dataset.failed = '1';
    const ph = document.createElement('div');
    ph.className = 'ph';
    ph.setAttribute('role', 'img');
    ph.setAttribute('aria-label', img.alt || 'Imagen');
    ph.textContent = img.dataset.fallback || '🧶';
    img.replaceWith(ph);
  };

  $$('img[data-fallback]').forEach((img) => {
    img.addEventListener('error', () => showPlaceholder(img));
    // por si ya falló antes de enganchar el listener
    if (img.complete && img.naturalWidth === 0) showPlaceholder(img);
  });

  /* ---------- FAQ (acordeón) ---------- */
  const faqItems = $$('.faq-item');

  const setFaq = (item, open) => {
    const btn = $('.faq-q', item);
    const panel = $('.faq-a', item);
    item.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    panel.style.height = open ? `${panel.scrollHeight}px` : '0px';
  };

  faqItems.forEach((item) => {
    $('.faq-q', item).addEventListener('click', () => {
      const willOpen = !item.classList.contains('open');
      faqItems.forEach((other) => setFaq(other, other === item && willOpen));
    });
  });

  window.addEventListener('resize', () => {
    faqItems.forEach((item) => {
      if (item.classList.contains('open')) {
        $('.faq-a', item).style.height = `${$('.faq-a', item).scrollHeight}px`;
      }
    });
  });

  /* ---------- "Quiero uno parecido": preselecciona la pieza ---------- */
  const pieza = $('#pieza');
  $$('.card-link[data-pieza]').forEach((link) => {
    link.addEventListener('click', () => {
      pieza.value = link.dataset.pieza;
      pieza.closest('.field').classList.remove('invalid');
      const err = $('.error[data-for="pieza"]');
      if (err) err.textContent = '';
    });
  });

  /* ---------- Formulario de pedido (solo demostración) ---------- */
  const form = $('#orderForm');
  const success = $('#formSuccess');
  const successTitle = $('#successTitle');
  const resetBtn = $('#resetForm');

  const rules = {
    nombre: (v) => (v.trim().length >= 2 ? '' : 'Contanos tu nombre, así sabemos cómo llamarte 💜'),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Revisá que el email esté bien escrito'),
    pieza: (v) => (v ? '' : 'Elegí qué pieza te gustaría'),
    detalles: (v) => (v.trim().length >= 10 ? '' : 'Contanos un poquito más de tu idea (10 letras o más)'),
  };

  const validateField = (name) => {
    const input = form.elements[name];
    const message = rules[name](input.value);
    const field = input.closest('.field');
    const out = $(`.error[data-for="${name}"]`, form);
    field.classList.toggle('invalid', Boolean(message));
    if (out) out.textContent = message;
    return !message;
  };

  Object.keys(rules).forEach((name) => {
    const input = form.elements[name];
    input.addEventListener('blur', () => validateField(name));
    input.addEventListener('input', () => {
      if (input.closest('.field').classList.contains('invalid')) validateField(name);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const results = Object.keys(rules).map(validateField);
    if (results.includes(false)) {
      const firstBad = $('.field.invalid input, .field.invalid select, .field.invalid textarea', form);
      if (firstBad) firstBad.focus();
      return;
    }
    // Acá iría el envío real (fetch a tu backend / servicio de formularios).
    const nombre = form.elements.nombre.value.trim().split(' ')[0];
    successTitle.textContent = `¡Gracias, ${nombre}!`;
    form.hidden = true;
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  resetBtn.addEventListener('click', () => {
    form.reset();
    $$('.field.invalid', form).forEach((f) => f.classList.remove('invalid'));
    $$('.error', form).forEach((o) => { o.textContent = ''; });
    success.hidden = true;
    form.hidden = false;
    form.elements.nombre.focus();
  });
})();