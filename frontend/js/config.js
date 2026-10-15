// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// EmailJS Configuration
// Fill these in from your EmailJS dashboard (https://www.emailjs.com)
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';       // e.g. service_abc123
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';        // e.g. abc123XYZ

// Template IDs (create both templates in your EmailJS dashboard)
const EMAILJS_TEMPLATE_REPORT_SUBMITTED = 'YOUR_TEMPLATE_REPORT_SUBMITTED'; // e.g. template_abc
const EMAILJS_TEMPLATE_STATUS_UPDATED   = 'YOUR_TEMPLATE_STATUS_UPDATED';   // e.g. template_xyz


// Helper function to get current user from localStorage
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Helper function to check if user is logged in
function checkAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

// Helper function to display user info in navbar
function displayUserInfo() {
    const user = getCurrentUser();
    if (user) {
        const userNameEl = document.getElementById('userName');
        const userRoleEl = document.getElementById('userRole');
        if (userNameEl) userNameEl.textContent = user.name;
        if (userRoleEl) userRoleEl.textContent = user.role;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Show alert message
function showAlert(message, type = 'success') {
    const container = document.getElementById('alertContainer');
    if (!container) return;

    const alertClass = type === 'error' ? 'alert-error' : 'alert-success';
    const prefix = type === 'error' ? 'Error: ' : '';

    container.innerHTML = `
        <div class="alert ${alertClass}">
            <span>${prefix}${message}</span>
        </div>
    `;

    // Auto-hide after 5 seconds
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get status badge HTML
function getStatusBadge(status) {
    let className = 'status-pending';
    if (status === 'Under Investigation') {
        className = 'status-investigation';
    } else if (status === 'Closed') {
        className = 'status-closed';
    }
    return `<span class="status-badge ${className}">${status}</span>`;
}