document.addEventListener('DOMContentLoaded', function() {
    // Modern Tech Preloader with interactive loading
    const preloader = document.getElementById('preloader');
    const mainContent = document.querySelector('.hero-section');
    const loadingPercentage = document.getElementById('loading-percentage');
    const progressFill = document.querySelector('.progress-fill');
    
    if (preloader) {
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
                console.log('Modern preloader removed, homepage should be visible');
                
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

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link:not(.register-nav-btn)');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Registration button handlers - redirect to registration page in same window
    const registerButton = document.getElementById('register-button');
    const registerNavBtn = document.querySelector('.register-nav-btn');
    
    if (registerButton) {
        registerButton.addEventListener('click', function() {
            window.location.href = 'pages/registration.html';
        });
    }
    
    if (registerNavBtn) {
        registerNavBtn.addEventListener('click', function() {
            window.location.href = 'pages/registration.html';
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
});

// Animate hero title function
function animateHeroTitle() {
    const heroTitle = document.querySelector('.hero-title');
    console.log('Hero title element:', heroTitle);
    
    if (heroTitle) {
        console.log('Original HTML:', heroTitle.innerHTML);
        
        // Simple fade-in animation without breaking HTML structure
        heroTitle.style.opacity = '0';
        heroTitle.style.transform = 'translateY(30px)';
        heroTitle.style.transition = 'all 1s ease-out';
        
        // Trigger animation after a delay
        setTimeout(() => {
            heroTitle.style.opacity = '1';
            heroTitle.style.transform = 'translateY(0)';
            console.log('Animation triggered, final HTML:', heroTitle.innerHTML);
        }, 800);
        
        // Removed the excessive pulse animation and shine effects
        // Simple fade-in is enough without extra animations
    } else {
        console.error('Hero title element not found!');
    }
}

// Counter animation function
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
    });

    counters.forEach(counter => {
        observer.observe(counter);
    });
}

// Navbar scroll behavior
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    
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