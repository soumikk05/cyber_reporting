from flask import Flask, request, jsonify, send_from_directory
from flask.json.provider import DefaultJSONProvider
from flask_cors import CORS
import mysql.connector
import datetime as dt
import os
import re
import decimal
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

load_dotenv()  # Reads d:\cyber reporting\backend\.env


class MySQLJSONProvider(DefaultJSONProvider):
    """Custom JSON provider to handle MySQL datetime and Decimal types."""
    @staticmethod
    def default(obj):
        if isinstance(obj, (dt.datetime, dt.date)):
            return obj.isoformat()
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        raise TypeError(f'Object of type {type(obj).__name__} is not JSON serializable')


app = Flask(__name__)
app.json_provider_class = MySQLJSONProvider
app.json = MySQLJSONProvider(app)
CORS(app)

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Database configuration — values come from the .env file
DB_CONFIG = {
    'host':     os.environ.get('DB_HOST',     'localhost'),
    'user':     os.environ.get('DB_USER',     'root'),
    'password': os.environ.get('DB_PASSWORD', ''),
    'database': os.environ.get('DB_NAME',     'crime_reporting_db')
}


def get_db_connection():
    """Create and return a database connection"""
    return mysql.connector.connect(**DB_CONFIG)


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# ==================== SERVE UPLOADED IMAGES ====================

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded image files"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


# ==================== AUTHENTICATION ROUTES ====================

@app.route('/api/register', methods=['POST'])
def register():
    """Register a new user"""
    conn = None
    cursor = None
    try:
        import json as _json
        raw_body = request.get_data(as_text=True)
        try:
            data = _json.loads(raw_body) if raw_body.strip() else {}
        except _json.JSONDecodeError:
            data = request.get_json(silent=True, force=True) or {}
        if not isinstance(data, dict):
            data = {}

        name     = (data.get('name') or '').strip()
        email    = (data.get('email') or '').strip().lower()
        username = (data.get('username') or '').strip()
        password = (data.get('password') or '').strip()

        if not all([name, email, username, password]):
            return jsonify({'error': 'All fields are required'}), 400

        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            return jsonify({'error': 'Please enter a valid official email ID'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('SELECT id FROM users WHERE username = %s', (username,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({'error': 'Username already exists'}), 400

        cursor.execute('SELECT id FROM users WHERE email = %s', (email,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({'error': 'Official email ID already registered'}), 400

        cursor.execute(
            'INSERT INTO users (name, email, username, password, role) VALUES (%s, %s, %s, %s, %s)',
            (name, email, username, password, 'user')
        )
        conn.commit()
        user_id = cursor.lastrowid

        cursor.close()
        conn.close()

        return jsonify({
            'message': 'Registration successful',
            'user': {'id': user_id, 'name': name, 'email': email, 'username': username, 'role': 'user'}
        }), 201

    except Exception as e:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if conn:
            try:
                conn.close()
            except Exception:
                pass
        return jsonify({'error': str(e)}), 500


@app.route('/api/login', methods=['POST'])
def login():
    """Login user"""
    conn = None
    cursor = None
    try:
        data = request.get_json(silent=True, force=True) or {}
        username = (data.get('username') or '').strip()
        password = (data.get('password') or '').strip()

        if not all([username, password]):
            return jsonify({'error': 'Username and password are required'}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            'SELECT id, name, email, username, role FROM users WHERE username = %s AND password = %s',
            (username, password)
        )
        user = cursor.fetchone()

        cursor.close()
        conn.close()

        if user:
            return jsonify({'message': 'Login successful', 'user': user}), 200
        else:
            return jsonify({'error': 'Invalid username or password'}), 401

    except Exception as e:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if conn:
            try:
                conn.close()
            except Exception:
                pass
        return jsonify({'error': str(e)}), 500


# ==================== CRIME REPORT ROUTES ====================

@app.route('/api/reports', methods=['POST'])
def create_report():
    """Create a new crime report"""
    conn = None
    cursor = None
    try:
        user_id     = request.form.get('user_id')
        crime_type  = request.form.get('crime_type')
        description = request.form.get('description')
        location    = request.form.get('location')
        datetime_str = request.form.get('datetime')

        if not all([user_id, crime_type, description, location, datetime_str]):
            return jsonify({'error': 'All fields are required'}), 400

        image_path = None
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                timestamp = dt.datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"{timestamp}_{filename}"
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                image_path = f"uploads/{filename}"

        # Normalize datetime-local format → MySQL DATETIME
        normalized_datetime = datetime_str.replace('T', ' ') if datetime_str else datetime_str
        if normalized_datetime and len(normalized_datetime) == 16:
            normalized_datetime += ':00'

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute('SELECT name, email FROM users WHERE id = %s', (user_id,))
        user = cursor.fetchone()
        if not user:
            cursor.close()
            conn.close()
            return jsonify({'error': 'User not found'}), 404

        cursor.execute(
            '''INSERT INTO crime_reports (user_id, crime_type, description, location, datetime, image_path, status)
               VALUES (%s, %s, %s, %s, %s, %s, %s)''',
            (user_id, crime_type, description, location, normalized_datetime, image_path, 'Pending')
        )
        conn.commit()
        report_id = cursor.lastrowid

        cursor.close()
        conn.close()

        return jsonify({
            'message': 'Crime report submitted successfully',
            'report_id': report_id,
            'reporter_name': user['name'],
            'reporter_email': user['email']
        }), 201

    except Exception as e:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if conn:
            try:
                conn.close()
            except Exception:
                pass
        return jsonify({'error': str(e)}), 500


@app.route('/api/reports/user/<int:user_id>', methods=['GET'])
def get_user_reports(user_id):
    """Get all reports by a specific user"""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            '''SELECT id, crime_type, description, location, datetime, status, created_at
               FROM crime_reports WHERE user_id = %s ORDER BY created_at DESC''',
            (user_id,)
        )
        reports = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({'reports': reports}), 200

    except Exception as e:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if conn:
            try:
                conn.close()
            except Exception:
                pass
        return jsonify({'error': str(e)}), 500


@app.route('/api/reports', methods=['GET'])
def get_all_reports():
    """Get all crime reports (for admin)"""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            '''SELECT cr.id, cr.crime_type, cr.description, cr.location, cr.datetime,
                      cr.image_path, cr.status, cr.created_at,
                      u.name AS reporter_name, u.username, u.email AS reporter_email
               FROM crime_reports cr
               JOIN users u ON cr.user_id = u.id
               ORDER BY cr.created_at DESC'''
        )
        reports = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({'reports': reports}), 200

    except Exception as e:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if conn:
            try:
                conn.close()
            except Exception:
                pass
        return jsonify({'error': str(e)}), 500


@app.route('/api/reports/<int:report_id>/status', methods=['PUT'])
def update_report_status(report_id):
    """Update crime report status (admin only)"""
    conn = None
    cursor = None
    try:
        data = request.get_json(silent=True, force=True) or {}
        new_status = data.get('status')

        if new_status not in ['Pending', 'Under Investigation', 'Closed']:
            return jsonify({'error': 'Invalid status'}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            '''SELECT cr.id, cr.crime_type, cr.location, cr.status AS old_status,
                      u.name AS reporter_name, u.email AS reporter_email
               FROM crime_reports cr
               JOIN users u ON cr.user_id = u.id
               WHERE cr.id = %s''',
            (report_id,)
        )
        report = cursor.fetchone()

        if not report:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Report not found'}), 404

        cursor.execute(
            'UPDATE crime_reports SET status = %s WHERE id = %s',
            (new_status, report_id)
        )
        conn.commit()

        cursor.close()
        conn.close()

        # Return reporter info so frontend (EmailJS) can send the email
        return jsonify({
            'message': 'Status updated successfully',
            'report_id': report['id'],
            'crime_type': report['crime_type'],
            'location': report['location'],
            'old_status': report['old_status'],
            'new_status': new_status,
            'reporter_name': report['reporter_name'],
            'reporter_email': report['reporter_email']
        }), 200

    except Exception as e:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if conn:
            try:
                conn.close()
            except Exception:
                pass
        return jsonify({'error': str(e)}), 500


@app.route('/api/reports/<int:report_id>', methods=['DELETE'])
def delete_report(report_id):
    """Delete a crime report"""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('DELETE FROM crime_reports WHERE id = %s', (report_id,))
        conn.commit()

        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Report not found'}), 404

        cursor.close()
        conn.close()

        return jsonify({'message': 'Report deleted successfully'}), 200

    except Exception as e:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if conn:
            try:
                conn.close()
            except Exception:
                pass
        return jsonify({'error': str(e)}), 500


# ==================== UTILITY ROUTES ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Server is running'}), 200


if __name__ == '__main__':
    print('Crime Reporting System Backend Starting...')
    print('Server running on http://localhost:5000')
    app.run(debug=True, port=5000)
