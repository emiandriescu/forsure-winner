// JavaScript pentru site-ul SOWILO SRL

// Funcționalitate pentru scroll smooth la click pe link-uri de navigare
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        window.scrollTo({
            top: targetElement.offsetTop - 70, // Compensare pentru header fix
            behavior: 'smooth'
        });
    });
});

// Funcționalitate pentru formularul de contact
document.querySelector('.contact form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Obține valorile din formular
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;
    
    // Aici ar putea fi adăugată logica pentru trimiterea efectivă a datelor
    console.log('Formular trimis:', { name, email, phone, message });
    
    // Mesaj de confirmare
    alert('Mulțumim pentru mesajul dumneavoastră! Vom reveni în cel mai scurt timp.');
    
    // Resetează formularul
    this.reset();
});

// Adaugă efecte la scroll pentru animația cardurilor de servicii
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observă cardurile de servicii
document.querySelectorAll('.service-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
});

// Adaugă un efect de parallax ușor pentru hero
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    const hero = document.querySelector('.hero');
    
    if (hero) {
        hero.style.backgroundPositionY = rate + 'px';
    }
});