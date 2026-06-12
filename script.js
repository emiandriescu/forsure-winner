/* ════════════════════════════════════════════════
   SOWILO — interacțiuni & animații (GSAP)
   ════════════════════════════════════════════════ */
(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const hasGSAP      = typeof gsap !== 'undefined';

    if (hasGSAP) gsap.registerPlugin(ScrollTrigger, SplitText);

    /* ── Navbar: shadow + hide on scroll down ───── */
    const navbar = document.getElementById('navbar');
    const progress = document.getElementById('scrollProgress');
    let lastY = 0;

    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        const total = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = (total > 0 ? (y / total) * 100 : 0) + '%';
        navbar.classList.toggle('scrolled', y > 24);
        navbar.classList.toggle('nav-hidden', y > 400 && y > lastY);
        lastY = y;
    }, { passive: true });

    /* ── Mobile menu ─────────────────────────────── */
    const navToggle  = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    function closeMenu() {
        navToggle.classList.remove('open');
        mobileMenu.classList.remove('open');
        navbar.classList.remove('menu-open');
        navToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
    navToggle.addEventListener('click', () => {
        const open = !mobileMenu.classList.contains('open');
        navToggle.classList.toggle('open', open);
        mobileMenu.classList.toggle('open', open);
        navbar.classList.toggle('menu-open', open);
        navToggle.setAttribute('aria-expanded', String(open));
        mobileMenu.setAttribute('aria-hidden', String(!open));
        document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

    /* ── Custom cursor ───────────────────────────── */
    if (finePointer && !reduceMotion && hasGSAP) {
        const dot  = document.getElementById('cursorDot');
        const ring = document.getElementById('cursorRing');
        const dotX  = gsap.quickTo(dot,  'x', { duration: .08, ease: 'power2.out' });
        const dotY  = gsap.quickTo(dot,  'y', { duration: .08, ease: 'power2.out' });
        const ringX = gsap.quickTo(ring, 'x', { duration: .35, ease: 'power2.out' });
        const ringY = gsap.quickTo(ring, 'y', { duration: .35, ease: 'power2.out' });
        gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

        window.addEventListener('mousemove', e => {
            dotX(e.clientX);  dotY(e.clientY);
            ringX(e.clientX); ringY(e.clientY);
        }, { passive: true });

        document.querySelectorAll('[data-hover]').forEach(el => {
            el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
            el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
        });
    }

    /* ── Magnetic buttons ────────────────────────── */
    if (finePointer && !reduceMotion && hasGSAP) {
        document.querySelectorAll('.magnetic').forEach(btn => {
            const strength = 22;
            btn.addEventListener('mousemove', e => {
                const r = btn.getBoundingClientRect();
                const x = ((e.clientX - r.left) / r.width  - .5) * strength;
                const y = ((e.clientY - r.top)  / r.height - .5) * strength;
                gsap.to(btn, { x, y, duration: .35, ease: 'power2.out' });
            });
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, { x: 0, y: 0, duration: .5, ease: 'elastic.out(1, .45)' });
            });
        });
    }

    /* ── Hero intro (după încărcarea fonturilor) ── */
    if (hasGSAP && !reduceMotion) {
        gsap.set('.hero-inner, .hero-stats, .hero-fig', { autoAlpha: 0 });

        const runHeroIntro = () => {
            gsap.set('.hero-inner, .hero-stats, .hero-fig', { autoAlpha: 1 });
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            try {
                const split = new SplitText('#heroTitle', { type: 'lines,words', linesClass: 'st-line' });
                split.lines.forEach(l => { l.style.overflow = 'hidden'; l.style.display = 'block'; });
                tl.from(split.words, { yPercent: 115, duration: 1.05, stagger: .035 }, .15);
            } catch (e) {
                tl.from('#heroTitle', { y: 40, autoAlpha: 0, duration: 1 }, .15);
            }

            tl.from('.hero-kicker', { y: 18, autoAlpha: 0, duration: .7 }, .1)
              .from('.hero-sub',    { y: 24, autoAlpha: 0, duration: .8 }, '-=.55')
              .from('.hero-btns .btn', { y: 22, autoAlpha: 0, duration: .7, stagger: .09 }, '-=.5')
              .from('.hero-stats .stat', { y: 26, autoAlpha: 0, duration: .7, stagger: .08 }, '-=.45')
              .from('.hero-fig', { autoAlpha: 0, duration: .9 }, '-=.3');
        };

        if (document.fonts && document.fonts.ready) {
            // plasă de siguranță: pornește oricum după 1.2s dacă fonturile întârzie
            let started = false;
            const startOnce = () => { if (!started) { started = true; runHeroIntro(); } };
            Promise.all([
                document.fonts.load('700 1em "Space Grotesk"'),
                document.fonts.ready
            ]).then(startOnce).catch(startOnce);
            setTimeout(startOnce, 1200);
        } else {
            runHeroIntro();
        }
    }

    /* ── Counters ────────────────────────────────── */
    function runCounter(el) {
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix ? '<' : '';
        const obj = { v: 0 };
        if (hasGSAP && !reduceMotion) {
            gsap.to(obj, {
                v: target, duration: 1.8, ease: 'power3.out',
                onUpdate: () => { el.textContent = prefix + Math.round(obj.v) + suffix; }
            });
        } else {
            el.textContent = prefix + target + suffix;
        }
    }
    const counterIO = new IntersectionObserver(entries => {
        entries.forEach(en => {
            if (en.isIntersecting) { runCounter(en.target); counterIO.unobserve(en.target); }
        });
    }, { threshold: .5 });
    document.querySelectorAll('.stat-num[data-target]').forEach(el => counterIO.observe(el));

    /* ── Scroll reveals ──────────────────────────── */
    if (hasGSAP && !reduceMotion) {
        gsap.utils.toArray('[data-reveal]').forEach(el => {
            gsap.from(el, {
                y: 44, autoAlpha: 0, duration: .9, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 88%', once: true }
            });
        });

        gsap.from('.domain-row', {
            y: 36, autoAlpha: 0, duration: .7, ease: 'power3.out', stagger: .07,
            scrollTrigger: { trigger: '.domains-list', start: 'top 85%', once: true }
        });

        /* Marquee scrub: viteza crește ușor la scroll */
        gsap.to('.marquee-track', {
            xPercent: -8, ease: 'none',
            scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: 1 }
        });
    }

    /* ── Contact form (mailto) ───────────────────── */
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    if (contactForm) {
        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            const v = id => document.getElementById(id).value;
            const subject = encodeURIComponent(`Ofertă proiectare — ${v('project')} — ${v('company')}`);
            const body = encodeURIComponent(
                `Nume: ${v('name')}\nFirmă: ${v('company')}\nEmail: ${v('email')}\nTelefon: ${v('phone')}\nTip proiect: ${v('project')}\n\nDetalii proiect:\n${v('message')}`
            );
            window.location.href = `mailto:office@sowilo.ro?subject=${subject}&body=${body}`;
            contactForm.style.display = 'none';
            formSuccess.style.display = 'block';
        });
    }

    /* ── PDF previews (pdf.js) ───────────────────── */
    function renderPdfPreviews() {
        if (typeof window.pdfjsLib === 'undefined' && !window['pdfjs-dist/build/pdf']) return;
        const lib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
        lib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const docs = [
            { canvas: 'pdf-desfumare', loading: 'loading-desfumare', file: 'Autorizatie Desfumare - SOWILO.pdf' },
            { canvas: 'pdf-stingere',  loading: 'loading-stingere',  file: 'Autorizatie Stingere - SOWILO.pdf' },
            { canvas: 'pdf-idsai',     loading: 'loading-idsai',     file: 'Autorizatie IDSAI - SOWILO.pdf' },
            { canvas: 'pdf-anre',      loading: 'loading-anre',      file: 'Atestat ANRE SOWILO.pdf' },
        ];

        docs.forEach(({ canvas: canvasId, loading: loadingId, file }) => {
            lib.getDocument(file).promise
                .then(pdf => pdf.getPage(1))
                .then(page => {
                    const canvas    = document.getElementById(canvasId);
                    const loading   = document.getElementById(loadingId);
                    const container = canvas.parentElement;
                    const scale     = (container.offsetWidth || 300) / page.getViewport({ scale: 1 }).width;
                    const viewport  = page.getViewport({ scale: Math.min(scale * 1.4, 2) });
                    canvas.width  = viewport.width;
                    canvas.height = viewport.height;
                    return page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
                        .then(() => { if (loading) loading.style.display = 'none'; });
                })
                .catch(() => {
                    const loading = document.getElementById(loadingId);
                    if (loading) loading.querySelector('span').textContent = 'apasă „vezi document" ↗';
                });
        });
    }

    /* Lazy: randează PDF-urile abia când secțiunea se apropie */
    const certsSection = document.getElementById('autorizatii');
    if (certsSection) {
        const certIO = new IntersectionObserver(entries => {
            if (entries.some(e => e.isIntersecting)) {
                renderPdfPreviews();
                certIO.disconnect();
            }
        }, { rootMargin: '600px' });
        certIO.observe(certsSection);
    }
})();
