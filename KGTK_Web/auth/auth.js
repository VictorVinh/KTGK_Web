class AuthSystem {
    constructor() {
        this.overlay = document.getElementById('auth-overlay');
        this.authBox = document.getElementById('auth-box');
        this.mainApp = document.getElementById('main-app');
        
        this.loginForm = document.getElementById('login-form');
        this.registerForm = document.getElementById('register-form');
        this.displayName = document.getElementById('user-display-name');

        this.successModal = document.getElementById('success-modal');
        this.logoutModal = document.getElementById('logout-modal');
        
        this.init();
    }

    init() {
        const storedUsers = localStorage.getItem('users');
        if (!storedUsers) {
            const defaultUsers = [{ username: 'admin', password: '123' }];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }

        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            this.showApp(currentUser);
        }

        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleForms(false);
        });

        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleForms(true);
        });

        this.registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        const logoutBtn = document.getElementById('logout-btn');
        if(logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logoutModal.classList.remove('hidden');
            });
        }

        document.getElementById('cancel-logout').addEventListener('click', () => {
            this.logoutModal.classList.add('hidden');
        });

        document.getElementById('confirm-logout').addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            location.reload(); 
        });
        
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                this.clearErrors();
            });
        });
    }

    toggleForms(showLogin) {
        this.clearErrors(); 
        if (showLogin) {
            this.loginForm.classList.remove('hidden');
            this.registerForm.classList.add('hidden');
            document.getElementById('auth-title').innerText = 'Đăng nhập';
        } else {
            this.loginForm.classList.add('hidden');
            this.registerForm.classList.remove('hidden');
            document.getElementById('auth-title').innerText = 'Đăng ký';
        }
    }

    showError(inputId, msgId) {
        this.authBox.classList.remove('shake-animation'); 
        void this.authBox.offsetWidth; 
        this.authBox.classList.add('shake-animation');

        const msgEl = document.getElementById(msgId);
        if(msgEl) msgEl.classList.remove('hidden');

        const inputEl = document.getElementById(inputId);
        if(inputEl) inputEl.classList.add('input-error');
    }

    clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('input').forEach(el => el.classList.remove('input-error'));
    }

    handleRegister() {
        const username = document.getElementById('reg-username').value.trim();
        const pass = document.getElementById('reg-password').value;
        const confirmPass = document.getElementById('reg-confirm-password').value;
        if (!username || !pass) return; 

        if (pass !== confirmPass) {
            this.showError('reg-confirm-password', 'reg-pass-error');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];

        if (users.some(u => u.username === username)) {
            this.showError('reg-username', 'reg-user-error');
            return;
        }

        users.push({ username, password: pass });
        localStorage.setItem('users', JSON.stringify(users));

        this.successModal.classList.remove('hidden');
        
        setTimeout(() => {
            this.successModal.classList.add('hidden');
            this.toggleForms(true); 
            this.registerForm.reset();
            
            document.getElementById('login-username').value = username;
            document.getElementById('login-password').focus();
        }, 2000);
    }

    handleLogin() {
        const username = document.getElementById('login-username').value.trim();
        const pass = document.getElementById('login-password').value;
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.username === username && u.password === pass);

        if (user) {
            localStorage.setItem('currentUser', username);
            this.showApp(username);
        } else {
            this.showError('login-password', 'login-error-msg');
            document.getElementById('login-password').value = '';
        }
    }

    showApp(username) {
        this.overlay.style.opacity = '0';
        setTimeout(() => {
            this.overlay.classList.add('hidden');
            this.mainApp.classList.remove('hidden');
        }, 500);

        if(this.displayName) {
            this.displayName.innerText = username;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AuthSystem();
});