class MathGraph {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.coeffContainer = null;
    this.degreeSelect = null;
    this.themeIsDark = true;
    
    this.isRightDragging = false;
    this.lastPanX = 0;
    this.lastPanY = 0;
    
    // Viewport settings - căn giữa
    this.viewport = {
      xMin: -10,
      xMax: 10,
      yMin: -10,
      yMax: 10
    };
    
    //Set thông số viewport gốc để reset
    this.originalViewport = { ...this.viewport };
    
    // Track mouse position
    this.mouseX = 0;
    this.mouseY = 0;
    this.isMouseOnCanvas = false;

    //Kích thước canvas hiển thị
    this.displayWidth = 0;
    this.displayHeight = 0;

    // Theo dõi thay đổi kích thước
    this.resizeObserver = null;

    this.minZoom = 0.1;
    this.maxZoom = 1000;

    this.selectedPoints = []; // Mảng lưu các điểm được chọn
    this.clickRadius = 10; // Bán kính để chọn điểm
    
    this.isFullscreen = false;
  }

  init() {
    this.initializeElements(); // Lấy reference DOM
    this.renderCoeffInputs();  // Tạo input hệ số
    this.setupEventListeners();
    this.setupResizeObserver();
    this.resizeCanvas();
    this.setTheme(true); // Theme dark default
    this.updateInputs();
    this.draw();
  }

  initializeElements() {
    this.canvas = document.getElementById('plot');
    this.ctx = this.canvas.getContext('2d');
    this.coeffContainer = document.getElementById('coeffs');
    this.degreeSelect = document.getElementById('degree');
  }

  renderCoeffInputs() {
    const deg = parseInt(this.degreeSelect.value);
    let html = `
      <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 16px;">
        <span style="font-weight: 600;">P(x) = </span>`;

    for (let i = deg; i >= 0; i--) {
      const coefficient = i === deg ? '1' : '0';
      html += `
        <div class="coeff-box">
          <input 
            id="a${i}" 
            value="${coefficient}" 
            type="number" 
            step="0.1"
            style="width: 50px; padding: 4px; border: 1px solid #ccc; border-radius: 4px; text-align: center;"
          >`;
      
      if (i > 1) {
        html += `<span>x<sup>${i}</sup></span>`;
      } else if (i === 1) {
        html += `<span>x</span>`;
      }
      
      html += `</div>`;
      
      if (i !== 0) {
        html += `<span>+</span>`;
      }
    }

    html += `</div>`;
    this.coeffContainer.innerHTML = html;

    for (let i = 0; i <= deg; i++) {
      const input = document.getElementById(`a${i}`);
      if (input) {
        input.addEventListener('input', () => {
          setTimeout(() => {
            this.selectedPoints = []; //Reset tất cả điểm khi hệ số thay đổi
            this.draw();
          }, 100);
        });
      }
    }
  }

  setupEventListeners() {
    this.degreeSelect.addEventListener('change', () => {
      this.renderCoeffInputs();
      this.selectedPoints = []; //Reset tất cả điểm khi bậc thay đổi
      this.draw();
    });

    document.getElementById('draw').addEventListener('click', () => {
      this.selectedPoints = []; //Reset tất cả điểm khi vẽ lại
      this.draw();
    });

    document.getElementById('theme').addEventListener('click', () => {
      this.setTheme(!this.themeIsDark);
      this.draw();
    });

    document.getElementById('reset-view').addEventListener('click', () => {
      this.resetView();
    });

    document.getElementById('color').addEventListener('change', () => {
      this.draw();
    });

    document.getElementById('fullscreen-btn').addEventListener('click', () => {
      this.toggleFullscreen();
    });

    document.getElementById('add-point').addEventListener('click', () => {
      this.addManualPoint();
    });

    document.getElementById('manual-x').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.addManualPoint();
      }
    });

    this.setupMouseEvents();
  }

  setupMouseEvents() {
    // Ngăn menu context khi click chuột phải
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Chuột phải để kéo (xuống)
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 2) {
        this.isRightDragging = true;
        this.lastPanX = e.clientX;
        this.lastPanY = e.clientY;
        this.canvas.style.cursor = 'grabbing';
        e.preventDefault();
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;

      // Convert to world coordinates (cập nhật hiển thị tọa độ)
      const worldX = this.screenToWorldX(this.mouseX);
      const worldY = this.screenToWorldY(this.mouseY);
      
      this.updateCoordinatesDisplay(worldX, worldY);
      
      if (this.isRightDragging) {
        this.handlePan(e);
      }
    });

    // Chuột phải nhả ra
    this.canvas.addEventListener('mouseup', (e) => {
      if (e.button === 2) {
        this.isRightDragging = false;
        this.canvas.style.cursor = 'crosshair';
      }
    });

    // Chuột rời canvas
    this.canvas.addEventListener('mouseleave', () => {
      this.isRightDragging = false;
      this.isMouseOnCanvas = false;
      this.canvas.style.cursor = 'default';
      this.updateCoordinatesDisplay(null, null);
    });

    this.canvas.addEventListener('mouseenter', () => {
      this.isMouseOnCanvas = true;
      this.canvas.style.cursor = 'crosshair';
    });

    // Mouse wheel for zooming
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.handleZoom(e);
    }, { passive: false });

    // Click chuột trái (button 0) để chọn điểm trên đồ thị
    this.canvas.addEventListener('click', (e) => {
      if (e.button === 0) { 
        this.handleClick(e);
      }
    });
  }

  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Kiểm tra xem có click vào điểm đã chọn không
    const clickedPointIndex = this.findClickedPoint(clickX, clickY);
    
    if (clickedPointIndex !== -1) {
      //Xóa điểm đó
      this.selectedPoints.splice(clickedPointIndex, 1);
    } else {
      // Chuyển đổi tọa độ click sang tọa độ riel
      const worldX = this.screenToWorldX(clickX);
      
      const worldY = this.evaluatePolynomial(worldX);
      
      if (isFinite(worldY)) {
        this.selectedPoints.push({
          x: worldX,
          y: worldY,
          screenX: clickX,
          screenY: clickY,
          type: 'click' // Đánh dấu điểm được chọn bằng click
        });
      }
    }
    
    this.draw();
  }

  findClickedPoint(clickX, clickY) {
    for (let i = 0; i < this.selectedPoints.length; i++) {
      const point = this.selectedPoints[i];
      const distance = Math.sqrt(
        Math.pow(clickX - point.screenX, 2) + 
        Math.pow(clickY - point.screenY, 2)
      );
      
      if (distance <= this.clickRadius) {
        return i;
      }
    }
    return -1;
  }

  setupResizeObserver() {
    const container = this.canvas.parentElement;
    if (!container) return;
    this.resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        this.resizeCanvas();
        this.draw();
      }
    });
    
    this.resizeObserver.observe(container);
  }

  resizeCanvas() {
    const container = this.canvas.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    this.displayWidth = Math.floor(rect.width);
    this.displayHeight = Math.floor(rect.height);

    this.canvas.width = this.displayWidth;
    this.canvas.height = this.displayHeight;
  }

  handlePan(e) {
    const dx = e.clientX - this.lastPanX;
    const dy = e.clientY - this.lastPanY;

    // Convert pixel movement to world coordinates
    const worldDx = dx * (this.viewport.xMax - this.viewport.xMin) / this.displayWidth;
    const worldDy = dy * (this.viewport.yMax - this.viewport.yMin) / this.displayHeight;

    // Update viewport
    this.viewport.xMin -= worldDx;
    this.viewport.xMax -= worldDx;
    this.viewport.yMin += worldDy;
    this.viewport.yMax += worldDy;

    this.lastPanX = e.clientX;
    this.lastPanY = e.clientY;

    this.updateInputs();
    this.draw();
  }

  handleZoom(e) {
    const zoomIntensity = 0.1;
    const zoomFactor = e.deltaY < 0 ? (1 + zoomIntensity) : (1 - zoomIntensity);

    // Get mouse position in world coordinates
    const worldX = this.screenToWorldX(this.mouseX);
    const worldY = this.screenToWorldY(this.mouseY);

    // Calculate new viewport dimensions
    const newWidth = (this.viewport.xMax - this.viewport.xMin) * zoomFactor;
    const newHeight = (this.viewport.yMax - this.viewport.yMin) * zoomFactor;

    const currentWidth = this.viewport.xMax - this.viewport.xMin;
    const currentHeight = this.viewport.yMax - this.viewport.yMin;
    
    if (newWidth < this.minZoom || newHeight < this.minZoom) return;
    if (newWidth > this.maxZoom || newHeight > this.maxZoom) return;

    this.viewport.xMin = worldX - (this.mouseX / this.displayWidth) * newWidth;
    this.viewport.xMax = this.viewport.xMin + newWidth;
    this.viewport.yMax = worldY + ((this.displayHeight - this.mouseY) / this.displayHeight) * newHeight;
    this.viewport.yMin = this.viewport.yMax - newHeight;

    this.updateInputs();
    this.draw();
  }

  resetView() {
    this.viewport = { ...this.originalViewport };
    this.selectedPoints = [];
    this.updateInputs();
    this.draw();
  }

  toggleFullscreen() {
    const canvasContainer = document.querySelector('.canvas-container');
    
    if (!this.isFullscreen) {
      // Vào chế độ fullscreen
      if (canvasContainer.requestFullscreen) {
        canvasContainer.requestFullscreen();
      } else if (canvasContainer.webkitRequestFullscreen) {
        canvasContainer.webkitRequestFullscreen();
      } else if (canvasContainer.msRequestFullscreen) {
        canvasContainer.msRequestFullscreen();
      }
      
      canvasContainer.classList.add('fullscreen');
      this.isFullscreen = true;
    } else {
      // Thoát chế độ fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      
      canvasContainer.classList.remove('fullscreen');
      this.isFullscreen = false;
    }
    
    // Xử lý sự kiện khi thoát fullscreen
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        canvasContainer.classList.remove('fullscreen');
        this.isFullscreen = false;
        this.resizeCanvas();
        this.draw();
      }
    });
    
    this.resizeCanvas();
    this.draw();
  }

  addManualPoint() {
    const inputX = document.getElementById('manual-x');
    const xValue = parseFloat(inputX.value);
    
    if (isNaN(xValue)) {
      alert('Vui lòng nhập giá trị x hợp lệ');
      return;
    }
    
    const yValue = this.evaluatePolynomial(xValue);
    
    if (!isFinite(yValue)) {
      alert('Không thể tính giá trị y tại điểm x này');
      return;
    }
    
    // Thêm điểm vào danh sách
    const [screenX, screenY] = this.worldToScreen(xValue, yValue);
    
    this.selectedPoints.push({
      x: xValue,
      y: yValue,
      screenX: screenX,
      screenY: screenY,
      type: 'manual' // Đánh dấu điểm được thêm thủ công
    });
    
    // Hiển thị kết quả
    document.getElementById('point-coords').textContent = `(${xValue.toFixed(2)}, ${yValue.toFixed(2)})`;
    
    // Vẽ lại đồ thị
    this.draw();
    
    // Xóa giá trị input
    inputX.value = '';
  }

  updateCoordinatesDisplay(x, y) {
    const coordinatesElement = document.getElementById('coordinates');
    if (x !== null && y !== null) {
      coordinatesElement.textContent = `(${x.toFixed(2)}, ${y.toFixed(2)})`;
      coordinatesElement.style.display = 'block';
    } else {
      coordinatesElement.style.display = 'none';
    }
  }

  screenToWorldX(screenX) {
    return this.viewport.xMin + (screenX / this.displayWidth) * (this.viewport.xMax - this.viewport.xMin);
  }

  screenToWorldY(screenY) {
    return this.viewport.yMax - (screenY / this.displayHeight) * (this.viewport.yMax - this.viewport.yMin);
  }

  setTheme(dark) {
    const mathContainer = document.querySelector('.math-container');
    
    if (dark) {
      // Dark theme
      mathContainer.style.setProperty('--bg', '#0f1724');
      mathContainer.style.setProperty('--axis', 'rgba(255, 255, 255, 0.8)');
      mathContainer.style.setProperty('--tick', 'rgba(255, 255, 255, 0.9)');
      mathContainer.style.setProperty('--grid', 'rgba(255, 255, 255, 0.1)');
      mathContainer.classList.remove('light-theme');
    } else {
      // Light theme
      mathContainer.style.setProperty('--bg', '#ffffff');
      mathContainer.style.setProperty('--axis', 'rgba(0, 0, 0, 0.8)');
      mathContainer.style.setProperty('--tick', 'rgba(0, 0, 0, 0.9)');
      mathContainer.style.setProperty('--grid', 'rgba(0, 0, 0, 0.1)');
      mathContainer.classList.add('light-theme');
    }
    
    this.themeIsDark = dark;
    this.draw();
  }

  updateViewportFromInputs() {
    // Không còn sử dụng inputs này nữa
  }

  updateInputs() {
    // Không còn sử dụng inputs này nữa
  }

  worldToScreen(x, y) {
    const padding = 24;
    const sx = padding + ((x - this.viewport.xMin) / (this.viewport.xMax - this.viewport.xMin)) * (this.displayWidth - 2 * padding);
    const sy = (this.displayHeight - padding) - ((y - this.viewport.yMin) / (this.viewport.yMax - this.viewport.yMin)) * (this.displayHeight - 2 * padding);
    return [sx, sy];
  }

  drawAxes() {
    this.ctx.save();

    const mathContainer = document.querySelector('.math-container');
    const style = getComputedStyle(mathContainer);
    const gridColor = style.getPropertyValue('--grid').trim() || 
                      (this.themeIsDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)');
    const axisColor = style.getPropertyValue('--axis').trim() || 
                      (this.themeIsDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)');
    const tickColor = style.getPropertyValue('--tick').trim() || 
                      (this.themeIsDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)');

    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 1;
    
    const xRange = this.viewport.xMax - this.viewport.xMin;
    const yRange = this.viewport.yMax - this.viewport.yMin;
    
    const xGridStep = this.calculateGridStep(xRange);
    const yGridStep = this.calculateGridStep(yRange);
    
    const padding = 24;
    const startX = Math.ceil(this.viewport.xMin / xGridStep) * xGridStep;
    const endX = Math.floor(this.viewport.xMax / xGridStep) * xGridStep;
    this.ctx.beginPath();
    for (let x = startX; x <= endX; x += xGridStep) {
      const [sx] = this.worldToScreen(x, 0);
      this.ctx.moveTo(sx, padding);
      this.ctx.lineTo(sx, this.displayHeight - padding);
    }
    this.ctx.stroke();

    const startY = Math.ceil(this.viewport.yMin / yGridStep) * yGridStep;
    const endY = Math.floor(this.viewport.yMax / yGridStep) * yGridStep;
    this.ctx.beginPath();
    for (let y = startY; y <= endY; y += yGridStep) {
      const [, sy] = this.worldToScreen(0, y);
      this.ctx.moveTo(padding, sy);
      this.ctx.lineTo(this.displayWidth - padding, sy);
    }
    this.ctx.stroke();

    this.ctx.strokeStyle = axisColor;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    //Trục X
    const [, y0] = this.worldToScreen(0, 0);
    this.ctx.moveTo(padding, y0);
    this.ctx.lineTo(this.displayWidth - padding, y0);
    //Trục Y
    const [x0] = this.worldToScreen(0, 0);
    this.ctx.moveTo(x0, padding);
    this.ctx.lineTo(x0, this.displayHeight - padding);
    this.ctx.stroke();

    const fontSize = Math.max(10, Math.min(14, this.displayWidth / 50));
    this.ctx.font = `bold ${fontSize}px Inter, Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = tickColor;

    let lastXLabelPos = -Infinity;
    const minXLabelSpacing = 60;

    for (let x = startX; x <= endX; x += xGridStep) {
      const [sx, sy] = this.worldToScreen(x, 0);
      
      this.ctx.beginPath();
      this.ctx.moveTo(sx, sy - 5);
      this.ctx.lineTo(sx, sy + 5);
      this.ctx.strokeStyle = tickColor;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      if (Math.abs(sx - lastXLabelPos) >= minXLabelSpacing || x === 0) {
        const label = this.formatTickLabel(x);
        this.ctx.fillText(label, sx, sy + 18);
        lastXLabelPos = sx;
      }
    }

    this.ctx.textAlign = 'right';
    let lastYLabelPos = -Infinity;
    const minYLabelSpacing = 40;

    for (let y = startY; y <= endY; y += yGridStep) {
      const [sx, sy] = this.worldToScreen(0, y);
      
      this.ctx.beginPath();
      this.ctx.moveTo(sx - 5, sy);
      this.ctx.lineTo(sx + 5, sy);
      this.ctx.strokeStyle = tickColor;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      if (Math.abs(sy - lastYLabelPos) >= minYLabelSpacing || y === 0) {
        const label = this.formatTickLabel(y);
        this.ctx.fillText(label, sx - 10, sy);
        lastYLabelPos = sy;
      }
    }

    this.ctx.restore();
  }

  calculateGridStep(range) {
    const idealNumberOfLines = 8;
    const roughStep = range / idealNumberOfLines;
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    
    let step = magnitude;
    if (roughStep / magnitude > 5) {
      step = magnitude * 10;
    } else if (roughStep / magnitude > 2) {
      step = magnitude * 5;
    } else if (roughStep / magnitude > 1) {
      step = magnitude * 2;
    }
    
    return step;
  }

  formatTickLabel(value) {
    if (Math.abs(value) < 0.001) return '0';
    if (Math.abs(value) >= 1000) return value.toExponential(0);
    if (Math.abs(value) < 0.1) return value.toExponential(1);
    
    const formatted = value.toFixed(1);
    return formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted;
  }

  evaluatePolynomial(x) {
    const deg = parseInt(this.degreeSelect.value);
    const coefficients = [];
    
    for (let i = 0; i <= deg; i++) {
      const input = document.getElementById(`a${i}`);
      coefficients[i] = input ? parseFloat(input.value) || 0 : 0;
    }
    
    // Horner's method
    let result = 0;
    for (let i = deg; i >= 0; i--) {
      result = result * x + coefficients[i];
    }
    
    return result;
  }

  drawGraph() {
    const color = document.getElementById('color').value || '#60a5fa';
    const samples = Math.min(2000, this.displayWidth);
    
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2.5;
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    
    this.ctx.beginPath();
    
    let firstPoint = true;
    
    for (let i = 0; i <= samples; i++) {
      const x = this.viewport.xMin + (i / samples) * (this.viewport.xMax - this.viewport.xMin);
      const y = this.evaluatePolynomial(x);
      
      if (!isFinite(y)) {
        firstPoint = true;
        continue;
      }
      
      const [sx, sy] = this.worldToScreen(x, y);
      
      if (firstPoint) {
        this.ctx.moveTo(sx, sy);
        firstPoint = false;
      } else {
        this.ctx.lineTo(sx, sy);
      }
    }
    
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawSelectedPoints() {
    const pointColors = [
      '#FFD700', 
      '#FF6B6B', 
      '#4ECDC4', 
      '#45B7D1', 
      '#96CEB4', 
      '#DDA0DD'  
    ];

    this.selectedPoints.forEach((point, index) => {
      const [sx, sy] = this.worldToScreen(point.x, point.y);
      
      point.screenX = sx;
      point.screenY = sy;

      const colorIndex = index % pointColors.length;
      const pointColor = pointColors[colorIndex];

      this.ctx.save();
      this.ctx.fillStyle = pointColor;
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(sx, sy, 8, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.restore();

      this.ctx.save();
      this.ctx.fillStyle = pointColor;
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 1;
      this.ctx.font = 'bold 14px Arial, sans-serif';
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'bottom';
      
      const labelText = `${index + 1}: (${point.x.toFixed(2)}, ${point.y.toFixed(2)})`;
      const textMetrics = this.ctx.measureText(labelText);
      const padding = 8;
      const labelWidth = textMetrics.width + padding * 2;
      const labelHeight = 20 + padding * 2;
      
      let labelX = sx + 15;
      let labelY = sy - 15;
      
      if (labelX + labelWidth > this.displayWidth) {
        labelX = sx - labelWidth - 15;
      }
      if (labelY - labelHeight < 0) {
        labelY = sy + 15 + labelHeight;
      }
      
      for (let i = 0; i < index; i++) {
        const prevPoint = this.selectedPoints[i];
        if (prevPoint.labelX && prevPoint.labelY) {
          if (Math.abs(labelX - prevPoint.labelX) < labelWidth && 
              Math.abs(labelY - prevPoint.labelY) < labelHeight) {
            labelY = prevPoint.labelY + labelHeight + 5;
          }
        }
      }
      
      point.labelX = labelX;
      point.labelY = labelY;
      
      this.ctx.fillStyle = pointColor + 'DD'; // Thêm độ trong suốt
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.roundRect(labelX, labelY - labelHeight, labelWidth, labelHeight, 5);
      this.ctx.fill();
      this.ctx.stroke();
      
      this.ctx.fillStyle = '#000000';
      this.ctx.fillText(labelText, labelX + padding, labelY - padding);
      this.ctx.restore();
    });
  }

  draw() {
    this.resizeCanvas();

    if (this.displayWidth === 0 || this.displayHeight === 0) {
      return;
    }

    this.ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);
    
    const mathContainer = document.querySelector('.math-container');
    const style = getComputedStyle(mathContainer);
    const bgColor = style.getPropertyValue('--bg').trim() || 
                   (this.themeIsDark ? '#0f1724' : '#ffffff');
    this.ctx.fillStyle = bgColor;
    this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

    this.drawAxes();
    this.drawGraph();
    
    this.drawSelectedPoints();
  }

  cleanup() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}

window.MathModule = (function() {
  let instance = null;
  
  return {
    init: function() {
      if (instance) {
        instance.cleanup();
      }
      instance = new MathGraph();
      instance.init();
    }
  };
})();