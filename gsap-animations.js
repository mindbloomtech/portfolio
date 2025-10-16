// GSAP Animations
document.addEventListener('DOMContentLoaded', () => {
    // Wait for GSAP to load
    const initGSAP = () => {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            setTimeout(initGSAP, 100);
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        // Dynamic favicon based on color scheme
        function updateFavicon() {
            const favicon = document.getElementById('favicon');
            const appleTouchIcon = document.getElementById('apple-touch-icon');
            const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

            if (isDarkMode) {
                favicon.href = 'Mindbloomtechlogo(white).png';
                appleTouchIcon.href = 'Mindbloomtechlogo(white).png';
            } else {
                favicon.href = 'Mindbloomtechlogo(violet).png';
                appleTouchIcon.href = 'Mindbloomtechlogo(violet).png';
            }
        }

        updateFavicon();
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateFavicon);

        // Mobile detection
        const isMobile = window.innerWidth < 768;

        // Text animations
        if (typeof SplitType !== 'undefined' && !isMobile) {
            const st = new SplitType('#hero-title', { types: 'lines, words' });
            gsap.from(st.lines, { y: 50, opacity: 0, stagger: 0.06, duration: 0.7, ease: 'power2.out' });

            const aboutSplit = new SplitType('#about-title', { types: 'lines, words' });
            gsap.from(aboutSplit.lines, {
                y: 40,
                opacity: 0,
                stagger: 0.04,
                duration: 0.7,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '#about',
                    start: 'top 70%',
                }
            });
        } else if (isMobile) {
            // Simple fade-in for mobile
            gsap.from('#hero-title', { opacity: 0, y: 20, duration: 0.8, ease: 'power2.out' });
            gsap.from('#about-title', {
                opacity: 0,
                y: 20,
                duration: 0.6,
                scrollTrigger: {
                    trigger: '#about',
                    start: 'top 80%',
                }
            });
        }

        // Card animations
        gsap.from('.card', {
            y: isMobile ? 20 : 30,
            opacity: 0,
            stagger: 0.1,
            duration: isMobile ? 0.6 : 0.9,
            ease: "power2.out",
            scrollTrigger: {
                trigger: '#services',
                start: 'top 80%',
            }
        });

        // Mobile menu functionality - make global for HTML onclick handlers
        window.toggleMobileMenu = function () {
            const nav = document.getElementById('mobile-nav');
            nav.classList.toggle('active');
        }

        window.closeMobileMenu = function () {
            const nav = document.getElementById('mobile-nav');
            nav.classList.remove('active');
        }
    };

    initGSAP();
});