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

// 3D Spherical Convex Lens Dome Grid Animation ("Горкой")
function initGridLens(sectionSelector, canvasSelector, glowRgb) {
    const section = document.querySelector(sectionSelector);
    const canvas = document.querySelector(canvasSelector);
    if (!section || !canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let mouseX = -1000;
    let mouseY = -1000;
    let targetOpacity = 0;
    let currentOpacity = 0;

    const gridSize = 70; // Matches base CSS grid (70px x 70px)
    const lensRadius = 220; // Radius of 3D lens dome
    const maxDisplacement = 38; // Max 3D displacement at center for 3D dome "горкой"

    function resize() {
        const rect = section.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        width = rect.width;
        height = rect.height;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
    }

    resize();
    window.addEventListener('resize', resize);

    section.addEventListener('mousemove', (e) => {
        const rect = section.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        targetOpacity = 1;
    });

    section.addEventListener('mouseleave', () => {
        targetOpacity = 0;
    });

    function getDisplacedPoint(x, y) {
        const dx = x - mouseX;
        const dy = y - mouseY;
        const dist = Math.hypot(dx, dy);

        if (dist >= lensRadius || dist === 0) {
            return { x, y };
        }

        // Spherical 3D dome curve: (1 - (dist / lensRadius)^2)^2
        // Equal to 0 at boundary (dist = lensRadius), equal to 1 at exact center (dist = 0)
        const factor = Math.pow(1 - Math.pow(dist / lensRadius, 2), 2);
        const push = maxDisplacement * factor;
        const normX = dx / dist;
        const normY = dy / dist;

        return {
            x: x + normX * push,
            y: y + normY * push
        };
    }

    function render() {
        currentOpacity += (targetOpacity - currentOpacity) * 0.1;

        ctx.clearRect(0, 0, width, height);

        if (currentOpacity > 0.005) {
            ctx.save();
            ctx.globalAlpha = currentOpacity;

            // 1. Draw Vertical 3D Curved Lines
            const step = 8;
            for (let x = 0; x <= width; x += gridSize) {
                ctx.beginPath();
                for (let y = 0; y <= height; y += step) {
                    const pt = getDisplacedPoint(x, y);
                    if (y === 0) {
                        ctx.moveTo(pt.x, pt.y);
                    } else {
                        ctx.lineTo(pt.x, pt.y);
                    }
                }
                ctx.strokeStyle = `rgba(${glowRgb}, 0.85)`;
                ctx.lineWidth = 1.8;
                ctx.stroke();
            }

            // 2. Draw Horizontal 3D Curved Lines
            for (let y = 0; y <= height; y += gridSize) {
                ctx.beginPath();
                for (let x = 0; x <= width; x += step) {
                    const pt = getDisplacedPoint(x, y);
                    if (x === 0) {
                        ctx.moveTo(pt.x, pt.y);
                    } else {
                        ctx.lineTo(pt.x, pt.y);
                    }
                }
                ctx.strokeStyle = `rgba(${glowRgb}, 0.85)`;
                ctx.lineWidth = 1.8;
                ctx.stroke();
            }

            // 3. Smooth Radial Mask Fade at Lens Edges
            ctx.globalCompositeOperation = 'destination-in';
            const maskGrad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, lensRadius);
            maskGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
            maskGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.85)');
            maskGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = maskGrad;
            ctx.fillRect(0, 0, width, height);

            ctx.restore();

            // 4. Soft Optical Lens Rim Glow
            ctx.save();
            ctx.globalAlpha = currentOpacity * 0.4;
            const lensGrad = ctx.createRadialGradient(mouseX, mouseY, lensRadius * 0.2, mouseX, mouseY, lensRadius);
            lensGrad.addColorStop(0, `rgba(${glowRgb}, 0.35)`);
            lensGrad.addColorStop(0.6, `rgba(${glowRgb}, 0.12)`);
            lensGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = lensGrad;
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, lensRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        requestAnimationFrame(render);
    }

    render();
}

// Initialize Hero orange 3D grid lens ("249, 115, 22")
initGridLens('.hero-section', '.hero-canvas', '249, 115, 22');

// Initialize Section Why cyan/blue 3D grid lens ("59, 130, 246")
initGridLens('.section-why', '.why-canvas', '59, 130, 246');

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