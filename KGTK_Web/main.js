class LearningPlatform {
  constructor() {
    this.currentSubject = null;
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadInitialState();
  }

  bindEvents() {
    document.querySelectorAll('.subject-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const subject = e.currentTarget.dataset.subject;
        this.selectSubject(subject);
      });
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const subject = e.target.dataset.nav;
        this.selectSubject(subject);
      });
    });

    const navLogo = document.getElementById('nav-logo');
    if (navLogo) {
      navLogo.addEventListener('click', () => {
        this.returnToHomepage();
      });
    }

    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('back-button')) {
        this.showSubjectSelection();
      }
    });
  }

  returnToHomepage() {
    this.showSubjectSelection();
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    window.history.pushState({}, '', window.location.pathname);
  }

  loadInitialState() {
    const urlParams = new URLSearchParams(window.location.search);
    const subject = urlParams.get('subject');
    
    if (subject && ['math', 'chemistry', 'physics', 'about'].includes(subject)) {
      this.selectSubject(subject);
    }
  }

  async selectSubject(subject) {
    this.currentSubject = subject;
    
    const newUrl = `${window.location.pathname}?subject=${subject}`;
    window.history.pushState({ subject }, '', newUrl);

    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.toggle('active', l.dataset.nav === subject);
    });

    document.querySelector('.subject-selection').style.display = 'none';
    
    document.querySelectorAll('.subject-content').forEach(el => el.classList.add('hidden'));

    const contentArea = document.getElementById(`${subject}-content`);
    
    contentArea.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    `;
    contentArea.classList.remove('hidden');

    // Routing tải nội dung
    try {
      await this.loadSubjectContent(subject);
    } catch (error) {
      console.error('Error:', error);
      contentArea.innerHTML = `
        <div class="error-message" style="margin: 20px; text-align: center;">
            <h3>Lỗi kết nối</h3>
            <p>Không thể tải nội dung. Vui lòng thử lại.</p>
            <button class="back-button" style="margin-top: 10px;">Quay lại</button>
        </div>
      `;
    }
  }

  async loadSubjectContent(subject) {
    const contentArea = document.getElementById(`${subject}-content`);
    
    switch (subject) {
      case 'math':
        await this.loadModule(contentArea, 'math');
        break;
      case 'chemistry':
        await this.loadModule(contentArea, 'chemistry');
        break;
      case 'about':
        await this.loadModule(contentArea, 'about');
        break;
      case 'physics':
        this.loadPhysicsContent(contentArea);
        break;
    }
  }

  async loadModule(container, name) {
    const response = await fetch(`${name}/${name}.html`);
    if (!response.ok) throw new Error(`Failed to load ${name}`);
    const html = await response.text();
    
    container.innerHTML = `<div style="padding: 20px;"><button class="back-button">Quay lại</button></div>${html}`;

    if (!document.querySelector(`link[href="${name}/${name}.css"]`)) {
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = `${name}/${name}.css`;
        document.head.appendChild(css);
    }

    // Quy ước: Tên module JS global sẽ là: MathModule, ChemistryModule, AboutModule
    const moduleName = name.charAt(0).toUpperCase() + name.slice(1) + 'Module';
    
    if (!window[moduleName]) {
        await this.loadScript(`${name}/${name}.js`);
    }

    setTimeout(() => {
        if (window[moduleName] && typeof window[moduleName].init === 'function') {
            window[moduleName].init();
        }
    }, 50);
  }

  loadPhysicsContent(container) {
    container.innerHTML = `
      <div style="padding: 20px;"><button class="back-button">Quay lại</button></div>
      <div class="coming-soon">
        <img src="Images/error.png" style="width: 150px; opacity: 0.5; margin-bottom: 20px;">
        <h2>Vật lý đang được xây dựng</h2>
        <p>Chúng tôi đang nỗ lực hoàn thiện mô phỏng vật lý</p>
      </div>
    `;
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  showSubjectSelection() {
    document.querySelectorAll('.subject-content').forEach(content => {
      content.classList.add('hidden');
    });
    document.querySelector('.subject-selection').style.display = 'block';

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    window.history.pushState({}, '', window.location.pathname);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new LearningPlatform();
});