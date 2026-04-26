// ── SCROLL PROGRESS BAR ───────────────────────────
const scrollBar = document.createElement('div');
scrollBar.className = 'scroll-bar';
document.body.prepend(scrollBar);

// ── NAVBAR scroll shadow ──────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.body.scrollHeight - window.innerHeight;
    scrollBar.style.width = (scrolled / total * 100) + '%';
    navbar.classList.toggle('scrolled', scrolled > 20);
}, { passive: true });

// ── HAMBURGER menu ────────────────────────────────
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
});

mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
    });
});

// ── SMOOTH SCROLL ─────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 170, behavior: 'smooth' });
    });
});

// ── CONTACT FORM ──────────────────────────────────
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name    = document.getElementById('name').value;
        const company = document.getElementById('company').value;
        const email   = document.getElementById('email').value;
        const phone   = document.getElementById('phone').value;
        const project = document.getElementById('project').value;
        const message = document.getElementById('message').value;

        const subject = encodeURIComponent(`Ofertă MEP — ${project} — ${company}`);
        const body    = encodeURIComponent(
            `Nume: ${name}\nFirmă: ${company}\nEmail: ${email}\nTelefon: ${phone}\nTip Proiect: ${project}\n\nDetalii proiect:\n${message}`
        );
        window.location.href = `mailto:office@sowilo.ro?subject=${subject}&body=${body}`;
        contactForm.style.display = 'none';
        formSuccess.style.display = 'block';
    });
}

// ── COUNTER ANIMATION ─────────────────────────────
function animateCounter(el) {
    const target   = parseInt(el.dataset.target);
    const suffix   = el.dataset.suffix || '';
    const duration = 1800;
    const start    = performance.now();

    function update(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = Math.floor(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.6 });

document.querySelectorAll('.stat-num[data-target]').forEach(el => counterObserver.observe(el));

// ── INTERSECTION OBSERVER (fade-in variants + cards) ──
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right').forEach(el => observer.observe(el));

// Service cards — stagger
document.querySelectorAll('.service-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 70}ms`;
    observer.observe(card);
});

// Domain cards — stagger
document.querySelectorAll('.domain-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 50}ms`;
});

// Cert cards — stagger
document.querySelectorAll('.cert-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 100}ms`;
});
