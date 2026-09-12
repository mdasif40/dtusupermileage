/**
 * DTU SUPERMILEAGE - Main Application Script
 * Orchestrates header scroll visibility, intersection animations, navigation systems, department carousel, and highlights slider functionality.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. Header Hide/Show on Scroll Logic
  // ==========================================
  const header = document.querySelector('header');
  let lastScrollTop = 0;
  const delta = 5; // Minimum scroll distance before triggering

  window.addEventListener('scroll', () => {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // Prevent negative scroll values on mobile bouncing/rubber-band effects
    if (currentScroll < 0) return;

    // Check if user scrolled past the threshold
    if (Math.abs(lastScrollTop - currentScroll) <= delta) return;

    if (currentScroll > lastScrollTop && currentScroll > header.offsetHeight) {
      // Scrolling Down -> Hide Header
      header.classList.add('header-hidden');
      
      // Close mobile/more panels if open when scrolling away
      const morePanel = document.getElementById('morePanel');
      const moreBtn = document.getElementById('moreBtn');
      if (morePanel && morePanel.classList.contains('open')) {
        morePanel.classList.remove('open');
        moreBtn.setAttribute('aria-expanded', 'false');
      }
    } else {
      // Scrolling Up -> Show Header
      header.classList.remove('header-hidden');
    }

    lastScrollTop = currentScroll;
  }, { passive: true });


  // ==========================================
  // 2. Who We Are Scroll-Triggered Animations
  // ==========================================
  const animatedEls = document.querySelectorAll('[data-animate]');

  if (!('IntersectionObserver' in window)) {
    // Fallback: show everything immediately if observer is missing
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


  // ==========================================
  // 3. Smooth Scroll for "Our Team" Button
  // ==========================================
  const teamBtn = document.querySelector('.wwa-button[href^="#"]');
  if (teamBtn) {
    teamBtn.addEventListener('click', (e) => {
      const targetId = teamBtn.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }


  // ==========================================
  // 4. More Menu Dropdown Toggle Logic
  // ==========================================
  const moreBtn = document.getElementById('moreBtn');
  const morePanel = document.getElementById('morePanel');

  if (moreBtn && morePanel) {
    moreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = morePanel.classList.toggle('open');
      moreBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!moreBtn.contains(e.target) && !morePanel.contains(e.target)) {
        morePanel.classList.remove('open');
        moreBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }


  // ==========================================
  // 5. Back to Top Button Logic (Achievements Page)
  // ==========================================
  const backToTopBtn = document.getElementById('backToTopBtn');

  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }


  // ==========================================
  // 6. Department Carousel / Join Us Section Logic
  // ==========================================
  const cards = document.querySelectorAll(".dept-card");
  const dots = document.querySelectorAll(".dot");
  const carouselWrapper = document.getElementById("deptCarousel");

  if (cards.length > 0 && dots.length > 0) {
    let deptCurrentIndex = 0;
    let deptSlideInterval;
    const slideDuration = 3000; // Active slide duration in milliseconds

    function showCard(index) {
      cards.forEach((card, i) => {
        card.classList.remove("active", "expanded");
        dots[i].classList.remove("active");
        if (i === index) {
          card.classList.add("active");
          dots[i].classList.add("active");
        }
      });
      deptCurrentIndex = index;
    }

    function nextDeptSlide() {
      let nextIndex = (deptCurrentIndex + 1) % cards.length;
      showCard(nextIndex);
    }

    // Start automated time-lag slide loop
    deptSlideInterval = setInterval(nextDeptSlide, slideDuration);

    // Pause auto-slide when hovering over the department carousel
    if (carouselWrapper) {
      carouselWrapper.addEventListener("mouseenter", () => clearInterval(deptSlideInterval));
      carouselWrapper.addEventListener("mouseleave", () => {
        clearInterval(deptSlideInterval);
        deptSlideInterval = setInterval(nextDeptSlide, slideDuration);
      });
    }

    // Manual dot click control
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        showCard(index);
      });
    });

    // Click toggle capability for touch devices / inspection
    cards.forEach(card => {
      card.addEventListener("click", function() {
        this.classList.toggle("expanded");
      });
    });
  }


  // ==========================================
  // 7. Highlights Section Slideshow Logic
  // ==========================================
  const highlightsTrack = document.querySelector(".slider-track");
  const highlightsNextBtn = document.querySelector(".next-btn");
  const highlightsPrevBtn = document.querySelector(".prev-btn");
  
  if (highlightsTrack && highlightsNextBtn && highlightsPrevBtn) {
    const cardElement = highlightsTrack.querySelector(".highlight-card");
    if (cardElement) {
      const cardWidth = cardElement.offsetWidth + 30; // Card width + gap

      highlightsNextBtn.addEventListener("click", () => {
        highlightsTrack.scrollBy({ left: cardWidth, behavior: "smooth" });
      });

      highlightsPrevBtn.addEventListener("click", () => {
        highlightsTrack.scrollBy({ left: -cardWidth, behavior: "smooth" });
      });
    }
  }


  // ==========================================
  // 8. Infinite Carousel / Track Logic (Highlights Section - Uninterrupted)
  // ==========================================
  const infiniteTrack = document.getElementById('carouselTrack');
  
  if (infiniteTrack) {
    let items = Array.from(infiniteTrack.children);

    // Clone elements for continuous loop illusion
    items.forEach(item => {
      const clone = item.cloneNode(true);
      infiniteTrack.appendChild(clone);
    });

    let currentIndex = 0;
    const totalItems = items.length;

    function updateCarousel(instant = false) {
      const offset = -(currentIndex * 33.3333);
      
      if (instant) {
        infiniteTrack.style.transition = 'none';
      } else {
        infiniteTrack.style.transition = 'transform 1s cubic-bezier(0.25, 1, 0.5, 1)';
      }
      
      infiniteTrack.style.transform = `translateX(${offset}vw)`;

      const allItems = infiniteTrack.querySelectorAll('.carousel-item');
      allItems.forEach((item, index) => {
        item.classList.remove('active');
        let activeIndex = (currentIndex + 1) % allItems.length;
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
        }, 400); // Matches transition duration
      }
    }

    updateCarousel();
    
    // Runs continuously without pausing on hover or clicks for the highlights section
    let slideInterval = setInterval(nextSlide, 2500);
  }


  // ==========================================
  // 9. Highlights Coverflow Carousel Logic
  // ==========================================
  const coverflowTrack = document.querySelector(".carousel-track");
  const slides = Array.from(document.querySelectorAll(".carousel-slide"));
  const coverflowNextBtn = document.querySelector(".carousel-next-btn");
  const coverflowPrevBtn = document.querySelector(".carousel-prev-btn");

  if (coverflowTrack && slides.length > 0 && coverflowNextBtn && coverflowPrevBtn) {
    let coverflowIndex = 1; // Start with the second slide centered

    function updateCoverflow() {
      slides.forEach((slide, i) => {
        slide.classList.remove("active");
        if (i === coverflowIndex) {
          slide.classList.add("active");
        }
      });

      const slideRect = slides[0].getBoundingClientRect();
      const slideWidth = slideRect.width;
      const gap = 30; // Matches CSS gap
      const trackParentWidth = coverflowTrack.parentElement.getBoundingClientRect().width;
      
      const offset = (trackParentWidth / 2) - (slideWidth / 2) - (coverflowIndex * (slideWidth + gap));
      coverflowTrack.style.transform = `translateX(${offset}px)`;
    }

    coverflowNextBtn.addEventListener("click", () => {
      if (coverflowIndex < slides.length - 1) {
        coverflowIndex++;
        updateCoverflow();
      }
    });

    coverflowPrevBtn.addEventListener("click", () => {
      if (coverflowIndex > 0) {
        coverflowIndex--;
        updateCoverflow();
      }
    });

    window.addEventListener("resize", updateCoverflow);
    setTimeout(updateCoverflow, 50); 
    updateCoverflow();
  }

});


// ==========================================
// 10. Sponsor Track Dynamic Width Calculation
// ==========================================
window.addEventListener('load', function() {
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
    
    track.style.width = (totalWidth * 2) + 'px';
  }

  // Hamburger Menu Logic
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

  // Close menu when clicking any link inside navigation
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('nav-active');
      hamburgerBtn.classList.remove('active');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu when clicking outside header
  document.addEventListener('click', (e) => {
    if (!mainNav.contains(e.target) && !hamburgerBtn.contains(e.target)) {
      mainNav.classList.remove('nav-active');
      hamburgerBtn.classList.remove('active');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
  });
}
});