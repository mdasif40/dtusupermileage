/**
 * DTU SUPERMILEAGE - Main Application Script
 * Orchestrates header scroll visibility/background, intersection animations,
 * mobile drawer navigation, department carousel, highlights slider, and sponsor marquee.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. Header Scroll Logic (Hide/Show & Background Color)
  // ==========================================
  const header = document.querySelector('header');
  let lastScrollTop = 0;
  const delta = 5; // Minimum scroll distance threshold

  if (header) {
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

      // Toggle dark background past 50px threshold
      if (window.scrollY > 50) {
        header.classList.add('header-active');
      } else {
        header.classList.remove('header-active');
      }

      // Prevent negative scroll values on mobile bounce/rubber-band effects
      if (currentScroll < 0) return;

      // Check if scroll delta exceeds threshold
      if (Math.abs(lastScrollTop - currentScroll) <= delta) return;

      if (currentScroll > lastScrollTop && currentScroll > header.offsetHeight) {
        // Scrolling Down -> Hide Header
        header.classList.add('header-hidden');
        
        // Close mobile dropdown panels if open when scrolling down
        const morePanel = document.getElementById('morePanel');
        const moreBtn = document.getElementById('moreBtn');
        if (morePanel && morePanel.classList.contains('open')) {
          morePanel.classList.remove('open');
          if (moreBtn) moreBtn.setAttribute('aria-expanded', 'false');
        }
      } else {
        // Scrolling Up -> Show Header
        header.classList.remove('header-hidden');
      }

      lastScrollTop = currentScroll;
    }, { passive: true });
  }


  // ==========================================
  // 2. Who We Are Scroll-Triggered Animations
  // ==========================================
  const animatedEls = document.querySelectorAll('[data-animate]');

  if (animatedEls.length > 0) {
    if (!('IntersectionObserver' in window)) {
      // Fallback: Display elements immediately if IntersectionObserver isn't supported
      animatedEls.forEach(el => el.classList.add('in-view'));
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.2,
        rootMargin: '0px 0px -60px 0px'
      });

      animatedEls.forEach(el => observer.observe(el));
    }
  }


  // ==========================================
  // 3. Smooth Anchor Scrolling
  // ==========================================
  const anchorBtns = document.querySelectorAll('a[href^="#"]:not([href="#"])');
  anchorBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetId = btn.getAttribute('href').slice(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  // ==========================================
  // 4. "More" Menu Dropdown Toggle Logic
  // ==========================================
  const moreBtn = document.getElementById('moreBtn');
  const morePanel = document.getElementById('morePanel');

  if (moreBtn && morePanel) {
    moreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = morePanel.classList.toggle('open');
      moreBtn.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('click', (e) => {
      if (!moreBtn.contains(e.target) && !morePanel.contains(e.target)) {
        morePanel.classList.remove('open');
        moreBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }


  // ==========================================
  // 5. Back to Top Button Logic
  // ==========================================
  const backToTopBtn = document.getElementById('backToTopBtn');

  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }


  // ==========================================
  // 6. Department Carousel Logic (Join Us Section)
  // ==========================================
  const cards = document.querySelectorAll(".dept-card");
  const dots = document.querySelectorAll(".dot");
  const carouselWrapper = document.getElementById("deptCarousel");

  if (cards.length > 0 && dots.length > 0) {
    let deptCurrentIndex = 0;
    let deptSlideInterval;
    const slideDuration = 3000;

    function showCard(index) {
      cards.forEach((card, i) => {
        card.classList.remove("active", "expanded");
        if (dots[i]) dots[i].classList.remove("active");
        if (i === index) {
          card.classList.add("active");
          if (dots[i]) dots[i].classList.add("active");
        }
      });
      deptCurrentIndex = index;
    }

    function nextDeptSlide() {
      const nextIndex = (deptCurrentIndex + 1) % cards.length;
      showCard(nextIndex);
    }

    deptSlideInterval = setInterval(nextDeptSlide, slideDuration);

    if (carouselWrapper) {
      carouselWrapper.addEventListener("mouseenter", () => clearInterval(deptSlideInterval));
      carouselWrapper.addEventListener("mouseleave", () => {
        clearInterval(deptSlideInterval);
        deptSlideInterval = setInterval(nextDeptSlide, slideDuration);
      });
    }

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => showCard(index));
    });

    cards.forEach(card => {
      card.addEventListener("click", function() {
        this.classList.toggle("expanded");
      });
    });
  }


  // ==========================================
  // 7. Infinite Responsive Carousel (Highlights Section)
  // ==========================================
  const infiniteTrack = document.getElementById('carouselTrack');
  
  if (infiniteTrack) {
    const items = Array.from(infiniteTrack.children);

    // Duplicate set of elements to produce a seamless loop
    items.forEach(item => {
      const clone = item.cloneNode(true);
      infiniteTrack.appendChild(clone);
    });

    let currentIndex = 0;
    const totalItems = items.length;

    function updateCarousel(instant = false) {
      const isMobile = window.innerWidth <= 768;
      const step = isMobile ? 100 : 33.3333;
      const offset = -(currentIndex * step);
      
      if (instant) {
        infiniteTrack.style.transition = 'none';
      } else {
        infiniteTrack.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
      }
      
      infiniteTrack.style.transform = `translateX(${offset}vw)`;

      const allItems = infiniteTrack.querySelectorAll('.carousel-item');
      allItems.forEach((item, index) => {
        item.classList.remove('active');
        const activeIndex = isMobile ? currentIndex : (currentIndex + 1) % allItems.length;
        if (index === activeIndex) {
          item.classList.add('active');
        }
      });
    }

    function nextSlide() {
      currentIndex++;
      updateCarousel();

      if (currentIndex >= totalItems) {
        setTimeout(() => {
          currentIndex = 0;
          updateCarousel(true);
        }, 800);
      }
    }

    updateCarousel();
    setInterval(nextSlide, 3000);

    window.addEventListener('resize', () => updateCarousel(true));
  }


  // ==========================================
  // 8. Mobile Drawer / Hamburger Navigation
  // ==========================================
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mainNav = document.getElementById('mainNav');
  const navLinks = document.querySelectorAll('.nav-links a');

  if (hamburgerBtn && mainNav) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mainNav.classList.toggle('nav-active');
      hamburgerBtn.classList.toggle('active', isOpen);
      hamburgerBtn.setAttribute('aria-expanded', isOpen);
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('nav-active');
        hamburgerBtn.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', (e) => {
      if (!mainNav.contains(e.target) && !hamburgerBtn.contains(e.target)) {
        mainNav.classList.remove('nav-active');
        hamburgerBtn.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

});


// ==========================================
// 9. Sponsor Track Dynamic Width (On Load)
// ==========================================
window.addEventListener('load', () => {
  const track = document.getElementById('sponsorTrack');
  
  if (track) {
    const logos = track.querySelectorAll('.sponsor-logo');
    let totalWidth = 0;

    const singleSetCount = logos.length / 2;
    
    for (let i = 0; i < singleSetCount; i++) {
      const logoStyle = window.getComputedStyle(logos[i]);
      const marginLeft = parseFloat(logoStyle.marginLeft) || 0;
      const marginRight = parseFloat(logoStyle.marginRight) || 0;
      totalWidth += logos[i].offsetWidth + marginLeft + marginRight;
    }
    
    track.style.width = `${totalWidth * 2}px`;
  }
});
