class SubjectLoader {
    constructor(subject) {
        this.subject = subject;
        this.moduleName = subject.charAt(0).toUpperCase() + subject.slice(1) + 'Module';
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.checkAuth();
            this.trackVisit();
            this.initSubjectModule();
        });
    }

    checkAuth() {
        const currentUser = localStorage.getItem('currentUser');
        const authOverlay = document.getElementById('auth-overlay');
        const mainApp = document.getElementById('main-app');
        
        if (currentUser) {
            authOverlay.classList.add('hidden');
            mainApp.classList.remove('hidden');
        } else {
            window.location.href = '../index.html';
        }
    }

    trackVisit() {
        console.log(`Bắt đầu track visit cho ${this.subject}`);

        const track = () => {
            if (typeof trackSubjectVisit === 'function') {
                console.log(`Gọi trackSubjectVisit('${this.subject}')`);
                trackSubjectVisit(this.subject);
                
                setTimeout(() => {
                    if (window.progressTracker) {
                        window.progressTracker.updateDisplay();
                    }
                }, 300);
            } else {
                console.error('trackSubjectVisit không tồn tại');
                this.trackVisitFallback();
            }
        };
        setTimeout(track, 100);
    }

    trackVisitFallback() {
        try {
            const storageKey = 'learning_progress';
            const data = JSON.parse(localStorage.getItem(storageKey)) || {
                math: { visits: 0, lastVisit: null },
                chemistry: { visits: 0, lastVisit: null },
                physics: { visits: 0, lastVisit: null },
                totalSessions: 0,
                createdAt: new Date().toISOString()
            };
            
            if (data[this.subject]) {
                data[this.subject].visits += 1;
                data[this.subject].lastVisit = new Date().toISOString();
                data.totalSessions = (data.totalSessions || 0) + 1;
                localStorage.setItem(storageKey, JSON.stringify(data));
                console.log(`Fallback: Đã ghi nhận lượt truy cập ${this.subject}`);
            }
        } catch (error) {
            console.error('Lỗi fallback tracking:', error);
        }
    }

    initSubjectModule() {
        if (window[this.moduleName] && typeof window[this.moduleName].init === 'function') {

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    window[this.moduleName].init();
                });
            } else {
                window[this.moduleName].init();
            }
        } else {
            console.warn(`Module ${this.moduleName} không tồn tại hoặc không có method init`);
        }
    }
}

window.initSubjectPage = function(subject) {
    new SubjectLoader(subject);
};