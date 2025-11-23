class LearningPlatform {
  constructor() {
    this.currentSubject = null;
    this.mathInitialized = false;
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

    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('back-button')) {
        this.showSubjectSelection();
      }
    });

    const appLogo = document.getElementById('app-logo');
    if (appLogo) {
      appLogo.addEventListener('click', () => {
        this.returnToHomepage();
      });
    }
  }

  returnToHomepage() {
    if (!this.currentSubject) return;
    this.showSubjectSelection();
  }

  loadInitialState() {
    // VD: website.com?subject=math --> Tự động mở Math
    const urlParams = new URLSearchParams(window.location.search);
    const subject = urlParams.get('subject');
    
    if (subject && ['math', 'chemistry', 'physics'].includes(subject)) {
      this.selectSubject(subject);
    }
  }

  async selectSubject(subject) {
    this.currentSubject = subject;
    // Update URL
    const newUrl = `${window.location.pathname}?subject=${subject}`;
    window.history.pushState({ subject }, '', newUrl);

    document.querySelector('.subject-selection').style.display = 'none';
    
    // Show loading state
    const contentArea = document.getElementById(`${subject}-content`);
    contentArea.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>Đang tải môn ${this.getSubjectName(subject)}...</p>
      </div>
    `;
    contentArea.classList.remove('hidden');

    // Load subject content (Có handle lỗi)
    try {
      await this.loadSubjectContent(subject);
    } catch (error) {
      console.error('Error loading subject:', error);
      contentArea.innerHTML = `
        <button class="back-button">Quay lại</button>
        <div class="error-message">
          <h3>Lỗi khi tải nội dung</h3>
          <p>Không thể tải nội dung môn ${this.getSubjectName(subject)}. Vui lòng thử lại.</p>
        </div>
      `;
    }
  }

  async loadSubjectContent(subject) {
    const contentArea = document.getElementById(`${subject}-content`);
    
    switch (subject) {
      case 'math':
        await this.loadMathContent(contentArea);
        break;
      case 'chemistry':
        await this.loadChemistryContent(contentArea);
        break;
      case 'physics':
        await this.loadPhysicsContent(contentArea);
        break;
    }
  }

  async loadMathContent(container) {
    try {
      const response = await fetch('math/math.html');
      if (!response.ok) throw new Error('Failed to load math HTML');
      const html = await response.text();
      container.innerHTML = `<button class="back-button">Quay lại chọn môn</button> ${html}`;

      const mathCSS = document.createElement('link');
      mathCSS.rel = 'stylesheet';
      mathCSS.href = 'math/math.css';
      document.head.appendChild(mathCSS);

      if (!window.MathModule) {
        await this.loadScript('math/math.js');
      }
      
      // Đảm bảo DOM đã render xong
      setTimeout(() => {
        if (window.MathModule) {
          window.MathModule.init();
        }
      }, 100);
      
    } catch (error) {
      console.error('Error loading math content:', error);
      container.innerHTML = `
        <button class="back-button">Quay lại chọn môn</button>
        <div class="error-message">
          <h3>Lỗi khi tải nội dung Toán học</h3>
          <p>Vui lòng thử lại sau.</p>
        </div>
      `;
    }
  }

  async loadChemistryContent(container) {
    try {
      const response = await fetch('chemistry/chemistry.html');
      if (!response.ok) throw new Error('Failed to load chemistry HTML');
      const html = await response.text();
      
      container.innerHTML = `<button class="back-button">Quay lại chọn môn</button>${html}`;

      const chemCSS = document.createElement('link');
      chemCSS.rel = 'stylesheet';
      chemCSS.href = 'chemistry/chemistry.css';
      document.head.appendChild(chemCSS);

      if (!window.ChemistryModule) {
        await this.loadScript('chemistry/chemistry.js');
      }
      
      // Đảm bảo DOM đã render xong
      setTimeout(() => {
        if (window.ChemistryModule && typeof window.ChemistryModule.init === 'function') {
          window.ChemistryModule.init();
        } else {
          console.error('ChemistryModule not found or init is not a function');
        }
      }, 100);
      
    } catch (error) {
      console.error('Error loading chemistry content:', error);
      container.innerHTML = `
        <button class="back-button">Quay lại chọn môn</button>
        <div class="error-message">
          <h3>Lỗi khi tải nội dung Hóa học</h3>
          <p>Vui lòng thử lại sau.</p>
          <p>Chi tiết lỗi: ${error.message}</p>
        </div>
      `;
    }
  }

  async loadPhysicsContent(container) {
    container.innerHTML = `
      <button class="back-button">Quay lại chọn môn</button>
      <div class="coming-soon">
        <h2>Môn Vật lý</h2>
        <p>Nội dung đang được phát triển...</p>
        <img src="error.png" alt="Coming Soon" />
      </div>
    `;
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      // Tải file JS không đồng bộ, nếu thành công thì resolve, lỗi thì reject, có thể dùng với await và async
      script.onload = resolve;  
      script.onerror = reject;  
      document.body.appendChild(script);
    });
  }

  showSubjectSelection() {
    document.querySelectorAll('.subject-content').forEach(content => {
      content.classList.add('hidden');
    });

    document.querySelector('.subject-selection').style.display = 'grid';
    window.history.pushState({}, '', window.location.pathname);
  }

  getSubjectName(subject) {
    const names = {
      math: 'Toán học',
      chemistry: 'Hóa học',
      physics: 'Vật lý'
    };
    return names[subject] || subject;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new LearningPlatform();
});

// Handle browser back/forward buttons
window.addEventListener('popstate', (event) => {
  if (event.state && event.state.subject) {
    // Handle subject navigation from history
  } else {
    document.querySelectorAll('.subject-content').forEach(content => {
      content.classList.add('hidden');
    });
    document.querySelector('.subject-selection').style.display = 'grid';
  }
});