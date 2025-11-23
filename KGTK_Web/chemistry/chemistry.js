class ChemistryLab {
  constructor() {
    this.labArea = document.getElementById('lab-area-2d');
    this.beaker = document.querySelector('.beaker-container');
    this.liquid = document.getElementById('liquid');
    this.reactionResult = document.getElementById('reaction-result');
    this.notification = document.getElementById('lab-notification');

    this.elementsData = {
      'H': { name: 'Hydrogen', color: '#ff6b6b' }, 
      'O': { name: 'Oxygen', color: '#4ecdc4' },   
      'C': { name: 'Carbon', color: '#556270' },   
      'Na': { name: 'Sodium', color: '#f7d794' },  
      'Cl': { name: 'Chlorine', color: '#778beb' },
      'N': { name: 'Nitrogen', color: '#786fa6' }  
    };

    this.recipes = [
      {
        inputs: { 'H': 2, 'O': 1 },
        product: 'H₂O',
        name: 'Nước Tinh Khiết',
        desc: 'Nước Tinh Khiết',
        color: '#3498db',
        type: 'liquid'
      },
      {
        inputs: { 'Na': 1, 'Cl': 1 },
        product: 'NaCl',
        name: 'Muối Ăn',
        desc: 'Muối Ăn',
        color: '#ecf0f1', 
        type: 'solid'
      },
      {
        inputs: { 'C': 1, 'O': 2 },
        product: 'CO₂',
        name: 'Khí CO₂',
        desc: 'Khí Carbon Dioxide',
        color: '#95a5a6', 
        type: 'gas'
      },
      {
        inputs: { 'N': 1, 'H': 3 },
        product: 'NH₃',
        name: 'Ammonia',
        desc: 'Ammonia với mùi khai đặc trưng',
        color: '#a29bfe',
        type: 'gas'
      }
    ];

    this.atoms = []; 
    
    this.atomRadius = 30; 

    this.init();
  }

  init() {
    this.bindEvents();
    this.startBubbleAnimation();
    this.physicsLoop();
  }

  bindEvents() {
    // Nút thêm nguyên tố
    document.querySelectorAll('.element-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = e.target.dataset.element;
        // Hiệu ứng nút bấm
        e.target.style.transform = 'scale(0.95)';
        setTimeout(() => e.target.style.transform = '', 100);
        this.spawnAtom(type);
      });
    });

    // Nút phản ứng
    document.getElementById('mix-btn').addEventListener('click', () => {
      this.checkReactions();
    });

    // Nút xóa
    document.getElementById('clear-lab').addEventListener('click', () => {
      this.clearLab();
    });
  }

  spawnAtom(type) {
    const elData = this.elementsData[type];
    
    const el = document.createElement('div');
    el.className = 'lab-element';
    el.dataset.type = type;
    el.style.backgroundColor = elData.color;
    el.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), ${elData.color})`;
    el.innerHTML = `<strong>${type}</strong><span>${elData.name}</span>`;
    
    this.labArea.appendChild(el);

    const containerRect = this.labArea.getBoundingClientRect();
    const startX = (containerRect.width / 2) + (Math.random() * 40 - 20); 
    const startY = -60;

    const targetY = containerRect.height - 100 - (Math.random() * 100);

    const atomObj = {
      el: el,
      type: type,
      x: startX,
      y: startY, 
      vx: (Math.random() - 0.5) * 2, 
      vy: 0, 
      isDragging: false,
      dragOffsetX: 0,
      dragOffsetY: 0,
      targetY: targetY 
    };

    this.setupDrag(atomObj);
    
    this.atoms.push(atomObj);

    const dropAnim = el.animate([
      { transform: `translate(${startX - this.atomRadius}px, ${startY}px) scale(0.5)`, opacity: 0 },
      { transform: `translate(${startX - this.atomRadius}px, ${targetY}px) scale(1.2)`, opacity: 1, offset: 0.7 }, // Nảy
      { transform: `translate(${startX - this.atomRadius}px, ${targetY}px) scale(1)`, opacity: 1 }
    ], {
      duration: 600,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      fill: 'forwards'
    });

    dropAnim.onfinish = () => {
      atomObj.y = targetY;
      el.style.animation = 'none'; 
      this.renderAtom(atomObj);
    };
  }

  setupDrag(atom) {
    const onMouseDown = (e) => {
      e.preventDefault(); 
      
      atom.isDragging = true;
      atom.vx = 0;
      atom.vy = 0;
      
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      
      const rect = this.labArea.getBoundingClientRect();
      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;

      atom.dragOffsetX = mouseX - atom.x;
      atom.dragOffsetY = mouseY - atom.y;

      atom.el.style.zIndex = 1000;
      atom.el.style.cursor = 'grabbing';
      atom.el.style.transition = 'none'; 
    };

    const onMouseMove = (e) => {
      if (!atom.isDragging) return;
      e.preventDefault(); 

      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      const rect = this.labArea.getBoundingClientRect();
      
      atom.x = (clientX - rect.left) - atom.dragOffsetX;
      atom.y = (clientY - rect.top) - atom.dragOffsetY;
    };

    const onMouseUp = () => {
      if (atom.isDragging) {
        atom.isDragging = false;
        atom.el.style.zIndex = 100;
        atom.el.style.cursor = 'grab';

        atom.vx = (Math.random() - 0.5) * 4; 
        atom.vy = (Math.random() - 0.5) * 4;
      }
    };

    atom.el.addEventListener('mousedown', onMouseDown);
    atom.el.addEventListener('touchstart', onMouseDown, { passive: false });

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onMouseMove, { passive: false });
    
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onMouseUp);
  }

  physicsLoop() {
    const width = this.labArea.clientWidth;
    const height = this.labArea.clientHeight;
    const beakerWidth = 260; 
    const beakerX = (width - beakerWidth) / 2;
    const beakerY_Bottom = height - 10; 
    const beakerY_Top = height - 300; 

    this.atoms.forEach(atom => {
      if (atom.isDragging) {
        this.renderAtom(atom);
        return; 
      }

      //Chuyển động Brown
      atom.vx += (Math.random() - 0.5) * 0.3; 
      atom.vy += (Math.random() - 0.5) * 0.3;
      
      atom.vx *= 0.95;
      atom.vy *= 0.95;

      //cập nhật vị trí
      atom.x += atom.vx;
      atom.y += atom.vy;

      const r = this.atomRadius;

      // Tường trái
      if (atom.x - r < beakerX) {
        atom.x = beakerX + r;
        atom.vx *= -0.8; 
      }
      // Tường phải
      if (atom.x + r > beakerX + beakerWidth) {
        atom.x = beakerX + beakerWidth - r;
        atom.vx *= -0.8;
      }
      // Đáy cốc
      if (atom.y + r > beakerY_Bottom) {
        atom.y = beakerY_Bottom - r;
        atom.vy *= -0.8;
      }
      // Mặt thoáng
      if (atom.y - r < beakerY_Top) {
        atom.y = beakerY_Top + r;
        atom.vy += 0.5; 
      }
    });

    for (let i = 0; i < this.atoms.length; i++) {
      for (let j = i + 1; j < this.atoms.length; j++) {
        const a1 = this.atoms[i];
        const a2 = this.atoms[j];

        const dx = a2.x - a1.x;
        const dy = a2.y - a1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = this.atomRadius * 2 + 2; 

        if (distance < minDistance) {
          const angle = Math.atan2(dy, dx);
          const overlap = minDistance - distance;
          
          const force = 0.05; 
          const pushX = Math.cos(angle) * overlap * force;
          const pushY = Math.sin(angle) * overlap * force;

          if (!a1.isDragging) {
            a1.vx -= pushX;
            a1.vy -= pushY;
          }
          if (!a2.isDragging) {
            a2.vx += pushX;
            a2.vy += pushY;
          }
        }
      }
    }

    this.atoms.forEach(atom => this.renderAtom(atom));

    requestAnimationFrame(() => this.physicsLoop());
  }

  renderAtom(atom) {
    const renderX = atom.x - this.atomRadius;
    const renderY = atom.y - this.atomRadius;
    
    atom.el.style.transform = `translate(${renderX}px, ${renderY}px)`;
  }

  checkReactions() {
    if (this.atoms.length === 0) {
      this.showNotification("Cốc trống trơn", "warning");
      return;
    }

    const inventory = {};
    this.atoms.forEach(atom => {
      inventory[atom.type] = (inventory[atom.type] || 0) + 1;
    });

    let reactionFound = false;

    for (const recipe of this.recipes) {
      let enough = true;
      for (const [elem, count] of Object.entries(recipe.inputs)) {
        if (!inventory[elem] || inventory[elem] < count) {
          enough = false;
          break;
        }
      }

      if (enough) {
        this.executeReaction(recipe);
        reactionFound = true;
        break; 
      }
    }

    if (!reactionFound) {
      this.triggerFailState();
    }
  }

  triggerFailState() {
    this.showNotification("Chưa đủ điều kiện phản ứng", "error");
    
    this.beaker.classList.add('shake-it'); 
    setTimeout(() => this.beaker.classList.remove('shake-it'), 500);

    const oldBg = this.liquid.style.background;
    this.liquid.style.background = '#7f8c8d'; 
    setTimeout(() => this.liquid.style.background = oldBg, 500);

    this.atoms.forEach(atom => {
      atom.vx += (Math.random() - 0.5) * 20;
      atom.vy += (Math.random() - 0.5) * 20;
    });
  }

  executeReaction(recipe) {
    this.showNotification(`Thành công tạo ra ${recipe.name}`, "success");

    const reactants = [];
    const atomsCopy = [...this.atoms];
    
    for (const [elem, count] of Object.entries(recipe.inputs)) {
      let needed = count;
      for (let i = 0; i < atomsCopy.length; i++) {
        if (needed === 0) break;
        const atom = atomsCopy[i];
        
        if (atom.type === elem && !reactants.includes(atom)) {
          reactants.push(atom);
          needed--;
        }
      }
    }

    const centerX = this.labArea.clientWidth / 2;
    const centerY = this.labArea.clientHeight - 150;

    reactants.forEach(atom => {
      atom.isDragging = true; 
      
      const idx = this.atoms.indexOf(atom);
      if (idx > -1) this.atoms.splice(idx, 1);

      atom.el.style.transition = 'all 0.5s ease-in';
      atom.el.style.transform = `translate(${centerX - 30}px, ${centerY - 30}px) scale(0.1)`;
      atom.el.style.opacity = 0;

      setTimeout(() => atom.el.remove(), 500);
    });

    setTimeout(() => {
      this.spawnProduct(recipe, centerX, centerY);
      
      if (recipe.type === 'liquid') {
        this.liquid.style.background = `linear-gradient(to bottom, ${recipe.color}aa, ${recipe.color})`;
      }
    }, 500);
  }

  spawnProduct(recipe, x, y) {
    const product = document.createElement('div');
    product.className = 'molecule';
    product.innerHTML = `
      <div style="text-align:center">
        <div style="font-size: 1.5rem; color: ${recipe.color}">${recipe.product}</div>
        <div style="font-size: 0.8rem; font-weight: normal; color: #333">${recipe.name}</div>
      </div>`;
    product.style.left = `${x - 60}px`;
    product.style.top = `${y - 40}px`;
    product.style.zIndex = 200;
    
    this.labArea.appendChild(product);

    this.reactionResult.style.display = 'block';
    this.reactionResult.innerHTML = `
      <h3 style="color: ${recipe.color}">${recipe.name} (${recipe.product})</h3>
      <p>${recipe.desc}</p>
      <div style="margin-top:10px; padding: 10px; background: #f0f9ff; border-radius: 8px; border: 1px dashed ${recipe.color}">
        <strong>Phương trình:</strong><br>
        ${this.formatEquation(recipe)}
      </div>`;

    setTimeout(() => {
      product.style.transition = 'all 0.5s';
      product.style.transform = 'scale(1.5)';
      product.style.opacity = 0;
      setTimeout(() => product.remove(), 500);
    }, 3000);
  }

  formatEquation(recipe) {
    const inputs = Object.entries(recipe.inputs).map(([k, v]) => `${v === 1 ? '' : v}${k}`).join(' + ');
    return `${inputs} ⟶ ${recipe.product}`;
  }

  clearLab() {
    this.atoms.forEach(atom => atom.el.remove());
    this.atoms = [];
    
    this.reactionResult.style.display = 'none';
    this.liquid.style.background = 'linear-gradient(to bottom, rgba(78, 205, 196, 0.4), rgba(41, 128, 185, 0.6))';
    
    this.showNotification('Đã dọn dẹp', 'success');
  }

  showNotification(msg, type = 'success') {
    this.notification.textContent = msg;
    this.notification.style.display = 'block';
    this.notification.style.opacity = '1';
    
    if (type === 'warning') this.notification.style.background = '#f1c40f';
    else if (type === 'error') this.notification.style.background = '#e74c3c';
    else this.notification.style.background = '#2ecc71';

    setTimeout(() => {
      this.notification.style.opacity = '0';
      setTimeout(() => this.notification.style.display = 'none', 300);
    }, 2500);
  }

  startBubbleAnimation() {
    const container = document.getElementById('bubbles-container');
    if (!container) return;
    
    setInterval(() => {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      const size = Math.random() * 10 + 5;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 80 + 10}%`; 
      
      container.appendChild(bubble);
      
      setTimeout(() => bubble.remove(), 4000);
    }, 600); 
  }
}

window.ChemistryModule = {
  init: function() {
    if (window.currentChemLab) {
    }
    window.currentChemLab = new ChemistryLab();
  }
};