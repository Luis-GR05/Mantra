(function() {
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  // Global Elements
  const preloader = $('#preloader');
  const cursorEl = $('.cursor');
  const followerEl = $('.cursor-follower');
  const hamburger = $('.hamburger');
  const navLinks = $('.nav-links');
  const mobileOverlay = $('.mobile-overlay');
  const filterBtns = $$('.filter-btn');
  const galleryItems = $$('.gallery-item');
  const bookingForm = $('#booking-form');
  const formSuccess = $('#form-success');
  const progressFill = $('.scroll-progress__fill');
  const lightbox = $('#lightbox');
  const lightboxImg = $('.lightbox-img');
  const lightboxClose = $('.lightbox-close');

  let isTouchDevice = false;

  function init() {
    setupPreloader();
    setupGSAP();
    setupCursor();
    setupNavigation();
    setupGallery();
    setupLightbox();
    setupBooking();
    setupTilt();
    setupHeroCanvas();
  }

  // 1. Preloader Handling
  function setupPreloader() {
    window.addEventListener('load', () => {
      if (preloader) {
        gsap.to(preloader, {
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          onComplete: () => {
            preloader.classList.add('hidden');
            // Trigger first section's CSS animations
            const heroSection = $('#hero');
            if (heroSection) heroSection.classList.add('is-active');
          }
        });
      } else {
        const heroSection = $('#hero');
        if (heroSection) heroSection.classList.add('is-active');
      }
    });

    // Fallback: hide preloader after 3 seconds if load event doesn't fire
    setTimeout(() => {
      if (preloader && !preloader.classList.contains('hidden')) {
        preloader.classList.add('hidden');
        const heroSection = $('#hero');
        if (heroSection) heroSection.classList.add('is-active');
      }
    }, 3000);
  }

  // 2. ScrollTrigger Section Animations
  function setupGSAP() {
    gsap.registerPlugin(ScrollTrigger);

    const sections = $$('.snap-section');
    const sideDots = $$('.side-dot');

    sections.forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top 60%",
        end: "bottom 40%",
        onToggle: (self) => {
          if (self.isActive) {
            section.classList.add('is-active');
            
            // Update side dot
            sideDots.forEach(dot => dot.classList.remove('active'));
            const targetDot = $(`.side-dot[data-section="${section.id}"]`);
            if (targetDot) targetDot.classList.add('active');
          }
        }
      });
    });

    // Scroll progress bar
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (progressFill) {
        progressFill.style.height = `${scrollPercent}%`;
      }
    });
  }

  // 3. Custom Cursor and Follower
  function setupCursor() {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      isTouchDevice = true;
      if (cursorEl) cursorEl.style.display = 'none';
      if (followerEl) followerEl.style.display = 'none';
      return;
    }

    window.addEventListener('mousemove', e => {
      gsap.to(cursorEl, { duration: 0.1, x: e.clientX, y: e.clientY, ease: "power2.out" });
      gsap.to(followerEl, { duration: 0.3, x: e.clientX, y: e.clientY, ease: "power2.out" });
    });

    // Hover interactions
    const interactiveSelectors = 'a, button, .artista-card, .gallery-item, input, select, textarea, [role="tab"]';
    $$(interactiveSelectors).forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorEl.classList.add('hover');
        followerEl.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        cursorEl.classList.remove('hover');
        followerEl.classList.remove('hover');
      });
    });
  }

  // 4. Smooth Navigation and Hamburger menu
  function setupNavigation() {
    if (hamburger && navLinks && mobileOverlay) {
      hamburger.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('mobile-open');
        hamburger.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', isOpen);
      });

      mobileOverlay.addEventListener('click', closeMobile);
      navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobile));
    }

    const sections = $$('.snap-section');

    function scrollToSection(idx) {
      closeMobile();
      const targetSection = sections[idx];
      if (targetSection) {
        gsap.to(window, { duration: 1.2, scrollTo: targetSection, ease: "power3.inOut" });
      }
    }

    // Scroll to section for nav links
    $$('.nav-links a, .nav-cta').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetIdx = Array.from(sections).findIndex(s => s.id === targetId);
        if (targetIdx !== -1) scrollToSection(targetIdx);
      });
    });

    // Scroll to section for side dots
    $$('.side-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = dot.getAttribute('href').substring(1);
        const targetIdx = Array.from(sections).findIndex(s => s.id === targetId);
        if (targetIdx !== -1) scrollToSection(targetIdx);
      });
    });

    // Scroll to section for CTAs
    $$('a[href^="#"]').forEach(anchor => {
      if (!anchor.classList.contains('side-dot') && !anchor.closest('.nav-links') && !anchor.classList.contains('nav-cta')) {
        anchor.addEventListener('click', (e) => {
          const targetId = anchor.getAttribute('href').substring(1);
          const targetIdx = Array.from(sections).findIndex(s => s.id === targetId);
          if (targetIdx !== -1) {
            e.preventDefault();
            scrollToSection(targetIdx);
          }
        });
      }
    });
  }

  function closeMobile() {
    if (navLinks && hamburger && mobileOverlay) {
      navLinks.classList.remove('mobile-open');
      hamburger.classList.remove('active');
      mobileOverlay.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  }

  // 5. Gallery Filters and Animation
  function setupGallery() {
    if (!filterBtns || !galleryItems) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        
        galleryItems.forEach(item => {
          if (filter === 'all' || item.dataset.category === filter) {
            item.style.display = 'block';
            gsap.fromTo(item, 
              { autoAlpha: 0, scale: 0.9 }, 
              { autoAlpha: 1, scale: 1, duration: 0.4, ease: "power2.out" }
            );
          } else {
            gsap.to(item, { 
              autoAlpha: 0, 
              scale: 0.9, 
              duration: 0.4, 
              ease: "power2.out",
              onComplete: () => { item.style.display = 'none'; } 
            });
          }
        });
      });
    });
  }

  // 6. Interactive Gallery Lightbox
  function setupLightbox() {
    if (!lightbox || !lightboxImg || !lightboxClose) return;

    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (img) {
          lightboxImg.src = img.src.replace('/600/750.jpg', '/1200/1500.jpg');
          lightboxImg.alt = img.alt;
          lightbox.hidden = false;
          lightbox.classList.add('active');
          document.body.style.overflow = 'hidden';

          gsap.fromTo(lightbox, { opacity: 0 }, { opacity: 1, duration: 0.3 });
          gsap.fromTo(lightboxImg, { scale: 0.8 }, { scale: 1, duration: 0.4, ease: "power2.out" });
        }
      });
    });

    const close = () => {
      gsap.to(lightbox, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          lightbox.classList.remove('active');
          lightbox.hidden = true;
          document.body.style.overflow = '';
        }
      });
    };

    lightboxClose.addEventListener('click', close);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) close();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !lightbox.hidden) close();
    });
  }

  // 7. 3D Tilt Hover Effect for Artist Cards
  function setupTilt() {
    const cards = $$('.artista-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        
        // Dynamic tilt calculation
        const angleX = (yc - y) / 12;
        const angleY = (x - xc) / 12;
        
        gsap.to(card, {
          rotateX: angleX,
          rotateY: angleY,
          scale: 1.04,
          duration: 0.3,
          ease: "power2.out",
          transformPerspective: 1000,
          overwrite: "auto"
        });
      });
      
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
          overwrite: "auto"
        });
      });
    });
  }

  // 8. Dynamic Booking Form & Validation
  function setupBooking() {
    if (!bookingForm) return;

    const today = new Date().toISOString().split('T')[0];
    const dateInput = $('#b-date');
    if (dateInput) dateInput.min = today;

    bookingForm.addEventListener('submit', e => {
      e.preventDefault();
      
      if (!bookingForm.checkValidity()) {
        bookingForm.querySelectorAll(':invalid').forEach(el => {
          el.style.borderColor = 'var(--accent)';
          el.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.2)';
          el.addEventListener('input', () => {
            el.style.borderColor = '';
            el.style.boxShadow = '';
          }, { once: true });
        });
        return;
      }

      const btn = bookingForm.querySelector('button[type="submit"]');
      if (btn) {
        btn.textContent = 'PROCESANDO RESERVA...';
        btn.disabled = true;
      }
      
      setTimeout(() => {
        gsap.to(bookingForm.querySelectorAll('.form-group, .form-row, button'), {
          opacity: 0,
          y: -10,
          duration: 0.4,
          stagger: 0.05,
          onComplete: () => {
            bookingForm.querySelectorAll('.form-group, .form-row, button').forEach(el => el.style.display = 'none');
            if (formSuccess) {
              formSuccess.hidden = false;
              gsap.fromTo(formSuccess, 
                { y: 20, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
              );
            }
          }
        });
      }, 1500);
    });
  }

  // 9. Generative Fluid Ink Hero Canvas
  function setupHeroCanvas() {
    const canvas = $('#hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let particles = [];
    let animationId = null;
    
    // Mouse tracker
    const mouse = { x: null, y: null, radius: 150 };
    
    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    
    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 1.5 + 1;
        this.alpha = Math.random() * 0.4 + 0.1;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off edges
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
        
        // Mouse reaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            this.x -= Math.cos(angle) * force * 1.5;
            this.y -= Math.sin(angle) * force * 1.5;
          }
        }
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 38, 38, ${this.alpha})`; // Elegant dark red transparent particle
        ctx.fill();
      }
    }
    
    function initParticles() {
      resize();
      particles = [];
      const particleCount = Math.min(Math.floor((width * height) / 22000), 70);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }
    
    function animate() {
      ctx.clearRect(0, 0, width, height);
      
      // Update & Draw Particles
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      
      // Draw smooth curving connections
      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 120) {
            const alpha = (1 - (dist / 120)) * 0.15;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      animationId = requestAnimationFrame(animate);
    }
    
    window.addEventListener('resize', () => {
      cancelAnimationFrame(animationId);
      initParticles();
      animate();
    });
    
    window.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    
    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });
    
    // Tap / Click effect
    window.addEventListener('click', e => {
      if (e.target.closest('section') && e.target.closest('section').id === 'hero') {
        // Spawn impulses on particle network
        particles.forEach(p => {
          const dx = e.clientX - p.x;
          const dy = e.clientY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const force = (200 - dist) / 200;
            const angle = Math.atan2(p.y - e.clientY, p.x - e.clientX);
            p.vx += Math.cos(angle) * force * 2.5;
            p.vy += Math.sin(angle) * force * 2.5;
          }
        });
      }
    });

    initParticles();
    animate();
  }

  // 10. Startup Initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();