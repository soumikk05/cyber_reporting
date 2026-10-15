// Check authentication
const user = checkAuth();
if (user) {
    displayUserInfo();

    // Redirect admin to admin dashboard
    if (user.role === 'admin') {
        window.location.href = 'admin-dashboard.html';
    }

    // Load user reports
    loadUserReports();
}

async function loadUserReports() {
    const loadingContainer = document.getElementById('loadingContainer');
    const reportsContainer = document.getElementById('reportsContainer');

    try {
        const response = await fetch(`${API_BASE_URL}/reports/user/${user.id}`);
        const data = await response.json();

        loadingContainer.style.display = 'none';

        if (response.ok) {
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
                <span>❌</span>
                <span>Unable to connect to server. Please check if the backend is running.</span>
            </div>
        `;
    }
}

function displayReports(reports) {
    const reportsContainer = document.getElementById('reportsContainer');

    if (reports.length === 0) {
        reportsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <h3>No Reports Yet</h3>
                <p>You haven't submitted any crime reports.</p>
                <a href="report-crime.html" class="btn btn-primary mt-2">Report a Crime</a>
            </div>
        `;
        return;
    }

    let tableHTML = `
        <table class="reports-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Crime Type</th>
                    <th>Location</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Download</th>
                </tr>
            </thead>
            <tbody>
    `;

    reports.forEach(report => {
        tableHTML += `
            <tr>
                <td class="report-id">#${report.id}</td>
                <td>${report.crime_type}</td>
                <td>${report.location}</td>
                <td>${formatDate(report.datetime)}</td>
                <td>${getStatusBadge(report.status)}</td>
                <td>${formatDate(report.created_at)}</td>
                <td>
                    <button onclick='downloadReport(${JSON.stringify(report)})' class="btn btn-secondary btn-sm">
                        ⬇ Download
                    </button>
                </td>
            </tr>
            <tr class="description-row">
                <td colspan="7">
                    <strong>Description:</strong> ${report.description}
                </td>
            </tr>
        `;
    });

    tableHTML += `</tbody></table>`;
    reportsContainer.innerHTML = tableHTML;
}

// ── Download Report as HTML file ────────────────────────────────
function downloadReport(report) {
    const printDate = new Date().toLocaleString('en-IN');
    const incidentDate = formatDate(report.datetime);
    const submittedDate = formatDate(report.created_at);

    const statusColors = {
        'Pending': '#f4a261',
        'Under Investigation': '#2ec4b6',
        'Closed': '#7c8db5'
    };
    const statusColor = statusColors[report.status] || '#7c8db5';

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Crime Report #${report.id}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: #f8fafc;
            color: #1e293b;
            padding: 40px;
        }
        .page {
            max-width: 720px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(0,0,0,0.1);
        }
        .header {
            background: #0a0e1a;
            color: white;
            padding: 2rem 2.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .header h1 {
            font-size: 1.4rem;
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }
        .header .logo { font-size: 2rem; }
        .report-id {
            background: #e63946;
            color: white;
            padding: 0.4rem 1rem;
            border-radius: 6px;
            font-size: 1rem;
            font-weight: 700;
            font-family: monospace;
        }
        .body { padding: 2rem 2.5rem; }
        .status-badge {
            display: inline-block;
            padding: 0.35rem 1rem;
            border-radius: 4px;
            font-weight: 700;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            background: ${statusColor}22;
            color: ${statusColor};
            border: 1px solid ${statusColor}55;
        }
        .section-title {
            font-size: 0.72rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #94a3b8;
            font-weight: 600;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #e2e8f0;
        }
        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.25rem;
            margin-bottom: 1.5rem;
        }
        .field label {
            font-size: 0.72rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #94a3b8;
            display: block;
            margin-bottom: 0.25rem;
        }
        .field p {
            font-size: 0.95rem;
            color: #1e293b;
            font-weight: 500;
        }
        .description-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1.5rem;
            font-size: 0.95rem;
            line-height: 1.7;
            color: #334155;
        }
        .footer {
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            padding: 1rem 2.5rem;
            font-size: 0.78rem;
            color: #94a3b8;
            display: flex;
            justify-content: space-between;
        }
        @media print {
            body { padding: 0; background: white; }
            .page { box-shadow: none; border-radius: 0; }
        }
    </style>
</head>
<body>
<div class="page">
    <div class="header">
        <div>
            <div style="font-size:0.75rem; color:#7c8db5; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:0.4rem;">Official Document</div>
            <h1>🛡️ Crime Reporting System</h1>
        </div>
        <div class="report-id">REPORT #${report.id}</div>
    </div>

    <div class="body">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.75rem;">
            <div>
                <div style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:0.3rem;">Current Status</div>
                <span class="status-badge">${report.status}</span>
            </div>
            <div style="text-align:right;">
                <div style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:0.3rem;">Downloaded On</div>
                <div style="font-size:0.85rem; font-weight:500;">${printDate}</div>
            </div>
        </div>

        <div class="section-title">Incident Details</div>
        <div class="grid">
            <div class="field">
                <label>Crime Type</label>
                <p>${report.crime_type}</p>
            </div>
            <div class="field">
                <label>Date & Time of Incident</label>
                <p>${incidentDate}</p>
            </div>
            <div class="field" style="grid-column: 1 / -1;">
                <label>Location</label>
                <p>${report.location}</p>
            </div>
        </div>

        <div class="section-title">Description</div>
        <div class="description-box">${report.description}</div>

        <div class="section-title">Submission Info</div>
        <div class="grid">
            <div class="field">
                <label>Submitted By</label>
                <p>${user.name}</p>
            </div>
            <div class="field">
                <label>Submitted On</label>
                <p>${submittedDate}</p>
            </div>
        </div>
    </div>

    <div class="footer">
        <span>Crime Reporting System — Official Report</span>
        <span>Report ID: #${report.id} | Generated: ${printDate}</span>
    </div>
</div>
</body>
</html>`;

    // Trigger download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Crime_Report_${report.id}_${report.crime_type.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}