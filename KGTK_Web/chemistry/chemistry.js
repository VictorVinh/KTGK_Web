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
        inputs: { 'H': 12, 'O': 6, 'C': 6 },
        product: 'C₆H₁₂O₆',
        name: 'Glucose',
        desc: 'Glucose - đường đơn (nguồn năng lượng chính cho tế bào)',
        color: '#fdcb6e',
        type: 'solid'
      },
      {
  inputs: { 'Na': 1, 'H': 1, 'C': 1, 'O': 3 },
  product: 'NaHCO₃',
  name: 'Sodium Bicarbonate',
  desc: 'Natri bicacbonat - Baking soda (tác dụng khử axit, làm bánh, tẩy rửa nhẹ)',
  color: '#ffeaa7',
  type: 'solid'
},
{
  inputs: { 'Na': 1, 'N': 1, 'O': 3 },
  product: 'NaNO₃',
  name: 'Sodium Nitrate',
  desc: 'Natri nitrat - phân bón, chất oxy hóa',
  color: '#fd79a8',
  type: 'solid'
},
{
  inputs: { 'N': 1, 'H': 4, 'Cl': 1 },
  product: 'NH₄Cl',
  name: 'Ammonium Chloride',
  desc: 'Amoni clorua - muối amoni (dùng trong pin khô, phân bón, tinh chế kim loại)',
  color: '#74b9ff',
  type: 'solid'
},
{
  inputs: { 'Na': 1, 'C': 2, 'H': 3, 'O': 2 },
  product: 'CH₃COONa',
  name: 'Sodium Acetate',
  desc: 'Natri axetat - muối hữu cơ của axit axetic (đệm, chế độ làm nóng tự giải phóng)',
  color: '#ffd79b',
  type: 'solid'
},
{
  inputs: { 'C': 2, 'H': 5, 'N': 1, 'O': 2 },
  product: 'C₂H₅NO₂',
  name: 'Glycine',
  desc: 'Glycine - axit amin đơn giản nhất (thành phần protein, chất đệm)',
  color: '#a29bfe',
  type: 'solid'
},
{
  inputs: { 'C': 2, 'H': 5, 'N': 1, 'O': 1 },
  product: 'C₂H₅NO',
  name: 'Acetamide',
  desc: 'Acetamide - amide đơn (dung môi, trung gian tổng hợp hữu cơ)',
  color: '#81ecec',
  type: 'solid'
},
{
  inputs: { 'C': 2, 'H': 3, 'Cl': 1, 'O': 2 },
  product: 'C₂H₃ClO₂',
  name: 'Chloroacetic Acid',
  desc: 'Axit chloroacetic - chất hoạt tính để tổng hợp hữu cơ (tính ăn mòn cao)',
  color: '#ff7675',
  type: 'solid'
},
{
  inputs: { 'C': 1, 'H': 4, 'N': 2, 'O': 1 },
  product: 'CH₄N₂O',
  name: 'Urea',
  desc: 'Ure - phân bón và nguyên liệu công nghiệp (rất hòa tan, chứa N cao)',
  color: '#55efc4',
  type: 'solid'
},
{
  inputs: { 'Na': 1, 'O': 1, 'H': 1 },
  product: 'NaOH',
  name: 'Sodium Hydroxide',
  desc: 'Natri hiđroxit - xút ăn da, tẩy rửa, phòng thí nghiệm (rất bazơ, ăn mòn)',
  color: '#636e72',
  type: 'solid'
},
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
    document.querySelectorAll('.element-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const btnEl = e.currentTarget;
        const type = btnEl.dataset.element;
        btnEl.style.transform = 'scale(0.95)';
        setTimeout(() => btnEl.style.transform = '', 100);

        // determine how many to spawn from the adjacent input (if present)
        let count = 1;
        const wrapper = btnEl.closest('.element-item');
        if (wrapper) {
          const input = wrapper.querySelector('.element-count[data-element="' + type + '"]');
          if (input) count = Math.max(1, parseInt(input.value, 10) || 1);
        }

        for (let i = 0; i < count; i++) {
          this.spawnAtom(type);
        }
      });
    });

    document.getElementById('mix-btn').addEventListener('click', () => {
      this.checkReactions();
    });

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

    // Spawn atoms across the beaker mouth at a fixed vertical height
    const beaker = this.beaker || document.querySelector('.beaker-container');
    let startX, startY;
    if (beaker) {
      const beakerRect = beaker.getBoundingClientRect();
      const padding = 8; // keep atoms away from glass walls
      const innerLeft = beakerRect.left - containerRect.left + padding;
      const innerWidth = Math.max(0, beakerRect.width - padding * 2);

      // ensure we don't place atoms outside inner area considering radius
      const minX = innerLeft + this.atomRadius;
      const maxX = innerLeft + Math.max(this.atomRadius, innerWidth - this.atomRadius);
      startX = minX + Math.random() * Math.max(0, maxX - minX);

      // fixed spawn height near beaker rim (relative to container)
      startY = beakerRect.top - containerRect.top + 18;
    } else {
      // fallback to previous behaviour
      startX = (containerRect.width / 3) + (Math.random() * containerRect.width - 20);
      startY = -60;
    }

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

    // choose a merge point inside the liquid (or center fallback)
    const containerRect = this.labArea.getBoundingClientRect();
    const liquidEl = this.liquid || (this.beaker && this.beaker.querySelector('.liquid'));
    let mergeX, mergeY;
    if (liquidEl) {
      const liquidRect = liquidEl.getBoundingClientRect();
      const padding = 12;
      const innerLeft = liquidRect.left - containerRect.left + padding;
      const innerTop = liquidRect.top - containerRect.top + padding;
      const innerWidth = Math.max(20, liquidRect.width - padding * 2);
      const innerHeight = Math.max(20, liquidRect.height - padding * 2);
      mergeX = innerLeft + Math.random() * innerWidth;
      mergeY = innerTop + Math.random() * innerHeight;
    } else {
      mergeX = containerRect.width / 2;
      mergeY = containerRect.height - 150;
    }

    // animate each reactant flying through the air to the merge point
    // slower and more circular (black-hole) flight
    const baseDelay = 180; // ms between each atom start (stagger)
    const transformDur = 2200; // ms movement duration (slower flight)
    const opacityDur = 180; // ms fade after arrival (shorter so merge happens quicker)

    const animPromises = reactants.map((atom, i) => new Promise((resolve) => {
      atom.isDragging = true;

      const idx = this.atoms.indexOf(atom);
      if (idx > -1) this.atoms.splice(idx, 1);

      const delay = i * baseDelay;

      // compute start (current) and end (merge) positions in px for the element transform
      const startTX = atom.x - this.atomRadius;
      const startTY = atom.y - this.atomRadius;
      const endTX = mergeX - this.atomRadius;
      const endTY = mergeY - this.atomRadius;

      // spiral / black-hole path: parametric spiral toward merge point
      const dx = startTX - endTX;
      const dy = startTY - endTY;
      const startR = Math.sqrt(dx * dx + dy * dy);
      let startAngle = Math.atan2(startTY - endTY, startTX - endTX);
      // spins: fewer rotations for more circular paths, with random sign
      const spin = (Math.random() > 0.5 ? 1 : -1) * (Math.PI * (0.8 + Math.random() * 0.9));

      const steps = 40; // higher resolution keyframes for smoother spiral motion
      const keyframes = [];
      const positions = []; // store numeric positions for sparks
      for (let s = 0; s <= steps; s++) {
        const t = s / steps; // 0..1
        // smooth radius interpolation for a natural pull-in
        const rt = startR * (1 - Math.pow(t, 0.95));
        const angleT = startAngle + spin * t;
        const px = endTX + Math.cos(angleT) * rt;
        const py = endTY + Math.sin(angleT) * rt;
        const scale = 1 - 0.35 * t;
        // rotation increases with t
        const rot = Math.round((spin * t) * (180 / Math.PI) + (Math.random() - 0.5) * 22);
        keyframes.push({ transform: `translate(${px}px, ${py}px) scale(${scale}) rotate(${rot}deg)`, offset: t });
        positions.push({ x: px, y: py, offset: t, scale });
      }

      // create multiple rainbow sparks to form a clearer trail (they will lag behind the atom)
      const sparks = [];
      const sparkCount = 6;
      for (let k = 0; k < sparkCount; k++) {
        const sp = document.createElement('div');
        // alternate sizes for depth
        sp.className = 'flight-spark' + (k % 3 === 1 ? ' small' : k % 3 === 2 ? ' tiny' : '');
        // set rainbow hue based on atom index and spark index
        const hue = Math.round((i * 50 + k * 60 + Math.random() * 40) % 360);
        sp.style.background = `hsl(${hue}, 90%, 60%)`;
        sp.style.color = sp.style.background;
        sp.style.boxShadow = `0 0 28px ${sp.style.background}, 0 0 12px ${sp.style.background}`;
        this.labArea.appendChild(sp);
        sparks.push(sp);
      }

      const anim = atom.el.animate(keyframes, {
        duration: transformDur,
        easing: 'cubic-bezier(0.22,0.9,0.3,1)',
        delay: delay,
        fill: 'forwards'
      });

      // Instead of an SVG ribbon trail, use larger, clearer rainbow sparks that follow behind the atom.
      // Increase sparkle count and make them more visible (bigger, stronger glow) and animate with same easing.
      const hueBase = Math.round((i * 50) % 360);
      // adjust spark visuals
      sparks.forEach((sp, k) => {
        // bigger sizes for clearer effect
        const size = 18 - (k % 3) * 4; // 18,14,10
        sp.style.width = `${size}px`;
        sp.style.height = `${size}px`;
        sp.style.opacity = '0.95';
        sp.style.zIndex = 80; // behind atoms
        sp.style.borderRadius = '50%';
        // stronger glow
        sp.style.boxShadow = `0 0 ${18 + size}px ${sp.style.background}, 0 0 ${8 + size/2}px ${sp.style.background}`;
        // color variation
        const hue = Math.round((hueBase + k * 40 + Math.random() * 30) % 360);
        sp.style.background = `hsl(${hue}, 95%, 60%)`;
        sp.style.backgroundColor = sp.style.background;
        this.labArea.appendChild(sp); // ensure appended (was already appended earlier)
      });

      // animate sparks along the same spiral but lagging slightly; shorten duration so they catch up faster
      sparks.forEach((sp, k) => {
        const lagSteps = Math.min(4, 1 + k); // further reduce lag so sparks stay very close to atom
        const offsetKeyframes = positions.map((pos, idx) => {
          const offT = pos.offset;
          const srcIdx = Math.max(0, idx - lagSteps);
          const src = positions[srcIdx];
          const px = src.x + Math.sin(k + offT * Math.PI * 2) * 2 + (k - sparks.length/2) * 2.2;
          const py = src.y + Math.cos(k + offT * Math.PI * 2) * 2 + (k - sparks.length/2) * 2.2;
          const op = Math.max(0, 1 - offT * (0.9 + k * 0.02));
          const sc = Math.max(0.2, 1.1 - k * 0.12 - offT * 0.45);
          return { transform: `translate(${px}px, ${py}px) scale(${sc})`, opacity: op, offset: offT };
        });
        const sparkDur = Math.max(220, Math.round(transformDur * 0.45));
        const sparkAnim = sp.animate(offsetKeyframes, { duration: sparkDur, easing: 'cubic-bezier(0.22,0.9,0.3,1)', delay: Math.max(0, delay + k * 8), fill: 'forwards' });
        sparkAnim.onfinish = () => {
          try { if (sp && sp.remove) sp.remove(); } catch (e) {}
        };
      });

      

      anim.onfinish = () => {
        // remove sparks (they may have finished earlier)
        sparks.forEach(s => { try { if (s && s.remove) s.remove(); } catch (e) {} });
        // fade atom then resolve
        const fade = atom.el.animate([
          { opacity: 1 },
          { opacity: 0 }
        ], { duration: opacityDur, fill: 'forwards' });
        fade.onfinish = () => {
          if (atom.el && atom.el.remove) atom.el.remove();
          resolve();
        };
      };
    }));

    // wait for all atom flight animations to complete, then show merge pulse and spawn product
    Promise.all(animPromises).then(() => {
      // create merge pulse (duration tied to movement duration)
      const pulse = document.createElement('div');
      pulse.className = 'merge-pulse';
      pulse.style.left = `${mergeX}px`;
      pulse.style.top = `${mergeY}px`;
      pulse.style.background = recipe.color || '#ffffff';
      pulse.style.animation = `mergePulse ${Math.max(transformDur, 600)}ms cubic-bezier(0.2,0.8,0.2,1) forwards`;
      this.labArea.appendChild(pulse);

      setTimeout(() => pulse.remove(), Math.max(transformDur, 600) + 80);

      // spawn the product exactly at merge point
      this.spawnProduct(recipe, mergeX, mergeY);

      if (recipe.type === 'liquid') {
        this.liquid.style.background = `linear-gradient(to bottom, ${recipe.color}aa, ${recipe.color})`;
      }
    });
  }

  spawnProduct(recipe, x, y) {
    const product = document.createElement('div');
    product.className = 'molecule';
    product.innerHTML = `
      <div style="text-align:center">
        <div style="font-size: 1.5rem; color: ${recipe.color}">${recipe.product}</div>
        <div style="font-size: 0.8rem; font-weight: normal; color: #333">${recipe.name}</div>
      </div>`;
    // if x/y not provided, choose a random position inside the liquid area
    const containerRect = this.labArea.getBoundingClientRect();
    const liquidEl = this.liquid || (this.beaker && this.beaker.querySelector('.liquid'));
    if (typeof x === 'undefined' || typeof y === 'undefined') {
      if (liquidEl) {
        const liquidRect = liquidEl.getBoundingClientRect();
        const padding = 12; // keep product away from edges
        const innerLeft = liquidRect.left - containerRect.left + padding;
        const innerTop = liquidRect.top - containerRect.top + padding;
        const innerWidth = Math.max(20, liquidRect.width - padding * 2);
        const innerHeight = Math.max(20, liquidRect.height - padding * 2);

        x = innerLeft + Math.random() * innerWidth + innerWidth / 2 - innerWidth / 2;
        y = innerTop + Math.random() * innerHeight + innerHeight / 2 - innerHeight / 2;
      } else {
        x = containerRect.width / 2;
        y = containerRect.height - 150;
      }
    }

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

