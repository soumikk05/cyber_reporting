// Authentication Logic - Backend Version

// Check if already logged in
if (getCurrentUser()) {
    const user = getCurrentUser();
    if (user.role === 'admin') {
        window.location.href = 'admin-dashboard.html';
    } else {
        window.location.href = 'user-dashboard.html';
    }
}

// Login Form Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                if (data.user.role === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = 'user-dashboard.html';
                }
            } else {
                showAlert(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showAlert('Unable to connect to server. Please check if the backend is running.', 'error');
        }
    });
}

// Register Form Handler
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Use FormData to read values — it captures browser-autofilled values
        // reliably (unlike direct .value which can miss autofill).
        // Fall back to direct .value as a secondary option.
        const fd = new FormData(registerForm);
        const readField = (idAttr, nameAttr) => {
            const fromFD = (fd.get(nameAttr) || '').toString().trim();
            const el = document.getElementById(idAttr);
            const fromEl = el ? (el.value || '').trim() : '';
            return fromFD || fromEl;
        };

        const name            = readField('name',            'name');
        const username        = readField('username',        'username');
        const email           = readField('email',           'email').toLowerCase();
        const password        = readField('password',        'password');
        const confirmPassword = readField('confirmPassword', 'confirmPassword');

        // Validation

        if (!name || !username || !email || !password) {
            showAlert('Please fill in all fields.', 'error');
            return;
        }

        // Username: only letters and numbers, no special characters
        const usernameRegex = /^[a-zA-Z0-9]+$/;
        if (!usernameRegex.test(username)) {
            showAlert('Username can only contain letters and numbers — no spaces or special characters.', 'error');
            return;
        }

        // Username minimum length
        if (username.length < 3) {
            showAlert('Username must be at least 3 characters long.', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showAlert('Please enter a valid official email ID.', 'error');
            return;
        }

        // Passwords match
        if (password !== confirmPassword) {
            showAlert('Passwords do not match.', 'error');
            return;
        }

        // Password minimum length
        if (password.length < 6) {
            showAlert('Password must be at least 6 characters long.', 'error');
            return;
        }

        // ── Submit ───────────────────────────────────────────────
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, username, password })
            });

            const data = await response.json();

            if (response.ok) {
                showAlert('Registration successful! Redirecting to login...', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showAlert(data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showAlert('Unable to connect to server. Please check if the backend is running.', 'error');
        }
    });

    // ── Live feedback while typing username ────────────────────
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.addEventListener('input', () => {
            const val = usernameInput.value;
            const valid = /^[a-zA-Z0-9]*$/.test(val);
            usernameInput.style.borderColor = val.length === 0
                ? ''
                : valid ? 'var(--success)' : 'var(--danger)';
        });
    }
}
