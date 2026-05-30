class Carousel {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      autoPlay: false,
      interval: 5000,
      ...options
    };
    this.currentIndex = 0;
    this.track = element.querySelector('.carousel-track');
    this.slides = element.querySelectorAll('.carousel-slide');
    this.dots = element.querySelectorAll('.carousel-dot');
    this.prevBtn = element.querySelector('.carousel-btn.prev');
    this.nextBtn = element.querySelector('.carousel-btn.next');
    this.autoPlayInterval = null;
    
    this.init();
  }
  
  init() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prev());
    }
    
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }
    
    if (this.dots) {
      this.dots.forEach((dot, index) => {
        dot.addEventListener('click', () => this.goTo(index));
      });
    }
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });
    
    if (this.options.autoPlay) {
      this.startAutoPlay();
      
      this.element.addEventListener('mouseenter', () => this.stopAutoPlay());
      this.element.addEventListener('mouseleave', () => this.startAutoPlay());
    }
    
    this.update();
  }
  
  update() {
    if (!this.track || this.slides.length === 0) return;
    
    this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
    
    if (this.dots) {
      this.dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === this.currentIndex);
      });
    }
  }
  
  next() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.update();
  }
  
  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.update();
  }
  
  goTo(index) {
    this.currentIndex = index;
    this.update();
  }
  
  startAutoPlay() {
    if (this.options.autoPlay && this.slides.length > 1) {
      this.autoPlayInterval = setInterval(() => this.next(), this.options.interval);
    }
  }
  
  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
}

class TestimonialCarousel {
  constructor(element) {
    this.element = element;
    this.track = element.querySelector('.testimonial-track');
    this.cards = element.querySelectorAll('.testimonial-card');
    this.currentIndex = 0;
    this.autoPlayInterval = null;
    
    this.init();
  }
  
  init() {
    this.startAutoPlay();
    
    this.element.addEventListener('mouseenter', () => this.stopAutoPlay());
    this.element.addEventListener('mouseleave', () => this.startAutoPlay());
  }
  
  update() {
    if (!this.track || this.cards.length === 0) return;
    this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
  }
  
  startAutoPlay() {
    if (this.cards.length > 1) {
      this.autoPlayInterval = setInterval(() => {
        this.currentIndex = (this.currentIndex + 1) % this.cards.length;
        this.update();
      }, 5000);
    }
  }
  
  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
}

function initCarousels() {
  document.querySelectorAll('.carousel').forEach(carousel => {
    new Carousel(carousel, { autoPlay: true, interval: 6000 });
  });
  
  document.querySelectorAll('.testimonial-slider').forEach(slider => {
    new TestimonialCarousel(slider);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCarousels);
} else {
  initCarousels();
}
