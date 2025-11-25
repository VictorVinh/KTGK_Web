class ProgressTracker {
    constructor() {
        this.storageKey = 'learning_progress';
        this.sessionKey = 'current_session_progress';
        this.targetVisits = 10; // Mục tiêu 10 lượt truy cập cho mỗi môn
        this.init();
    }

    init() {
        if (!this.getStoredData()) {
            this.resetProgress();
        }
        this.updateDisplay();
    }

    getStoredData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Lỗi đọc dữ liệu:', error);
            return null;
        }
    }

    saveData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Lỗi lưu dữ liệu:', error);
        }
    }

    resetProgress() {
        const defaultData = {
            math: { visits: 0, lastVisit: null },
            chemistry: { visits: 0, lastVisit: null },
            physics: { visits: 0, lastVisit: null },
            totalSessions: 0,
            createdAt: new Date().toISOString()
        };
        this.saveData(defaultData);
        this.updateDisplay();
    }

    trackVisit(subject) {
        const data = this.getStoredData() || this.resetProgress();
        
        if (data[subject]) {
            data[subject].visits += 1;
            data[subject].lastVisit = new Date().toISOString();
            data.totalSessions = (data.totalSessions || 0) + 1;
            
            this.saveData(data);
            this.updateDisplay();
            
            console.log(`Đã ghi nhận lượt truy cập môn ${subject}. Tổng: ${data[subject].visits}`);
        }
    }

    calculateProgress(visits) {
        return Math.min((visits / this.targetVisits) * 100, 100);
    }

    getFavoriteSubject(data) {
        const subjects = ['math', 'chemistry', 'physics'];
        let maxVisits = 0;
        let favorite = 'none';
        
        subjects.forEach(subject => {
            if (data[subject].visits > maxVisits) {
                maxVisits = data[subject].visits;
                favorite = subject;
            }
        });
        
        const subjectNames = {
            'math': 'Toán học',
            'chemistry': 'Hóa học', 
            'physics': 'Vật lý',
            'none': 'Chưa có'
        };
        
        return subjectNames[favorite];
    }

    getCompletionRate(data) {
        const subjects = ['math', 'chemistry', 'physics'];
        const totalPossible = subjects.length * this.targetVisits;
        const actualTotal = subjects.reduce((sum, subject) => 
            sum + Math.min(data[subject].visits, this.targetVisits), 0);
        
        return Math.round((actualTotal / totalPossible) * 100);
    }

    updateDisplay() {
        const data = this.getStoredData();
        if (!data) return;

        ['math', 'chemistry', 'physics'].forEach(subject => {
            const visits = data[subject]?.visits || 0;
            const progress = this.calculateProgress(visits);
            const countElement = document.getElementById(`${subject}-count`);
            const progressElement = document.getElementById(`${subject}-progress`);

            if (progressElement) {
                progressElement.classList.remove('math-progress', 'chem-progress', 'phys-progress');
                if (subject === 'math') progressElement.classList.add('math-progress');
                if (subject === 'chemistry') progressElement.classList.add('chem-progress');
                if (subject === 'physics') progressElement.classList.add('phys-progress');
                progressElement.style.width = `${progress}%`;
            }
            if (countElement) {
                countElement.textContent = `${visits} lượt`;
            }
        });

        //Thống kê
        const totalElement = document.getElementById('total-count');
        const favoriteElement = document.getElementById('fav-subject');
        const completionElement = document.getElementById('completion-rate');
        
        if (totalElement) {
            totalElement.textContent = data.totalSessions || 0;
        }
        if (favoriteElement) {
            favoriteElement.textContent = this.getFavoriteSubject(data);
        }
        if (completionElement) {
            completionElement.textContent = `${this.getCompletionRate(data)}%`;
        }
    }

    getProgressReport() {
        const data = this.getStoredData();
        if (!data) return null;

        return {
            math: {
                visits: data.math.visits,
                progress: this.calculateProgress(data.math.visits),
                target: this.targetVisits
            },
            chemistry: {
                visits: data.chemistry.visits,
                progress: this.calculateProgress(data.chemistry.visits),
                target: this.targetVisits
            },
            physics: {
                visits: data.physics.visits,
                progress: this.calculateProgress(data.physics.visits),
                target: this.targetVisits
            },
            totalSessions: data.totalSessions,
            favoriteSubject: this.getFavoriteSubject(data),
            overallCompletion: this.getCompletionRate(data)
        };
    }
}

window.progressTracker = new ProgressTracker();

function resetProgress() {
    if (confirm('Bạn có chắc chắn muốn reset toàn bộ tiến độ học tập?')) {
        window.progressTracker.resetProgress();
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--secondary);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        notification.textContent = 'Đã reset tiến độ học tập';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

function trackSubjectVisit(subject) {
    if (window.progressTracker) {
        window.progressTracker.trackVisit(subject);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (window.progressTracker) {
        window.progressTracker.updateDisplay();
    }
});