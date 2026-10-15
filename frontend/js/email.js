// EmailJS helper — sends emails from the browser using EmailJS
// Requires: config.js loaded before this file (defines EMAILJS_SERVICE_ID etc.)
// Requires: EmailJS SDK loaded before this file

(function initEmailJS() {
    if (typeof emailjs === 'undefined') return;
    if (!EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY.startsWith('YOUR_')) return;
    emailjs.init(EMAILJS_PUBLIC_KEY);
})();

/**
 * Send a "report submitted" confirmation email to the reporter.
 * Called from report.js after a successful report submission.
 */
function sendReportSubmittedEmail(toName, toEmail, reportId, crimeType, location, datetime) {
    if (typeof emailjs === 'undefined') return;
    if (!EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY.startsWith('YOUR_')) {
        console.warn('EmailJS not configured — skipping email.');
        return;
    }

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_REPORT_SUBMITTED, {
        to_name:    toName,
        to_email:   toEmail,
        report_id:  reportId,
        crime_type: crimeType,
        location:   location,
        datetime:   datetime,
        status:     'Pending'
    }).then(
        () => console.log('Report submitted email sent to', toEmail),
        (err) => console.warn('EmailJS error (report submitted):', err)
    );
}

/**
 * Send a "status updated" notification email to the reporter.
 * Called from admin-dashboard.js after a successful status update.
 */
function sendStatusUpdatedEmail(toName, toEmail, reportId, crimeType, location, oldStatus, newStatus) {
    if (typeof emailjs === 'undefined') return;
    if (!EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY.startsWith('YOUR_')) {
        console.warn('EmailJS not configured — skipping email.');
        return;
    }

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_STATUS_UPDATED, {
        to_name:    toName,
        to_email:   toEmail,
        report_id:  reportId,
        crime_type: crimeType,
        location:   location,
        old_status: oldStatus,
        new_status: newStatus
    }).then(
        () => console.log('Status update email sent to', toEmail),
        (err) => console.warn('EmailJS error (status updated):', err)
    );
}
