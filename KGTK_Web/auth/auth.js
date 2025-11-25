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
        
        this.isProcessing = false;
        this.justLoggedIn = false;
        
        this.init();
    }

    async init() {
        await this.loadUsersData();
        
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            this.showApp(currentUser);
        }

        this.bindEvents();
    }

    async loadUsersData() {
        try {
            const response = await fetch('../auth/users.json');
            if (response.ok) {
                const jsonUsers = await response.json();
                const storedUsers = localStorage.getItem('users');
                
                if (!storedUsers) {
                    // Nếu chưa có trong localStorage, dùng từ json
                    localStorage.setItem('users', JSON.stringify(jsonUsers));
                    console.log('Đã tải users từ file JSON');
                } else {
                    // Nếu đã có, kết hợp cả hai (tránh trùng lặp)
                    const localUsers = JSON.parse(storedUsers);
                    const combinedUsers = this.mergeUsers(localUsers, jsonUsers);
                    localStorage.setItem('users', JSON.stringify(combinedUsers));
                    console.log('Đã kết hợp users từ JSON và localStorage');
                }
            } else {
                throw new Error('Không thể tải file users.json');
            }
        } catch (error) {
            console.warn('Không thể tải users.json, sử dụng dữ liệu mặc định:', error);
            
            //fallback
            const storedUsers = localStorage.getItem('users');
            if (!storedUsers) {
                const defaultUsers = [
                    { username: 'admin', password: '123' },
                    { username: 'giaovien', password: '456' },
                    { username: 'hocsinh', password: '789' }
                ];
                localStorage.setItem('users', JSON.stringify(defaultUsers));
            }
        }
    }

    mergeUsers(localUsers, jsonUsers) {
        const merged = [...localUsers];
        const existingUsernames = new Set(localUsers.map(user => user.username));
        
        jsonUsers.forEach(jsonUser => {
            if (!existingUsernames.has(jsonUser.username)) {
                merged.push(jsonUser);
            }
        });
        
        return merged;
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
            if (!this.isProcessing) {
                this.handleRegister();
            }
        });

        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!this.isProcessing) {
                this.handleLogin();
            }
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
            this.redirectToHomepage();
        });
        
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                this.clearErrors();
            });
        });
    }

    redirectToHomepage() {
        const currentPath = window.location.pathname;
        let homePath = 'index.html';

        if (!currentPath.includes('index.html')) {
            homePath = '../index.html';
        }
        
        window.location.href = homePath;
    }

    toggleForms(showLogin) {
        this.clearErrors(); 
        if (showLogin) {
            this.loginForm.classList.remove('hidden');
            this.registerForm.classList.add('hidden');
            document.getElementById('auth-title').innerText = 'Đăng nhập';
            document.getElementById('auth-subtitle').innerText = 'Chào mừng bạn quay trở lại!';
        } else {
            this.loginForm.classList.add('hidden');
            this.registerForm.classList.remove('hidden');
            document.getElementById('auth-title').innerText = 'Đăng ký';
            document.getElementById('auth-subtitle').innerText = 'Tạo tài khoản mới để bắt đầu';
        }
    }

    showError(inputId, msgId) {
        this.authBox.classList.remove('shake-animation'); 
        void this.authBox.offsetWidth; 
        this.authBox.classList.add('shake-animation');

        const msgEl = document.getElementById(msgId);
        if(msgEl) {
            msgEl.classList.remove('hidden');
            setTimeout(() => {
                msgEl.classList.add('hidden');
            }, 3000);
        }

        const inputEl = document.getElementById(inputId);
        if(inputEl) {
            inputEl.classList.add('input-error');
            inputEl.focus();
        }
    }

    clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('input').forEach(el => el.classList.remove('input-error'));
    }

    handleRegister() {
        this.isProcessing = true;
        
        const username = document.getElementById('reg-username').value.trim();
        const pass = document.getElementById('reg-password').value;
        const confirmPass = document.getElementById('reg-confirm-password').value;
        
        this.clearErrors();

        if (!username) {
            this.showError('reg-username', 'reg-user-error');
            document.getElementById('reg-user-error').textContent = 'Vui lòng nhập tên đăng nhập';
            this.isProcessing = false;
            return;
        }

        if (!pass) {
            this.showError('reg-password', 'reg-pass-error');
            document.getElementById('reg-pass-error').textContent = 'Vui lòng nhập mật khẩu';
            this.isProcessing = false;
            return;
        }

        if (pass.length < 3) {
            this.showError('reg-password', 'reg-pass-error');
            document.getElementById('reg-pass-error').textContent = 'Mật khẩu phải có ít nhất 3 ký tự';
            this.isProcessing = false;
            return;
        }

        if (pass !== confirmPass) {
            this.showError('reg-confirm-password', 'reg-pass-error');
            document.getElementById('reg-pass-error').textContent = 'Mật khẩu nhập lại không khớp';
            this.isProcessing = false;
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];

        if (users.some(u => u.username === username)) {
            this.showError('reg-username', 'reg-user-error');
            document.getElementById('reg-user-error').textContent = 'Tên đăng nhập này đã tồn tại';
            this.isProcessing = false;
            return;
        }

        users.push({ username, password: pass });
        localStorage.setItem('users', JSON.stringify(users));

        console.log('Đăng ký thành công:', username);
        
        if (this.successModal) {
            this.successModal.classList.remove('hidden');
        }
        
        setTimeout(() => {
            if (this.successModal) {
                this.successModal.classList.add('hidden');
            }
            this.toggleForms(true); 
            this.registerForm.reset();
            
            document.getElementById('login-username').value = username;
            document.getElementById('login-password').focus();
            
            this.isProcessing = false;
        }, 2000);
    }

    handleLogin() {
        this.isProcessing = true;
        
        const username = document.getElementById('login-username').value.trim();
        const pass = document.getElementById('login-password').value;
        
        this.clearErrors();

        if (!username || !pass) {
            this.showError('login-password', 'login-error-msg');
            document.getElementById('login-error-msg').textContent = 'Vui lòng nhập đầy đủ thông tin';
            this.isProcessing = false;
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.username === username && u.password === pass);

        if (user) {
            localStorage.setItem('currentUser', username);
            this.justLoggedIn = true;
            this.redirectToHomepage();
        } else {
            this.showError('login-password', 'login-error-msg');
            document.getElementById('login-error-msg').textContent = 'Sai tên đăng nhập hoặc mật khẩu';
            document.getElementById('login-password').value = '';
        }
        
        this.isProcessing = false;
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

function checkAuthOnAllPages() {
    const currentUser = localStorage.getItem('currentUser');
    const authOverlay = document.getElementById('auth-overlay');
    const mainApp = document.getElementById('main-app');
    
    if (currentUser && authOverlay && mainApp) {
        authOverlay.classList.add('hidden');
        mainApp.classList.remove('hidden');
        
        const displayName = document.getElementById('user-display-name');
        if (displayName) {
            displayName.innerText = currentUser;
        }
    } else if (!currentUser && authOverlay && mainApp) {
        authOverlay.classList.remove('hidden');
        mainApp.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const authBox = document.getElementById('auth-box');
    if (authBox) {
        new AuthSystem();
    }
    
    checkAuthOnAllPages();
});