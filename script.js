const track = document.getElementById('cardTrack');
const arrowLeft = document.getElementById('arrowLeft');
const arrowRight = document.getElementById('arrowRight');
const dots = document.querySelectorAll('.slider-dots .dot');

function getStep() {
    const maxScroll = getMaxScroll();
    const numSteps = dots.length - 1;
    return numSteps > 0 ? maxScroll / numSteps : maxScroll;
}

function getMaxScroll() {
    return track.scrollWidth - track.clientWidth;
}

arrowRight.addEventListener('click', () => {
    const step = getStep();
    const maxScroll = getMaxScroll();
    if (track.scrollLeft >= maxScroll - 15) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
        track.scrollTo({ left: track.scrollLeft + step, behavior: 'smooth' });
    }
});

arrowLeft.addEventListener('click', () => {
    const step = getStep();
    const maxScroll = getMaxScroll();
    if (track.scrollLeft <= 15) {
        track.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
        track.scrollTo({ left: track.scrollLeft - step, behavior: 'smooth' });
    }
});

function updateActiveDot() {
    const maxScroll = getMaxScroll();
    if (maxScroll <= 0) return;

    const progress = Math.min(1, Math.max(0, track.scrollLeft / maxScroll));
    const index = Math.round(progress * (dots.length - 1));

    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
}

track.addEventListener('scroll', updateActiveDot);

// Initial check on load
updateActiveDot();

dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
        const maxScroll = getMaxScroll();
        const targetScroll = (i / (dots.length - 1)) * maxScroll;
        track.scrollTo({ left: targetScroll, behavior: 'smooth' });
    });
});

// Interactive mouse grid spotlight for Hero and Section-Why
const gridSections = document.querySelectorAll('.hero-section, .section-why');
gridSections.forEach((section) => {
    let ticking = false;
    section.addEventListener('mousemove', (e) => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const rect = section.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                section.style.setProperty('--mouse-x', `${x}px`);
                section.style.setProperty('--mouse-y', `${y}px`);
                section.style.setProperty('--spotlight-opacity', '1');
                ticking = false;
            });
            ticking = true;
        }
    });

    section.addEventListener('mouseleave', () => {
        section.style.setProperty('--spotlight-opacity', '0');
    });
});

// Mobile navigation burger menu toggle
const burgerBtn = document.getElementById('burgerBtn');
const mainNav = document.getElementById('mainNav');

if (burgerBtn && mainNav) {
    burgerBtn.addEventListener('click', () => {
        burgerBtn.classList.toggle('active');
        mainNav.classList.toggle('active');
    });

    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            burgerBtn.classList.remove('active');
            mainNav.classList.remove('active');
        });
    });
}

// Solutions tab switching logic
const tabItems = document.querySelectorAll('.tabs__item');
const tabContents = document.querySelectorAll('.tab-content');

if (tabItems.length > 0 && tabContents.length > 0) {
    tabItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.getAttribute('data-tab');

            tabItems.forEach(tab => tab.classList.remove('tabs__item--active'));
            item.classList.add('tabs__item--active');

            tabContents.forEach(content => {
                if (content.getAttribute('data-tab-content') === targetTab) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });
}

// Intersection Observer for Scroll Reveal Animations
const revealElements = document.querySelectorAll('.reveal-on-scroll');

if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
}