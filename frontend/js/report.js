// Check authentication
const user = checkAuth();
if (user) {
    displayUserInfo();

    // Redirect admin to admin dashboard
    if (user.role === 'admin') {
        window.location.href = 'admin-dashboard.html';
    }
}

// Report Form Handler
const reportForm = document.getElementById('reportForm');
if (reportForm) {
    reportForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('user_id',     user.id);
        formData.append('crime_type',  document.getElementById('crimeType').value);
        formData.append('description', document.getElementById('description').value);
        formData.append('location',    document.getElementById('location').value);
        formData.append('datetime',    document.getElementById('datetime').value);

        const imageFile = document.getElementById('image').files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }

        const submitBtn = reportForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            const response = await fetch(`${API_BASE_URL}/reports`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                // Send confirmation email via EmailJS
                sendReportSubmittedEmail(
                    data.reporter_name,
                    data.reporter_email,
                    data.report_id,
                    formData.get('crime_type'),
                    formData.get('location'),
                    formData.get('datetime')
                );

                showAlert('Crime report submitted successfully! A confirmation email will be sent to your registered email address.', 'success');
                reportForm.reset();

                setTimeout(() => {
                    window.location.href = 'user-dashboard.html';
                }, 3000);
            } else {
                showAlert(data.error || 'Failed to submit report', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        } catch (error) {
            console.error('Report submission error:', error);
            showAlert('Unable to connect to server. Please check if the backend is running.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}
