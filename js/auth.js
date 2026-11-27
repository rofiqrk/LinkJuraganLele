const VALID_USER = 'juraganlele';
const VALID_PASS = 'kumislele';
const SESSION_KEY = 'juraganlele_auth_session';

document.addEventListener('DOMContentLoaded', () => {
    const isLoginPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
    const isAuthenticated = sessionStorage.getItem(SESSION_KEY) === 'true';

    if (!isLoginPage && !isAuthenticated) {
        window.location.href = 'index.html';
        return;
    }

    if (isLoginPage && isAuthenticated) {
        window.location.href = 'dashboard.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const u = document.getElementById('username').value.trim();
            const p = document.getElementById('password').value;
            if (u === VALID_USER && p === VALID_PASS) {
                sessionStorage.setItem(SESSION_KEY, 'true');
                window.location.href = 'dashboard.html';
            } else {
                document.getElementById('loginError').classList.remove('hidden');
            }
        });

        const toggleBtn = document.getElementById('togglePassword');
        const passField = document.getElementById('password');
        if (toggleBtn && passField) {
            toggleBtn.addEventListener('click', () => {
                passField.type = passField.type === 'password' ? 'text' : 'password';
            });
        }
    }
});

function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
}
