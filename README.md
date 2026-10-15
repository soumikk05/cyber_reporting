# 🛡️ Crime Reporting System

A full-stack web application for reporting and managing crime complaints. Built with Python Flask (backend) and vanilla HTML/CSS/JavaScript (frontend).

## 📋 Features

### For Citizens
- User registration and login
- Submit crime reports online with details
- Upload images as evidence
- Track status of submitted complaints
- Receive email confirmation at the official email ID used during registration
- Receive admin status updates only at that registered official email ID
- View personal complaint history

### For Admin/Police
- View all crime reports in one dashboard
- Update complaint status (Pending → Under Investigation → Closed)
- View statistics (total reports, pending, investigating, closed)
- Access reporter information

## 🏗️ Project Structure

```
crime-reporting-system/
├── backend/
│   ├── app.py                 # Flask application (API server)
│   ├── requirements.txt       # Python dependencies
│   └── uploads/               # Image uploads folder (auto-created)
├── frontend/
│   ├── css/
│   │   └── style.css         # Main stylesheet
│   ├── js/
│   │   ├── config.js         # API configuration & utilities
│   │   ├── auth.js           # Login/Register logic
│   │   ├── report.js         # Crime reporting logic
│   │   ├── user-dashboard.js # User dashboard logic
│   │   └── admin-dashboard.js # Admin dashboard logic
│   ├── login.html            # Login page
│   ├── register.html         # Registration page
│   ├── report-crime.html     # Crime report form
│   ├── user-dashboard.html   # User's reports view
│   └── admin-dashboard.html  # Admin panel
└── database/
    └── schema.sql            # Database schema & sample data
```

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8 or higher
- MySQL 5.7 or higher
- Web browser (Chrome, Firefox, Safari, Edge)

### Step 1: Database Setup

1. Install MySQL if not already installed
2. Open MySQL command line or MySQL Workbench
3. Run the database schema:

```bash
mysql -u root -p < database/schema.sql
```

Or manually:
- Open `database/schema.sql`
- Copy and execute all SQL commands in MySQL

This will:
- Create `crime_reporting_db` database
- Create `users` and `crime_reports` tables
- Insert sample admin and user accounts

If your database already exists from an older version, add the email column before registering new users:

```sql
ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE;
UPDATE users SET email = CONCAT(username, '@example.com') WHERE email IS NULL;
ALTER TABLE users MODIFY email VARCHAR(255) NOT NULL;
```

### Step 2: Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Configure database connection (if needed):
   - Open `app.py`
   - Modify the `DB_CONFIG` dictionary with your MySQL credentials:
   ```python
   DB_CONFIG = {
       'host': 'localhost',
       'user': 'root',          # Your MySQL username
       'password': '',          # Your MySQL password
       'database': 'crime_reporting_db'
   }
   ```

4. Configure email notifications by setting SMTP environment variables before starting the backend.

PowerShell example:
```powershell
$env:SMTP_HOST="smtp.gmail.com"
$env:SMTP_PORT="587"
$env:SMTP_USERNAME="your-email@gmail.com"
$env:SMTP_PASSWORD="your-app-password"
$env:SMTP_FROM_EMAIL="your-email@gmail.com"
$env:SMTP_USE_TLS="true"
```

Use an app password for Gmail or the SMTP password from your email provider. If these variables are not set, the report/status updates will still save, but email sending will be skipped and logged in the backend terminal.

5. Start the Flask server:
```bash
python app.py
```

The backend will start on `http://localhost:5000`

### Step 3: Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Open `login.html` in your web browser

**OR** use a simple HTTP server:

Using Python:
```bash
python -m http.server 8000
```

Then visit: `http://localhost:8000/login.html`

Using Node.js (if installed):
```bash
npx http-server -p 8000
```

## 🔑 Test Credentials

### Regular User
- **Username:** john
- **Password:** user123

### Admin
- **Username:** admin
- **Password:** admin123

## 📡 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login

### Crime Reports
- `POST /api/reports` - Create new crime report
- `GET /api/reports/user/:userId` - Get reports by user
- `GET /api/reports` - Get all reports (admin)
- `PUT /api/reports/:reportId/status` - Update report status (admin)
- `DELETE /api/reports/:reportId` - Delete report

### Utility
- `GET /api/health` - Health check

## 🎨 User Interface

### Login Page
- Clean, modern design
- Username and password fields
- Link to registration page
- Test credentials displayed

### Registration Page
- Full name, username, official email ID, password fields
- Password confirmation
- Validation for matching passwords
- Auto-redirect to login after success

### Report Crime Page
- Form fields:
  - Name
  - Contact number
  - Crime type (dropdown)
  - Description (textarea)
  - Location
  - Date & time
  - Image upload (optional)
- Real-time validation
- Success/error messages

### User Dashboard
- List of all submitted reports
- Status tracking with color-coded badges:
  - 🟡 Pending (Yellow)
  - 🔵 Under Investigation (Blue)
  - 🟢 Closed (Green)
- Quick access to report new crime
- Expandable report details

### Admin Dashboard
- Statistics cards showing:
  - Total reports
  - Pending count
  - Under investigation count
  - Closed count
- Table of all reports with:
  - Report details
  - Reporter information
  - Current status
  - Update status button
- Modal for status updates

## 🔧 Configuration

### Backend Configuration
File: `backend/app.py`

```python
# Database settings
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'crime_reporting_db'
}

# File upload settings
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Email settings are read from environment variables:
# SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD,
# SMTP_FROM_EMAIL, SMTP_USE_TLS
```

### Frontend Configuration
File: `frontend/js/config.js`

```javascript
// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';
```

## 🛠️ Troubleshooting

### Backend won't start
- Check if MySQL is running
- Verify database credentials in `app.py`
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Check if port 5000 is available

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check browser console for errors
- Ensure CORS is enabled (already configured in Flask)
- Try accessing `http://localhost:5000/api/health` directly

### Database errors
- Verify MySQL is running
- Check if database exists: `SHOW DATABASES;`
- Verify tables exist: `USE crime_reporting_db; SHOW TABLES;`
- Check database credentials

### File upload not working
- Ensure `uploads` folder exists (auto-created by backend)
- Check file size (should be reasonable, no hard limit set)
- Verify file extension is allowed (png, jpg, jpeg, gif)

## 📝 Database Schema

### Users Table
```sql
- id (INT, Primary Key, Auto Increment)
- name (VARCHAR)
- email (VARCHAR, Unique official email ID)
- username (VARCHAR, Unique)
- password (VARCHAR)
- role (ENUM: 'user', 'admin')
- created_at (TIMESTAMP)
```

### Crime Reports Table
```sql
- id (INT, Primary Key, Auto Increment)
- user_id (INT, Foreign Key → users.id)
- crime_type (VARCHAR)
- description (TEXT)
- location (VARCHAR)
- datetime (DATETIME)
- image_path (VARCHAR)
- status (ENUM: 'Pending', 'Under Investigation', 'Closed')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🚧 Future Enhancements

- Password hashing (bcrypt)
- JWT authentication tokens
- Real-time updates (WebSocket)
- Advanced search and filtering
- Report analytics and charts
- Mobile app version
- Multi-language support
- Export reports to PDF
- Geolocation integration

## 📚 Technologies Used

### Backend
- **Flask** - Python web framework
- **Flask-CORS** - Cross-origin resource sharing
- **MySQL Connector** - Database driver
- **Werkzeug** - File upload handling

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling (custom design)
- **JavaScript (ES6)** - Interactivity
- **Fetch API** - HTTP requests
- **LocalStorage** - Session management

### Database
- **MySQL** - Relational database

## 📄 License

This project is created for academic purposes and is free to use for educational projects.

## 👨‍💻 Developer Notes

### Code Quality
- Modular and readable code
- Comprehensive comments
- Error handling implemented
- RESTful API design
- Responsive design

### Security Notes
**⚠️ For Production Use:**
- Implement password hashing (bcrypt/argon2)
- Add JWT authentication
- Implement rate limiting
- Add CSRF protection
- Validate and sanitize all inputs
- Use HTTPS
- Add SQL injection prevention (parameterized queries already used)
- Implement file upload security checks

### Testing
Test all features:
1. User registration and login
2. Admin login
3. Submit crime report (with and without image)
4. View user dashboard
5. Admin dashboard statistics
6. Update report status
7. Logout functionality

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Verify all setup steps are completed
3. Check browser console for errors
4. Check backend terminal for errors

## 📸 Screenshots

Access the application to see:
- Modern, clean UI design
- Color-coded status badges
- Responsive layout
- Professional dashboard
- Easy-to-use forms

---

**Built with ❤️ for educational purposes**
