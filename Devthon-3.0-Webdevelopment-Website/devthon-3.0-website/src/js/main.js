document.addEventListener('DOMContentLoaded', function() {
    // Preloader is handled by inline script, just trigger animations after a delay
    setTimeout(() => {
        triggerHeroAnimations();
    }, 100);
    
    // Modern Tech Preloader with interactive loading (backup if inline script fails)
    const preloader = document.getElementById('preloader');
    const mainContent = document.querySelector('.hero-section');
    const loadingPercentage = document.getElementById('loading-percentage');
    const progressFill = document.querySelector('.progress-fill');
    
    // Skip preloader logic if it's already handled by inline script
    if (preloader && preloader.style.display === 'none') {
        return;
    }
    
    if (preloader && preloader.style.opacity === '1') {
        // Add body class to prevent scrolling during preloader
        document.body.classList.add('preloader-active');
        
        // Initially hide main content to prevent flash
        if (mainContent) {
            mainContent.style.visibility = 'hidden';
            mainContent.style.opacity = '0';
        }
        
        // Professional loading messages
        const loadingMessages = [
            'INITIALIZING SYSTEM',
            'LOADING FRAMEWORKS',
            'ESTABLISHING CONNECTIONS',
            'PREPARING ENVIRONMENT',
            'OPTIMIZING PERFORMANCE',
            'SYSTEM READY'
        ];
        
        let currentMessage = 0;
        let progress = 0;
        
        // Get status text element
        const statusText = document.getElementById('status-text');
        
        // Animate loading percentage and progress
        const loadingInterval = setInterval(() => {
            progress += Math.random() * 12 + 3; // Random increment between 3-15
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(loadingInterval);
                
                // Final message
                if (statusText) {
                    statusText.textContent = loadingMessages[loadingMessages.length - 1];
                }
                
                // Start fade out after reaching 100%
                setTimeout(() => {
                    startPreloaderFadeOut();
                }, 1000);
            }
            
            // Update percentage display
            if (loadingPercentage) {
                loadingPercentage.textContent = Math.floor(progress);
            }
            
            // Update progress bar
            if (progressFill) {
                progressFill.style.width = progress + '%';
            }
            
            // Update status message
            if (statusText && progress > 0) {
                const messageIndex = Math.min(Math.floor(progress / 20), loadingMessages.length - 2);
                if (messageIndex !== currentMessage && messageIndex < loadingMessages.length - 1) {
                    currentMessage = messageIndex;
                    statusText.style.opacity = '0';
                    setTimeout(() => {
                        statusText.textContent = loadingMessages[messageIndex];
                        statusText.style.opacity = '1';
                    }, 150);
                }
            }
        }, 120 + Math.random() * 80); // Random interval between 120-200ms
        
        function startPreloaderFadeOut() {
            // Start fading out preloader
            preloader.style.opacity = '0';
            
            // Show main content as preloader fades
            if (mainContent) {
                mainContent.style.visibility = 'visible';
                mainContent.style.opacity = '1';
                mainContent.style.transition = 'opacity 0.8s ease-in-out';
            }
            
            // Remove body class to enable scrolling
            document.body.classList.remove('preloader-active');
            
            setTimeout(function() {
                preloader.style.display = 'none';
                
                // Trigger hero animations
                triggerHeroAnimations();
            }, 800);
        }
        
    } else {
        // If no preloader, ensure content is visible
        if (mainContent) {
            mainContent.style.visibility = 'visible';
            mainContent.style.opacity = '1';
        }
        triggerHeroAnimations();
    }
    
    function triggerHeroAnimations() {
        // Animate hero title letters
        animateHeroTitle();
        
        // Initialize counter animations
        initCounters();
        
        // Initialize navbar scroll behavior
        initNavbarScroll();
    }

    // Smooth scrolling for navigation links (only on same page)
    const navLinks = document.querySelectorAll('.nav-link:not(.register-nav-btn)');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Check if it's a same-page anchor (starts with # only)
            if (targetId.startsWith('#') && !targetId.includes('index.html')) {
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    e.preventDefault();
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
            // If it contains 'index.html', let it navigate normally (don't prevent default)
        });
    });

    // Registration button handlers - redirect to registration page in same window
    const registerButton = document.getElementById('register-button');
    const registerNavBtn = document.querySelector('.register-nav-btn');
    
    if (registerButton) {
        registerButton.addEventListener('click', function() {
            window.location.href = './pages/registration.html';
        });
    }
    
    if (registerNavBtn) {
        registerNavBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = './pages/registration.html';
        });
    }

    // Initialize floating icons animation
    const floatingIcons = document.querySelectorAll('.floating-icon');
    floatingIcons.forEach((icon, index) => {
        icon.style.animationDelay = `${index * 0.5}s`;
    });

    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const heroSection = document.querySelector('.hero-section');
        
        if (heroSection) {
            const rate = scrolled * -0.5;
            heroSection.style.transform = `translateY(${rate}px)`;
        }
    });
    
    // Mobile menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        // Handle both click and touch events
        const toggleMenu = function(e) {
            e.preventDefault();
            e.stopPropagation();
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        };
        
        navToggle.addEventListener('click', toggleMenu);
        navToggle.addEventListener('touchstart', toggleMenu, { passive: false });

        // Close menu when clicking on a nav link
        const navMenuLinks = document.querySelectorAll('.nav-link');
        navMenuLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }
    
    // Helper functions

    function animateHeroTitle() {
        const heroTitle = document.querySelector('.hero-title');
        
        if (heroTitle) {
            heroTitle.style.opacity = '0';
            heroTitle.style.transform = 'translateY(30px)';
            heroTitle.style.transition = 'all 1s ease-out';
            
            setTimeout(() => {
                heroTitle.style.opacity = '1';
                heroTitle.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    function initCounters() {
        const counters = document.querySelectorAll('.stat-number[data-count]');
        
        const animateCounter = (counter) => {
            const target = parseInt(counter.getAttribute('data-count'));
            const current = parseInt(counter.textContent);
            const increment = target / 100;
            
            if (current < target) {
                counter.textContent = Math.ceil(current + increment);
                requestAnimationFrame(() => animateCounter(counter));
            } else {
                counter.textContent = target;
            }
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => {
            observer.observe(counter);
        });
    }

    function initNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        
        if (!navbar) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(0, 0, 0, 0.95)';
                navbar.style.backdropFilter = 'blur(20px)';
            } else {
                navbar.style.background = '#000000';
                navbar.style.backdropFilter = 'blur(10px)';
            }
        });
    }

    // Advanced Tech Cursor System
    function initCustomCursor() {
        // Create cursor elements
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        const follower = document.createElement('div');
        follower.className = 'cursor-follower';
        
        document.body.appendChild(cursor);
        document.body.appendChild(follower);
        
        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;
        let followerX = 0, followerY = 0;
        let lastX = 0, lastY = 0;
        
        // Particle trail system
        let particleCount = 0;
        const maxParticles = 50;
        const particles = [];
        
        function createParticle(x, y) {
            if (particleCount >= maxParticles) return;
            
            const particle = document.createElement('div');
            particle.className = 'cursor-particle';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            
            document.body.appendChild(particle);
            particles.push(particle);
            particleCount++;
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                    particles.splice(particles.indexOf(particle), 1);
                    particleCount--;
                }
            }, 800);
        }
        
        let particleTimer = 0;
        
        // Track mouse position and create particles
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Calculate movement speed
            const deltaX = mouseX - lastX;
            const deltaY = mouseY - lastY;
            const speed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            // Create particles based on speed
            if (speed > 2) {
                particleTimer++;
                if (particleTimer % 3 === 0) {
                    createParticle(mouseX, mouseY);
                }
            }
            
            lastX = mouseX;
            lastY = mouseY;
        });
        
        // Smooth cursor animation
        function animateCursor() {
            // Cursor follows mouse with easing
            const ease = 0.15;
            cursorX += (mouseX - cursorX) * ease;
            cursorY += (mouseY - cursorY) * ease;
            
            // Follower has more delay
            followerX += (mouseX - followerX) * 0.08;
            followerY += (mouseY - followerY) * 0.08;
            
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            follower.style.left = followerX + 'px';
            follower.style.top = followerY + 'px';
            
            requestAnimationFrame(animateCursor);
        }
        
        animateCursor();
        
        // Hover effects on interactive elements
        const hoverElements = document.querySelectorAll('a, button, .nav-link, .cta-button, input[type="submit"], .btn-next, .btn-prev, .btn-submit, .nav-toggle, .stat-item, .timeline-item, input[type="text"], input[type="email"], input[type="tel"], textarea, select');
        
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });
        
        // Click effect with ripple
        document.addEventListener('mousedown', (e) => {
            document.body.classList.add('cursor-click');
            
            // Create ripple effect
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    createParticle(e.clientX + Math.random() * 20 - 10, e.clientY + Math.random() * 20 - 10);
                }, i * 50);
            }
        });
        
        document.addEventListener('mouseup', () => {
            document.body.classList.remove('cursor-click');
        });
        
        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
            follower.style.opacity = '0';
        });
        
        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
            follower.style.opacity = '1';
        });
    }
    
    // Initialize custom cursor only on non-touch devices
    if (!('ontouchstart' in window) && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        initCustomCursor();
    } else {
        // Enable default cursor on touch devices
        document.body.style.cursor = 'auto';
        document.querySelectorAll('*').forEach(el => {
            el.style.cursor = 'auto';
        });
    }
});