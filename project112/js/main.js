document.addEventListener('DOMContentLoaded', function() {
  initNavigation();
  initScrollEffects();
  initFormHandling();
  renderDynamicContent();
  initFilters();
});

function initNavigation() {
  const navbar = document.querySelector('.navbar');
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
  
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = mobileMenuBtn.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      }
    });
    
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-times');
        }
      });
    });
  }
  
  const currentPath = window.location.pathname;
  const currentPage = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
  
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });
}

function initScrollEffects() {
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      document.querySelector('.featured-works')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.section, .card, .portfolio-item, .timeline-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  if (filterBtns.length === 0) return;
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.dataset.filter;
      const portfolioItems = document.querySelectorAll('.portfolio-item');
      
      portfolioItems.forEach(item => {
        const tagsStr = item.dataset.tags || '';
        const itemTags = tagsStr.split(',').map(tag => tag.trim()).filter(tag => tag);
        const isMatch = filter === 'all' || itemTags.includes(filter);
        
        if (isMatch) {
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

function initFormHandling() {
  const contactForm = document.querySelector('#contactForm');
  
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 发送中...';
      submitBtn.disabled = true;
      
      setTimeout(() => {
        submitBtn.innerHTML = '<i class="fas fa-check"></i> 发送成功！';
        submitBtn.style.background = '#4CAF50';
        
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          submitBtn.style.background = '';
          contactForm.reset();
        }, 2000);
      }, 1500);
    });
  }
}

function renderDynamicContent() {
  if (typeof projectsData === 'undefined' || typeof designerData === 'undefined') return;
  
  renderFeaturedWorks();
  renderPortfolioGrid();
  renderProjectDetail();
  renderAboutPage();
}

function renderFeaturedWorks() {
  const container = document.getElementById('featuredWorks');
  if (!container) return;
  
  const featuredProjects = projectsData.filter(p => p.featured);
  
  container.innerHTML = featuredProjects.map((project, index) => {
    const isLarge = index === 0;
    return `
      <div class="portfolio-item ${isLarge ? 'large' : ''}" data-tags="${project.tags.join(',')}" onclick="window.location.href='project-detail.html?id=${project.id}'">
        <img src="${project.coverImage}" alt="${project.name}" class="portfolio-image" onerror="this.style.display='none';this.parentElement.style.background='var(--color-bg-tertiary)'">
        <div class="portfolio-overlay">
          <h3 class="portfolio-title">${project.name}</h3>
          <p class="portfolio-meta">${project.client} · ${project.industry}</p>
          <div class="flex gap-sm mt-md" style="flex-wrap: wrap;">
            ${project.tags.slice(0, 3).map(tag => `<span class="tag tag-accent">${tag}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderPortfolioGrid() {
  const container = document.getElementById('portfolioGrid');
  if (!container) return;
  
  container.innerHTML = projectsData.map(project => `
    <div class="portfolio-item" data-tags="${project.tags.join(',')}" onclick="window.location.href='project-detail.html?id=${project.id}'">
      <img src="${project.coverImage}" alt="${project.name}" class="portfolio-image" onerror="this.style.display='none';this.parentElement.style.background='var(--color-bg-tertiary)'">
      <div class="portfolio-overlay">
        <h3 class="portfolio-title">${project.name}</h3>
        <p class="portfolio-meta">${project.client} · ${project.industry}</p>
        <div class="flex gap-sm mt-md" style="flex-wrap: wrap;">
          ${project.tags.map(tag => `<span class="tag tag-accent">${tag}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

function renderProjectDetail() {
  if (typeof currentProject === 'undefined') return;
  
  const heroTitle = document.getElementById('projectTitle');
  if (heroTitle) heroTitle.textContent = currentProject.name;
  
  const projectMeta = document.getElementById('projectMeta');
  if (projectMeta) {
    projectMeta.innerHTML = `
      <div class="meta-item">
        <span class="meta-label">客户</span>
        <span class="meta-value">${currentProject.client}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">行业</span>
        <span class="meta-value">${currentProject.industry}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">完成时间</span>
        <span class="meta-value">${currentProject.completionDate}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">使用工具</span>
        <span class="meta-value">${currentProject.tools.join(', ')}</span>
      </div>
    `;
  }
  
  const projectHero = document.querySelector('.project-hero');
  if (projectHero) {
    const img = projectHero.querySelector('.project-hero-image');
    if (img) img.src = currentProject.coverImage;
  }
  
  const projectBackground = document.getElementById('projectBackground');
  if (projectBackground) {
    projectBackground.textContent = currentProject.background;
  }
  
  const projectGallery = document.getElementById('projectGallery');
  if (projectGallery && currentProject.gallery.length > 0) {
    projectGallery.innerHTML = `
      <div class="carousel-track">
        ${currentProject.gallery.map((item, index) => `
          <div class="carousel-slide">
            <img src="${item.url}" alt="${item.caption}" class="carousel-image" onerror="this.style.display='none'">
            <div class="carousel-caption">
              <h4>${item.caption}</h4>
              <p>${item.type === 'gif' ? '动态展示' : item.type === 'prototype' ? '交互原型' : '静态图片'}</p>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="carousel-controls">
        <button class="carousel-btn prev"><i class="fas fa-chevron-left"></i></button>
        <button class="carousel-btn next"><i class="fas fa-chevron-right"></i></button>
      </div>
      <div class="carousel-dots">
        ${currentProject.gallery.map((_, index) => `
          <button class="carousel-dot ${index === 0 ? 'active' : ''}"></button>
        `).join('')}
      </div>
    `;
    
    setTimeout(initCarousels, 100);
  }
  
  const processTimeline = document.getElementById('processTimeline');
  if (processTimeline) {
    processTimeline.innerHTML = currentProject.process.map(stage => `
      <div class="timeline-item">
        <span class="timeline-stage">${stage.stage}</span>
        <h4 class="timeline-title">${stage.title}</h4>
        <p class="timeline-desc">${stage.description}</p>
        ${stage.images && stage.images.length > 0 ? `
          <div class="process-gallery">
            ${stage.images.map(img => `
              <div class="process-image">
                <img src="${img}" alt="${stage.title}" onerror="this.style.display='none'">
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');
  }
  
  const caseStudy = document.getElementById('caseStudy');
  if (caseStudy && currentProject.caseStudy) {
    caseStudy.innerHTML = `
      <div class="case-study-section">
        <h3>问题定义</h3>
        <p class="text-secondary">${currentProject.caseStudy.problemDefinition}</p>
      </div>
      <div class="case-study-section">
        <h3>设计目标</h3>
        <ul style="list-style: none; padding: 0;">
          ${currentProject.caseStudy.designGoals.map(goal => `
            <li style="margin-bottom: 12px; display: flex; align-items: flex-start; gap: 12px;">
              <i class="fas fa-check-circle text-accent" style="margin-top: 4px;"></i>
              <span>${goal}</span>
            </li>
          `).join('')}
        </ul>
      </div>
      <div class="case-study-section">
        <h3>解决方案</h3>
        <p class="text-secondary">${currentProject.caseStudy.solution}</p>
      </div>
      <div class="case-study-section">
        <h3>执行过程</h3>
        <p class="text-secondary">${currentProject.caseStudy.execution}</p>
      </div>
      <div class="case-study-section">
        <h3>最终成果</h3>
        <p class="text-secondary">${currentProject.caseStudy.results}</p>
      </div>
    `;
  }
  
  const metricsSection = document.getElementById('metricsSection');
  if (metricsSection && currentProject.metrics) {
    metricsSection.innerHTML = `
      <div class="grid grid-2 gap-lg">
        ${currentProject.metrics.map(metric => {
          const change = ((metric.after - metric.before) / metric.before * 100).toFixed(0);
          const isPositive = metric.after > metric.before;
          return `
            <div class="metrics-card">
              <h3>${metric.after}${metric.unit}</h3>
              <p>${metric.label}</p>
              <div class="metrics-change">
                <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i>
                ${isPositive ? '+' : ''}${change}%
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
  
  const designDecisions = document.getElementById('designDecisions');
  if (designDecisions && currentProject.designDecisions) {
    designDecisions.innerHTML = currentProject.designDecisions.map(decision => `
      <div class="decision-card ${decision.chosen ? 'chosen' : ''}">
        <div class="decision-header">
          <h4>${decision.option}</h4>
          <span class="decision-badge ${decision.chosen ? 'chosen' : 'alternative'}">
            ${decision.chosen ? '最终方案' : '备选方案'}
          </span>
        </div>
        <p class="text-secondary">${decision.description}</p>
        ${decision.chosen ? `<p class="text-gold mt-md" style="font-size: 0.9rem;"><i class="fas fa-star"></i> ${decision.reason}</p>` : ''}
      </div>
    `).join('');
  }
}

function renderAboutPage() {
  const designerName = document.getElementById('designerName');
  if (designerName) designerName.textContent = designerData.name;
  
  const designerTitle = document.getElementById('designerTitle');
  if (designerTitle) designerTitle.textContent = designerData.title;
  
  const designerAvatar = document.getElementById('designerAvatar');
  if (designerAvatar) designerAvatar.src = designerData.avatar;
  
  const designerBio = document.getElementById('designerBio');
  if (designerBio) designerBio.textContent = designerData.bio;
  
  const designerPhilosophy = document.getElementById('designerPhilosophy');
  if (designerPhilosophy) designerPhilosophy.textContent = designerData.philosophy;
  
  const designStyle = document.getElementById('designStyle');
  if (designStyle) designStyle.textContent = designerData.designStyle;
  
  const skillsList = document.getElementById('skillsList');
  if (skillsList && designerData.skills) {
    skillsList.innerHTML = designerData.skills.map(skill => `
      <div class="skill-item">
        <div class="skill-header">
          <span class="skill-name">${skill.name}</span>
          <span class="skill-level">${skill.level}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${skill.level}%"></div>
        </div>
      </div>
    `).join('');
  }
  
  const toolsList = document.getElementById('toolsList');
  if (toolsList && designerData.tools) {
    const toolsByCategory = {};
    designerData.tools.forEach(tool => {
      if (!toolsByCategory[tool.category]) {
        toolsByCategory[tool.category] = [];
      }
      toolsByCategory[tool.category].push(tool);
    });
    
    toolsList.innerHTML = Object.entries(toolsByCategory).map(([category, tools]) => `
      <div class="tools-category">
        <h4>${category}</h4>
        <div class="tools-grid">
          ${tools.map(tool => `
            <div class="tool-card">
              <div class="tool-icon">
                <i class="fas ${tool.icon}"></i>
              </div>
              <div class="tool-name">${tool.name}</div>
              <div class="tool-projects">${tool.projects.length} 个项目</div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }
  
  const awardsList = document.getElementById('awardsList');
  if (awardsList && designerData.awards) {
    awardsList.innerHTML = designerData.awards.map(award => `
      <div class="award-item">
        <div class="award-year">${award.year}</div>
        <div class="award-content">
          <h4 class="award-title">${award.title}</h4>
          <p class="award-org">${award.organization}</p>
          <p class="award-desc">${award.description}</p>
        </div>
      </div>
    `).join('');
  }
  
  const testimonialsSlider = document.getElementById('testimonialsSlider');
  if (testimonialsSlider && designerData.testimonials) {
    testimonialsSlider.innerHTML = `
      <div class="testimonial-track">
        ${designerData.testimonials.map(testimonial => `
          <div class="testimonial-card">
            <p class="testimonial-quote quote">${testimonial.quote}</p>
            <div class="testimonial-author">
              <img src="${testimonial.avatar}" alt="${testimonial.name}" class="testimonial-avatar" onerror="this.style.display='none'">
              <div class="testimonial-info">
                <h5>${testimonial.name}</h5>
                <p>${testimonial.role} · ${testimonial.company}</p>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    setTimeout(initCarousels, 100);
  }
  
  const contactEmail = document.getElementById('contactEmail');
  if (contactEmail) {
    contactEmail.textContent = designerData.contact.email;
    contactEmail.href = `mailto:${designerData.contact.email}`;
  }
  
  const contactPhone = document.getElementById('contactPhone');
  if (contactPhone) {
    contactPhone.textContent = designerData.contact.phone;
    contactPhone.href = `tel:${designerData.contact.phone}`;
  }
  
  const contactLocation = document.getElementById('contactLocation');
  if (contactLocation) contactLocation.textContent = designerData.contact.location;
  
  const statsYears = document.getElementById('statsYears');
  const statsProjects = document.getElementById('statsProjects');
  const statsClients = document.getElementById('statsClients');
  const statsAwards = document.getElementById('statsAwards');
  
  if (statsYears) statsYears.textContent = `${designerData.stats.years}+`;
  if (statsProjects) statsProjects.textContent = `${designerData.stats.projects}+`;
  if (statsClients) statsClients.textContent = `${designerData.stats.clients}+`;
  if (statsAwards) statsAwards.textContent = `${designerData.stats.awards}+`;
}
