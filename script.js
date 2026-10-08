/* ==========================================================================
   Bhoomika Jivireddy: Portfolio scripts
   Plain JavaScript, no libraries. Each feature lives in its own function
   and is started at the bottom of this file.

   Features:
   1. Theme toggle (dark / light)
   2. Mobile navigation menu
   3. Navbar style on scroll
   4. Active navigation link
   5. Scroll reveal
   6. Typing animation in the hero
   7. Project filtering
   8. Back-to-top button
   9. Contact form validation (mailto)
   10. Footer year
   ========================================================================== */

'use strict';

/* Visitors who prefer less motion get no typing or reveal animation */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* --------------------------------------------------------------------------
   1. THEME TOGGLE
   The saved theme is applied in <head> (index.html) before the page paints.
   This function handles the button and saving the choice.
   -------------------------------------------------------------------------- */
function initThemeToggle() {
  const root = document.documentElement;
  const button = document.getElementById('theme-toggle');
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (!button) return;

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    if (metaTheme) metaTheme.setAttribute('content', theme === 'dark' ? '#0f1218' : '#f7f8fb');
  }

  // Sync the button label with whatever theme is active on load
  applyTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

  button.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
      localStorage.setItem('portfolio-theme', next);
    } catch (error) {
      /* Storage can be blocked (private mode). The theme still changes for this visit. */
    }
  });
}


/* --------------------------------------------------------------------------
   2. MOBILE NAVIGATION MENU
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const list = document.getElementById('nav-list');
  if (!toggle || !list) return;

  function setOpen(isOpen) {
    list.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  }

  toggle.addEventListener('click', () => {
    setOpen(!list.classList.contains('is-open'));
  });

  // Close the menu after choosing a link
  list.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  // Close with the Escape key and return focus to the button
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && list.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  // If the window grows to desktop size, reset the menu
  window.matchMedia('(min-width: 901px)').addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}


/* --------------------------------------------------------------------------
   3. NAVBAR STYLE ON SCROLL
   Adds a border and shadow once the page is scrolled.
   -------------------------------------------------------------------------- */
function initNavbarScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  function update() {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
}


/* --------------------------------------------------------------------------
   4. ACTIVE NAVIGATION LINK
   Highlights the nav link of the section currently in view.
   -------------------------------------------------------------------------- */
function initActiveLink() {
  const links = Array.from(document.querySelectorAll('.nav__link'));
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  if (!sections.length || !('IntersectionObserver' in window)) return;

  function setActive(id) {
    links.forEach((link) => {
      const isMatch = link.getAttribute('href') === '#' + id;
      link.classList.toggle('is-active', isMatch);
      if (isMatch) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  // The "detection band" is a thin strip near the top-middle of the screen
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-35% 0px -60% 0px' });

  sections.forEach((section) => observer.observe(section));

  // At the very top of the page (hero), nothing is highlighted
  window.addEventListener('scroll', () => {
    if (window.scrollY < 200) setActive('');
  }, { passive: true });
}


/* --------------------------------------------------------------------------
   5. SCROLL REVEAL
   Elements with class "reveal" fade in once when they enter the screen.
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  // No animation support or reduced motion: show everything immediately
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);   // animate only once
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach((item) => observer.observe(item));
}


/* --------------------------------------------------------------------------
   6. TYPING ANIMATION (hero)
   Types a short phrase, pauses, deletes it, then types the next one.
   Edit the phrases below. Keep them honest and short.
   -------------------------------------------------------------------------- */
function initTyping() {
  const target = document.getElementById('typed');
  if (!target || prefersReducedMotion) return;   // keeps the static text from the HTML

  const phrases = [
    'Java Backend Developer in Progress',
    'Spring Boot & REST APIs',
    'Learning DSA & CS fundamentals'
  ];
  const typeSpeed = 55;      // ms per character while typing
  const deleteSpeed = 30;    // ms per character while deleting
  const pauseAfterTyping = 2200;
  const pauseAfterDeleting = 400;

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function tick() {
    const phrase = phrases[phraseIndex];

    if (isDeleting) {
      charIndex -= 1;
    } else {
      charIndex += 1;
    }
    target.textContent = phrase.slice(0, charIndex);

    let delay = isDeleting ? deleteSpeed : typeSpeed;

    if (!isDeleting && charIndex === phrase.length) {
      isDeleting = true;
      delay = pauseAfterTyping;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = pauseAfterDeleting;
    }

    setTimeout(tick, delay);
  }

  // Start by pausing on the first phrase (already in the HTML), then delete it
  charIndex = phrases[0].length;
  isDeleting = true;
  setTimeout(tick, pauseAfterTyping);
}


/* --------------------------------------------------------------------------
   7. PROJECT FILTERING
   Buttons use data-filter. Cards use data-status.
   "upcoming" (the coming-soon card) only appears under "All".
   -------------------------------------------------------------------------- */
function initProjectFilter() {
  const buttons = document.querySelectorAll('.filter');
  const cards = document.querySelectorAll('.project');
  const status = document.getElementById('filter-status');
  if (!buttons.length || !cards.length) return;

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      let shown = 0;

      buttons.forEach((b) => {
        const isActive = b === button;
        b.classList.toggle('is-active', isActive);
        b.setAttribute('aria-pressed', String(isActive));
      });

      cards.forEach((card) => {
        const match = filter === 'all' || card.dataset.status === filter;
        card.hidden = !match;
        if (match && card.dataset.status !== 'upcoming') shown += 1;
      });

      // Announce the result to screen readers
      if (status) {
        status.textContent = 'Showing ' + shown + (shown === 1 ? ' project' : ' projects');
      }
    });
  });
}



/* --------------------------------------------------------------------------
   8. BACK-TO-TOP BUTTON
   -------------------------------------------------------------------------- */
function initBackToTop() {
  const button = document.getElementById('to-top');
  if (!button) return;

  function update() {
    button.classList.toggle('is-visible', window.scrollY > 600);
  }

  update();
  window.addEventListener('scroll', update, { passive: true });

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}


/* --------------------------------------------------------------------------
   9. CONTACT FORM
   Validates the fields, then opens the visitor's email app with the message
   filled in (mailto). There is no backend and nothing is stored.

   To switch to Formspree instead, follow the steps in the comment above the
   <form> in index.html, and delete the block marked "MAILTO BLOCK" below.
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const status = document.getElementById('form-status');
  const fields = {
    name: form.elements['name'],
    email: form.elements['email'],
    message: form.elements['message']
  };

  // Returns an error message, or '' if the value is fine
  const validators = {
    name(value) {
      return value.trim().length >= 2 ? '' : 'Please enter your name (at least 2 characters).';
    },
    email(value) {
      const looksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
      return looksValid ? '' : 'Please enter a valid email address, like name@example.com.';
    },
    message(value) {
      return value.trim().length >= 10 ? '' : 'Please write a message of at least 10 characters.';
    }
  };

  function showError(key, text) {
    const field = fields[key];
    const error = document.getElementById(key + '-error');
    field.closest('.field').classList.toggle('has-error', Boolean(text));
    field.setAttribute('aria-invalid', text ? 'true' : 'false');
    error.textContent = text;
  }

  function validateField(key) {
    const text = validators[key](fields[key].value);
    showError(key, text);
    return text === '';
  }

  // Re-check a field when the user leaves it, and clear errors as they fix them
  Object.keys(fields).forEach((key) => {
    fields[key].addEventListener('blur', () => validateField(key));
    fields[key].addEventListener('input', () => {
      if (fields[key].closest('.field').classList.contains('has-error')) validateField(key);
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    status.textContent = '';

    const results = Object.keys(fields).map(validateField);
    if (results.includes(false)) {
      // Move focus to the first field with a problem
      const firstInvalid = Object.keys(fields).find((key) => validators[key](fields[key].value) !== '');
      if (firstInvalid) fields[firstInvalid].focus();
      return;
    }

    /* ----- MAILTO BLOCK (delete this block if you switch to Formspree) ----- */
    const to = form.dataset.email;
    const subject = 'Portfolio message from ' + fields.name.value.trim();
    const body = fields.message.value.trim() + '\n\nFrom: ' + fields.name.value.trim() + ' (' + fields.email.value.trim() + ')';
    window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    status.textContent = 'Your email app should open with the message ready to send. If it does not, email ' + to + ' directly.';
    /* ----- END MAILTO BLOCK ----- */
  });
}


/* --------------------------------------------------------------------------
   10. FOOTER YEAR
   -------------------------------------------------------------------------- */
function initFooterYear() {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
}


/* --------------------------------------------------------------------------
   START EVERYTHING
   The script tag uses "defer", so the HTML is already parsed here.
   -------------------------------------------------------------------------- */
initThemeToggle();
initMobileNav();
initNavbarScroll();
initActiveLink();
initScrollReveal();
initTyping();
initPlaceholderLinks();
initBackToTop();
initContactForm();
initFooterYear();
