from flask import Blueprint, request, jsonify
import sqlite3

feedback_routes = Blueprint('feedback_routes', __name__)

# Helper function to get database connection
def get_db_connection():
    conn = sqlite3.connect('users.db')
    conn.row_factory = sqlite3.Row
    return conn

@feedback_routes.route('/feedback', methods=['POST'])
def submit_feedback():
    data = request.json
    feedback_type = data.get('type')
    feedback_text = data.get('text')
    is_anonymous = data.get('anonymous', False)
    user_id = data.get('userId')

    # If anonymous, set user_id to NULL
    if is_anonymous:
        user_id = None

    if not feedback_type or not feedback_text:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO feedback (user_id, feedback_type, feedback_text, is_anonymous) VALUES (?, ?, ?, ?)",
            (user_id, feedback_type, feedback_text, is_anonymous)
        )
        conn.commit()
        return jsonify({"message": "Feedback submitted successfully!"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@feedback_routes.route('/feedback', methods=['GET'])
def get_feedback():
    # This endpoint should be restricted to admins in a real application
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT f.id, f.feedback_type, f.feedback_text, f.is_anonymous,
                   f.timestamp, u.email as user_email, f.user_id
            FROM feedback f
            LEFT JOIN users u ON f.user_id = u.id
            ORDER BY f.timestamp DESC
        """)

        feedback_items = []
        for row in cursor.fetchall():
            item = dict(row)
            # If feedback is anonymous, remove user email
            if item['is_anonymous']:
                item['user_email'] = 'Anonymous'
            feedback_items.append(item)

        return jsonify(feedback_items), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@feedback_routes.route('/feedback/categorized', methods=['GET'])
def get_categorized_feedback():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT f.id, f.feedback_type, f.feedback_text, f.is_anonymous, 
                   f.timestamp, u.email as user_email, f.user_id
            FROM feedback f 
            LEFT JOIN users u ON f.user_id = u.id
            ORDER BY f.timestamp DESC
        """)
        
        # Initialize feedback categories
        categorized_feedback = {
            'identifiedVoice': [],
            'anonymousVoice': [],
            'identifiedReport': [],
            'anonymousReport': []
        }
        
        for row in cursor.fetchall():
            item = dict(row)
            
            # Convert SQLite boolean to Python boolean
            is_anonymous = bool(item['is_anonymous'])
            feedback_type = item['feedback_type']
            
            # Categorize based on type and anonymity
            if feedback_type == 'voice':
                if is_anonymous:
                    categorized_feedback['anonymousVoice'].append(item)
                else:
                    categorized_feedback['identifiedVoice'].append(item)
            elif feedback_type == 'report':
                if is_anonymous:
                    categorized_feedback['anonymousReport'].append(item)
                else:
                    categorized_feedback['identifiedReport'].append(item)
        
        return jsonify(categorized_feedback), 200
    except Exception as e:
        print(f"Error in get_categorized_feedback: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
