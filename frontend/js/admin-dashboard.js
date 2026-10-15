// Check authentication
const user = checkAuth();
if (user) {
    displayUserInfo();

    // Redirect non-admin users
    if (user.role !== 'admin') {
        window.location.href = 'user-dashboard.html';
    }

    // Load all reports
    loadAllReports();
}

let currentReportId = null;

async function loadAllReports() {
    const loadingContainer = document.getElementById('loadingContainer');
    const reportsContainer = document.getElementById('reportsContainer');

    try {
        const response = await fetch(`${API_BASE_URL}/reports`);
        const data = await response.json();

        loadingContainer.style.display = 'none';

        if (response.ok) {
            updateStatistics(data.reports);
            displayReports(data.reports);
        } else {
            reportsContainer.innerHTML = `
                <div class="alert alert-error">
                    <span>❌</span>
                    <span>Failed to load reports: ${data.error}</span>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading reports:', error);
        loadingContainer.style.display = 'none';
        reportsContainer.innerHTML = `
            <div class="alert alert-error">
                <span>Unable to connect to server. Please check if the backend is running.</span>
            </div>
        `;
    }
}

function updateStatistics(reports) {
    const total = reports.length;
    const pending = reports.filter(r => r.status === 'Pending').length;
    const investigating = reports.filter(r => r.status === 'Under Investigation').length;
    const closed = reports.filter(r => r.status === 'Closed').length;

    document.getElementById('totalReports').textContent = total;
    document.getElementById('pendingReports').textContent = pending;
    document.getElementById('investigatingReports').textContent = investigating;
    document.getElementById('closedReports').textContent = closed;
}

function displayReports(reports) {
    const reportsContainer = document.getElementById('reportsContainer');

    if (reports.length === 0) {
        reportsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">--</div>
                <h3>No Reports Yet</h3>
                <p>No crime reports have been submitted.</p>
            </div>
        `;
        return;
    }

    let tableHTML = `
        <table class="reports-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Reporter</th>
                    <th>Crime Type</th>
                    <th>Location</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    reports.forEach(report => {
        // Build image HTML if image exists
        const imageHTML = report.image_path
            ? `<br><img src="http://localhost:5000/${report.image_path}" 
                alt="Evidence" 
                style="max-width:200px; max-height:150px; margin-top:0.5rem; border-radius:8px; border:1px solid var(--border);"
                onerror="this.style.display='none'">`
            : '<span style="color:var(--text-light); font-size:0.85rem;">No image uploaded</span>';

        tableHTML += `
            <tr>
                <td><strong>#${report.id}</strong></td>
                <td>${report.reporter_name}<br><small style="color: var(--text-light);">@${report.username}</small></td>
                <td>${report.crime_type}</td>
                <td>${report.location}</td>
                <td>${formatDate(report.datetime)}</td>
                <td>${getStatusBadge(report.status)}</td>
                <td>
                    <div class="actions">
                        <button onclick="openStatusModal(${report.id}, '${report.status}')" class="btn btn-primary btn-sm">
                            Update Status
                        </button>
                    </div>
                </td>
            </tr>
            <tr>
                <td colspan="7" style="background: var(--bg); padding: 1rem;">
                    <strong>Description:</strong> ${report.description}<br>
                    <strong>Evidence Image:</strong> ${imageHTML}
                </td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    reportsContainer.innerHTML = tableHTML;
}

function openStatusModal(reportId, currentStatus) {
    currentReportId = reportId;
    const modal = document.getElementById('statusModal');
    const statusSelect = document.getElementById('newStatus');

    statusSelect.value = currentStatus;
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('statusModal');
    modal.style.display = 'none';
    currentReportId = null;
}

// Status Form Handler
const statusForm = document.getElementById('statusForm');
if (statusForm) {
    statusForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newStatus = document.getElementById('newStatus').value;

        try {
            const response = await fetch(`${API_BASE_URL}/reports/${currentReportId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (response.ok) {
                closeModal();

                // Send status update email via EmailJS
                sendStatusUpdatedEmail(
                    data.reporter_name,
                    data.reporter_email,
                    data.report_id,
                    data.crime_type,
                    data.location,
                    data.old_status,
                    data.new_status
                );

                loadAllReports();

                const container = document.getElementById('reportsContainer');
                const alertDiv = document.createElement('div');
                alertDiv.className = 'alert alert-success';
                alertDiv.innerHTML = '<span>Status updated successfully!</span>';
                container.insertBefore(alertDiv, container.firstChild);

                setTimeout(() => {
                    alertDiv.remove();
                }, 3000);
            } else {
                alert('Failed to update status: ' + data.error);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Unable to connect to server. Please check if the backend is running.');
        }
    });
}

// Close modal when clicking outside
document.getElementById('statusModal').addEventListener('click', (e) => {
    if (e.target.id === 'statusModal') {
        closeModal();
    }
});