###############################################################################
# Direct Messaging routes module.
# Handles secure direct messaging between users with encryption.
###############################################################################
from flask import Blueprint, request, jsonify
import sqlite3
from cryptography.fernet import Fernet
from generate_key import generate_or_load_key
# Make sure this import works correctly
try:
    from api_routes import require_api_key
except ImportError as e:
    print(f"Error importing auth_helper: {e}")
    # Create a dummy decorator for fallback
    def require_api_key(f):
        return f

dm_routes = Blueprint('dm_routes', __name__)

# Initialize SQLite database connection - but not cursor
conn = sqlite3.connect('users.db', check_same_thread=False)

# Load the encryption key using the generate_key module
key = generate_or_load_key()

# Initialize encryption engine
cipher_suite = Fernet(key)

@dm_routes.route('/users/<int:current_user_id>', methods=['GET'])
@require_api_key
def get_users(current_user_id):
    # Get users with whom the current user has had conversations
    try:
        # Create a new cursor for this operation
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT u.id, u.email, MAX(dm.timestamp) as last_message
            FROM users u
            JOIN direct_messages dm ON u.id = dm.sender_id OR u.id = dm.receiver_id
            WHERE dm.sender_id = ? OR dm.receiver_id = ?
            GROUP BY u.id
            HAVING last_message IS NOT NULL
            ORDER BY last_message DESC
        ''', (current_user_id, current_user_id))
        users = cursor.fetchall()
        result = [{'id': user[0], 'email': user[1]} for user in users]
        cursor.close()
        return jsonify(result)
    except sqlite3.OperationalError as e:
        return jsonify({'error': f'Database error: {e}'}), 500

# Route to send a message
@dm_routes.route('/messages', methods=['POST'])
@require_api_key
def send_message():
    # Send an encrypted direct message to another user
    data = request.get_json()
    sender_id = data.get('sender_id')
    receiver_id = data.get('receiver_id')
    message = data.get('message')
    
    # Validate required fields
    if not sender_id or not receiver_id or not message:
        return jsonify({'error': 'All fields are required.'}), 400

    try:
        # Create a new cursor for this operation
        cursor = conn.cursor()
        
        # Encrypt the message for security
        encrypted_message = cipher_suite.encrypt(message.encode('utf-8'))

        # Store encrypted message in database
        cursor.execute('''
            INSERT INTO direct_messages (sender_id, receiver_id, message, timestamp)
            VALUES (?, ?, ?, DATETIME(CURRENT_TIMESTAMP, 'LOCALTIME'))
        ''', (sender_id, receiver_id, encrypted_message))
        conn.commit()
        message_id = cursor.lastrowid
        cursor.close()
        return jsonify({
            'id': message_id,
            'sender_id': sender_id,
            'receiver_id': receiver_id,
            'message': message,
            'timestamp': sqlite3.datetime.datetime.now().isoformat()
        }), 201
    except sqlite3.OperationalError as e:
        return jsonify({'error': f'Database error: {e}'}), 500
    
@dm_routes.route('/messages/<int:sender_id>/<int:receiver_id>', methods=['GET'])
@require_api_key
def get_messages(sender_id, receiver_id):
    # Get conversation history between two users, decrypting messages
    try:
        # Create a new cursor for this operation
        cursor = conn.cursor()
        
        # Fetch messages between the users in both directions
        cursor.execute('''
            SELECT * FROM direct_messages
            WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
            ORDER BY timestamp ASC
        ''', (sender_id, receiver_id, receiver_id, sender_id))
        messages = cursor.fetchall()
        
        # Decrypt all messages
        decrypted_messages = []
        for message in messages:
            decrypted_message = cipher_suite.decrypt(message[3]).decode('utf-8')
            decrypted_messages.append({
                'id': message[0],
                'sender_id': message[1],
                'receiver_id': message[2],
                'message': decrypted_message,
                'timestamp': message[4]
            })
        cursor.close()
        return jsonify(decrypted_messages)
    except sqlite3.OperationalError as e:
        return jsonify({'error': f'Database error: {e}'}), 500

@dm_routes.route('/experts/<string:category>', methods=['GET'])
@require_api_key
def get_expert_by_category(category):
    # Find an expert in a specific category
    try:
        # Create a new cursor for this operation
        cursor = conn.cursor()
        
        # Get random expert in the specified category
        cursor.execute('''
            SELECT id, email FROM users
            WHERE role = ?
            ORDER BY RANDOM()
            LIMIT 1
        ''', (f'expert-{category.lower()}',))
        expert = cursor.fetchone()
        
        if expert:
            result = {'id': expert[0], 'email': expert[1]}
            cursor.close()
            return jsonify(result)
        else:
            cursor.close()
            return jsonify({'error': 'No expert found for the selected category.'}), 404
    except sqlite3.OperationalError as e:
        return jsonify({'error': f'Database error: {e}'}), 500

