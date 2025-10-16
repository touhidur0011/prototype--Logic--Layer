document.addEventListener('DOMContentLoaded', function() {
        
    // --- INITIALIZE LIBRARIES ---
    lucide.createIcons();
    gsap.registerPlugin(ScrollTrigger);

    // --- LOADING SCREEN ---
    const loadingScreen = document.getElementById('loading-screen');
    const progressBar = document.getElementById('progress-bar');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 100) progress = 100;
        progressBar.style.width = progress + '%';
        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                document.body.style.overflow = '';
            }, 500);
        }
    }, 200);

    // --- NAVIGATION BAR LOGIC ---
    const header = document.getElementById('header');
    const hamburger = document.getElementById('hamburger-menu');
    const mobileNav = document.getElementById('mobile-nav');
    const navLinks = document.querySelectorAll('.nav-links a');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        if (window.scrollY > lastScrollY && window.scrollY > 200) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }
        lastScrollY = window.scrollY;
    });
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileNav.classList.toggle('open');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileNav.classList.contains('open')) {
                hamburger.classList.remove('open');
                mobileNav.classList.remove('open');
            }
        });
    });

    // Active nav link highlighting on scroll
    const sections = document.querySelectorAll('section');
    const observerOptions = { root: null, rootMargin: "0px", threshold: 0.5 };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                document.querySelectorAll('.nav-links a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });


    // --- SMOOTH SCROLL (account for fixed header) ---
    // Attach smooth scrolling to all internal anchor links and account for header height
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    function smoothScrollTo(hash) {
        const target = document.querySelector(hash);
        if (!target) return;
        const headerHeight = header.offsetHeight || 0;
        const targetY = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12; // small gap
        window.scrollTo({ top: targetY, behavior: 'smooth' });
    }

    internalLinks.forEach(a => {
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                if (mobileNav.classList.contains('open')) {
                    hamburger.classList.remove('open');
                    mobileNav.classList.remove('open');
                }
                smoothScrollTo(href);
            }
        });
    });

    // --- THREE.JS HERO BACKGROUND ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('hero-canvas'),
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particles = [];
    const particleCount = 80;
    const geometries = [
        new THREE.SphereGeometry(0.5, 16, 16),
        new THREE.BoxGeometry(0.8, 0.8, 0.8),
        new THREE.TetrahedronGeometry(0.7)
    ];

    for (let i = 0; i < particleCount; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
            wireframe: true,
        });
        const particle = new THREE.Mesh(geometry, material);
        particle.position.set(
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 50
        );
        particle.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        particles.push(particle);
        scene.add(particle);
    }
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    camera.position.z = 30;
    
    const mouse = new THREE.Vector2();
    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    const clock = new THREE.Clock();
    function animate() {
        const elapsedTime = clock.getElapsedTime();
        particles.forEach(p => {
            p.rotation.x += 0.001;
            p.rotation.y += 0.002;
        });
        
        camera.position.x += (mouse.x * 5 - camera.position.x) * 0.05;
        camera.position.y += (mouse.y * 5 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });


    // --- GSAP SCROLL-TRIGGERED ANIMATIONS ---
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => {
        gsap.fromTo(el,
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                }
            }
        );
    });
    
    // Staggered animation for service cards
    gsap.from(".service-card", {
        scrollTrigger: {
            trigger: ".services-grid",
            start: "top 80%",
        },
        opacity: 0,
        y: 50,
        stagger: 0.2,
        duration: 0.6
    });


    // --- STATISTICS COUNTER ANIMATION ---
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target') || 0;
        const obj = { val: 0 };
        ScrollTrigger.create({
            trigger: counter,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                gsap.to(obj, {
                    duration: 2.2,
                    val: target,
                    ease: 'power1.out',
                    onUpdate: () => {
                        counter.innerText = Math.ceil(obj.val) + '+';
                    }
                });
            }
        });
    });

    // --- PORTFOLIO FILTERING ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filter = button.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    gsap.to(card, { opacity: 1, scale: 1, duration: 0.4 });
                    card.style.display = 'block';
                } else {
                    gsap.to(card, { opacity: 0, scale: 0.8, duration: 0.4, onComplete: () => {
                        card.style.display = 'none';
                    }});
                }
            });
        });
    });


    // --- TESTIMONIAL SLIDER ---
    const track = document.querySelector('.testimonial-track');
    const slides = Array.from(track.children);
    const dotsNav = document.querySelector('.slider-dots');
    let currentIndex = 0;

    // Ensure first slide is active
    slides.forEach((slide, i) => {
        if (i === 0) slide.classList.add('active');
        // create dots
        const dot = document.createElement('button');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dotsNav.appendChild(dot);

        dot.addEventListener('click', () => {
            goToSlide(i);
        });
    });

    function goToSlide(index) {
        // translate using percentage (consistent)
        track.style.transform = `translateX(-${index * 100}%)`;
        
        // Update active states with a delay for smooth transition
        slides.forEach((s, i) => {
            s.classList.remove('active');
            setTimeout(() => {
                if (i === index) s.classList.add('active');
            }, 300);
        });
        
        // Update dots
        const currentDot = dotsNav.querySelector('.dot.active');
        if (currentDot) currentDot.classList.remove('active');
        dotsNav.children[index].classList.add('active');
        currentIndex = index;
    }

    function autoSlide() {
        const next = (currentIndex + 1) % slides.length;
        goToSlide(next);
    }

    // Initialize first slide as active
    slides[0].classList.add('active');
    let slideInterval = setInterval(autoSlide, 8000);

    // Pause on hover and resume
    track.addEventListener('mouseenter', () => clearInterval(slideInterval));
    track.addEventListener('mouseleave', () => slideInterval = setInterval(autoSlide, 6000));

    // --- CONTACT FORM LOGIC ---
    const form = document.getElementById('contact-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;

        // Simulate form submission
        setTimeout(() => {
            submitButton.textContent = 'Message Sent! ✔';
            submitButton.style.background = '#10b981';
            setTimeout(() => {
                submitButton.textContent = originalText;
                submitButton.style.background = '';
                submitButton.disabled = false;
                form.reset();
            }, 3000);
        }, 1500);
    });

    // --- GLOBAL INTERACTIONS ---
    const scrollProgressBarFill = document.querySelector('.scroll-progress-bar-fill');
    window.addEventListener('scroll', () => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
        scrollProgressBarFill.style.width = `${scrolled}%`;
    });

    const backToTopButton = document.querySelector('.back-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
});