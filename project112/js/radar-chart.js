class RadarChart {
  constructor(canvas, data, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.data = data;
    this.options = {
      centerX: canvas.width / 2,
      centerY: canvas.height / 2,
      radius: Math.min(canvas.width, canvas.height) / 2 - 40,
      levels: 5,
      gridColor: 'rgba(255, 255, 255, 0.1)',
      axisColor: 'rgba(255, 255, 255, 0.2)',
      fillColor: 'rgba(255, 107, 107, 0.2)',
      strokeColor: '#FF6B6B',
      pointColor: '#FFD93D',
      textColor: '#b0b0b0',
      animationDuration: 1000,
      ...options
    };
    this.animationProgress = 0;
    this.animationId = null;
    this.hoveredIndex = -1;
    
    this.init();
  }
  
  init() {
    this.draw();
    this.addEventListeners();
  }
  
  draw() {
    const { ctx, canvas, options, data } = this;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    this.drawGrid();
    this.drawAxes();
    this.drawData();
    this.drawLabels();
    
    if (this.hoveredIndex >= 0) {
      this.drawTooltip(this.hoveredIndex);
    }
  }
  
  drawGrid() {
    const { ctx, options, data } = this;
    const { centerX, centerY, radius, levels, gridColor } = options;
    
    for (let i = 1; i <= levels; i++) {
      const levelRadius = (radius / levels) * i;
      
      ctx.beginPath();
      for (let j = 0; j < data.length; j++) {
        const angle = (Math.PI * 2 * j) / data.length - Math.PI / 2;
        const x = centerX + Math.cos(angle) * levelRadius;
        const y = centerY + Math.sin(angle) * levelRadius;
        
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  
  drawAxes() {
    const { ctx, options, data } = this;
    const { centerX, centerY, radius, axisColor } = options;
    
    for (let i = 0; i < data.length; i++) {
      const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  
  drawData() {
    const { ctx, options, data, animationProgress } = this;
    const { centerX, centerY, radius, fillColor, strokeColor, pointColor } = options;
    
    const progress = animationProgress || 1;
    
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
      const value = (data[i].level / 100) * radius * progress;
      const x = centerX + Math.cos(angle) * value;
      const y = centerY + Math.sin(angle) * value;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    for (let i = 0; i < data.length; i++) {
      const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
      const value = (data[i].level / 100) * radius * progress;
      const x = centerX + Math.cos(angle) * value;
      const y = centerY + Math.sin(angle) * value;
      
      ctx.beginPath();
      ctx.arc(x, y, this.hoveredIndex === i ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = pointColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
  
  drawLabels() {
    const { ctx, options, data } = this;
    const { centerX, centerY, radius, textColor } = options;
    
    ctx.font = '14px "DM Sans", sans-serif';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i < data.length; i++) {
      const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
      const labelRadius = radius + 25;
      const x = centerX + Math.cos(angle) * labelRadius;
      const y = centerY + Math.sin(angle) * labelRadius;
      
      ctx.fillText(data[i].name, x, y);
    }
  }
  
  drawTooltip(index) {
    const { ctx, options, data } = this;
    const { centerX, centerY, radius, pointColor } = options;
    
    const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
    const value = (data[index].level / 100) * radius;
    const x = centerX + Math.cos(angle) * value;
    const y = centerY + Math.sin(angle) * value;
    
    const text = `${data[index].name}: ${data[index].level}%`;
    const padding = 8;
    const fontSize = 14;
    
    ctx.font = `${fontSize}px "DM Sans", sans-serif`;
    const textWidth = ctx.measureText(text).width;
    const boxWidth = textWidth + padding * 2;
    const boxHeight = fontSize + padding * 2;
    
    let boxX = x - boxWidth / 2;
    let boxY = y - boxHeight - 15;
    
    if (boxX < 10) boxX = 10;
    if (boxX + boxWidth > this.canvas.width - 10) boxX = this.canvas.width - boxWidth - 10;
    if (boxY < 10) boxY = y + 15;
    
    ctx.fillStyle = 'rgba(26, 26, 26, 0.95)';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 6);
    ctx.fill();
    
    ctx.fillStyle = pointColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, boxX + boxWidth / 2, boxY + boxHeight / 2);
  }
  
  addEventListeners() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      this.hoveredIndex = this.getHoveredIndex(x, y);
      this.canvas.style.cursor = this.hoveredIndex >= 0 ? 'pointer' : 'default';
      this.draw();
    });
    
    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredIndex = -1;
      this.draw();
    });
  }
  
  getHoveredIndex(mouseX, mouseY) {
    const { options, data } = this;
    const { centerX, centerY, radius } = options;
    
    for (let i = 0; i < data.length; i++) {
      const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
      const value = (data[i].level / 100) * radius;
      const x = centerX + Math.cos(angle) * value;
      const y = centerY + Math.sin(angle) * value;
      
      const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
      if (distance < 15) {
        return i;
      }
    }
    
    return -1;
  }
  
  animate() {
    const { options } = this;
    const startTime = performance.now();
    
    const animateFrame = (currentTime) => {
      const elapsed = currentTime - startTime;
      this.animationProgress = Math.min(elapsed / options.animationDuration, 1);
      
      const easeOutCubic = 1 - Math.pow(1 - this.animationProgress, 3);
      this.animationProgress = easeOutCubic;
      
      this.draw();
      
      if (elapsed < options.animationDuration) {
        this.animationId = requestAnimationFrame(animateFrame);
      }
    };
    
    this.animationId = requestAnimationFrame(animateFrame);
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

function initRadarChart() {
  const canvas = document.getElementById('radarCanvas');
  if (!canvas) return;
  
  if (typeof designerData === 'undefined') return;
  
  const container = canvas.parentElement;
  const size = Math.min(container.clientWidth, 400);
  
  canvas.width = size;
  canvas.height = size;
  
  const radarChart = new RadarChart(canvas, designerData.skills);
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        radarChart.animate();
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });
  
  observer.observe(canvas);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRadarChart);
} else {
  initRadarChart();
}
