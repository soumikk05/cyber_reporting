// Standalone Crime Reporting System - LocalStorage Database
// This version works without a backend server

// Initialize demo data on first load
function initializeDatabase() {
    // Check if database exists
    if (!localStorage.getItem('crime_users')) {
        // Create default users
        const users = [
            {
                id: 1,
                name: 'Admin User',
                username: 'admin',
                password: 'admin123',
                role: 'admin'
            },
            {
                id: 2,
                name: 'John Doe',
                username: 'john',
                password: 'user123',
                role: 'user'
            }
        ];
        localStorage.setItem('crime_users', JSON.stringify(users));
        localStorage.setItem('user_counter', '3');
    }

    if (!localStorage.getItem('crime_reports')) {
        // Create sample reports
        const reports = [
            {
                id: 1,
                user_id: 2,
                reporter_name: 'John Doe',
                username: 'john',
                contact: '1234567890',
                crime_type: 'Theft',
                description: 'My bicycle was stolen from outside the grocery store',
                location: '123 Main Street',
                datetime: '2024-02-10T14:30',
                status: 'Under Investigation',
                created_at: new Date('2024-02-10T15:00:00').toISOString()
            },
            {
                id: 2,
                user_id: 2,
                reporter_name: 'John Doe',
                username: 'john',
                contact: '1234567890',
                crime_type: 'Vandalism',
                description: 'Graffiti on the community center wall',
                location: '456 Oak Avenue',
                datetime: '2024-02-12T09:15',
                status: 'Pending',
                created_at: new Date('2024-02-12T10:00:00').toISOString()
            }
        ];
        localStorage.setItem('crime_reports', JSON.stringify(reports));
        localStorage.setItem('report_counter', '3');
    }
}

// Initialize on page load
initializeDatabase();

// Helper function to get current user from session
function getCurrentUser() {
    const userStr = sessionStorage.getItem('currentUser');
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
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Show alert message
function showAlert(message, type = 'success') {
    const container = document.getElementById('alertContainer');
    if (!container) return;
    
    const alertClass = type === 'error' ? 'alert-error' : 'alert-success';
    const icon = type === 'error' ? '❌' : '✅';
    
    container.innerHTML = `
        <div class="alert ${alertClass}">
            <span>${icon}</span>
            <span>${message}</span>
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

// Database functions
const DB = {
    // Get all users
    getUsers: function() {
        return JSON.parse(localStorage.getItem('crime_users') || '[]');
    },
    
    // Get user by username and password
    getUserByCredentials: function(username, password) {
        const users = this.getUsers();
        return users.find(u => u.username === username && u.password === password);
    },
    
    // Add new user
    addUser: function(user) {
        const users = this.getUsers();
        const counter = parseInt(localStorage.getItem('user_counter') || '1');
        user.id = counter;
        users.push(user);
        localStorage.setItem('crime_users', JSON.stringify(users));
        localStorage.setItem('user_counter', (counter + 1).toString());
        return user;
    },
    
    // Check if username exists
    usernameExists: function(username) {
        const users = this.getUsers();
        return users.some(u => u.username === username);
    },
    
    // Get all reports
    getReports: function() {
        return JSON.parse(localStorage.getItem('crime_reports') || '[]');
    },
    
    // Get reports by user ID
    getReportsByUserId: function(userId) {
        const reports = this.getReports();
        return reports.filter(r => r.user_id === userId);
    },
    
    // Add new report
    addReport: function(report) {
        const reports = this.getReports();
        const counter = parseInt(localStorage.getItem('report_counter') || '1');
        report.id = counter;
        report.created_at = new Date().toISOString();
        report.status = 'Pending';
        reports.push(report);
        localStorage.setItem('crime_reports', JSON.stringify(reports));
        localStorage.setItem('report_counter', (counter + 1).toString());
        return report;
    },
    
    // Update report status
    updateReportStatus: function(reportId, newStatus) {
        const reports = this.getReports();
        const reportIndex = reports.findIndex(r => r.id === reportId);
        if (reportIndex !== -1) {
            reports[reportIndex].status = newStatus;
            localStorage.setItem('crime_reports', JSON.stringify(reports));
            return true;
        }
        return false;
    }
};
