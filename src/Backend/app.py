from datetime import datetime
import sqlite3
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# Initialize SQLite database
conn = sqlite3.connect('users.db', check_same_thread=False)
cursor = conn.cursor()

# Create tables
cursor.execute('''CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
)''')

cursor.execute('''CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
)''')

# Create responses table
cursor.execute('''CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    response TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
)''')

# Create subscriptions table
cursor.execute('''CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (question_id) REFERENCES questions (id)
)''')
conn.commit()


def is_strong_password(password):
    if not password:
        return False

    has_upper = bool(re.search(r"[A-Z]", password))
    has_lower = bool(re.search(r"[a-z]", password))
    has_digit = bool(re.search(r"\d", password))

    return has_upper and has_lower and has_digit

@app.route('/signup', methods=['POST'])

def signup():
    data = request.get_json()
    email = data.get('email')
    passworder = data.get('password')

    # Check if password is strong
    if not is_strong_password(passworder):
        return jsonify({'error': 'Password must contain at least one uppercase letter, one lowercase letter, and one digit'}), 400

    hashed_password = generate_password_hash(passworder)

    try:
        cursor.execute("INSERT INTO users (email, password) VALUES (?, ?)", (email, hashed_password))
        conn.commit()
        return jsonify({'message': 'User created successfully'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already exists'}), 400

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    if user and check_password_hash(user[2], password):
        return jsonify({'message': 'Login successful', 'user': {'id': user[0], 'email': user[1]}}), 200
    return jsonify({'error': 'Invalid email or password'}), 401

@app.route('/questions', methods=['POST'])
def save_question():
    data = request.get_json()
    user_id = data.get('userId')
    question = data.get('question')
    current_timestamp = datetime.now().strftime('%Y-%m-%d %H:%M')

    if not user_id or not question:
        return jsonify({'error': 'User ID and question are required.'}), 400

    cursor.execute("INSERT INTO questions (user_id, question, timestamp) VALUES (?, ?, ?)", (user_id, question, current_timestamp))
    conn.commit()
    return jsonify({'message': 'Question saved successfully!', 'id': cursor.lastrowid}), 201

@app.route('/questions', methods=['GET'])
def get_all_questions():
    cursor.execute('''
        SELECT q.id, q.question, q.timestamp, u.email
        FROM questions q
        JOIN users u ON q.user_id = u.id
        ORDER BY q.timestamp DESC
    ''')
    questions = cursor.fetchall()
    return jsonify([
        {'id': q[0], 'question': q[1], 'timestamp': q[2], 'user_email': q[3]}
        for q in questions
    ]), 200

@app.route('/questions/<int:id>', methods=['GET', 'PUT'])
def question(id):
    if request.method == 'GET':
        cursor.execute('''
            SELECT q.question, q.timestamp, u.email
            FROM questions q
            JOIN users u ON q.user_id = u.id
            WHERE q.id = ?
        ''', (id,))
        question = cursor.fetchone()
        if question:
            return jsonify({'question': question[0], 'timestamp': question[1], 'user_email': question[2]}), 200
        return jsonify({'error': 'Question not found'}), 404

    if request.method == 'PUT':
        data = request.get_json()
        question_text = data.get('question')

        if not question_text:
            return jsonify({'error': 'Question text is required.'}), 400

        cursor.execute("UPDATE questions SET question = ? WHERE id = ?", (question_text, id))
        conn.commit()
        return jsonify({'message': 'Question updated successfully!'}), 200

@app.route('/responses', methods=['POST'])
def save_response():
    data = request.get_json()
    question_id = data.get('question_id')
    user_id = data.get('user_id')
    response = data.get('response')
    current_timestamp = datetime.now().strftime('%Y-%m-%d %H:%M')

    if not question_id or not user_id or not response:
        return jsonify({'error': 'Question ID, User ID, and response are required.'}), 400

    cursor.execute("INSERT INTO responses (question_id, user_id, response, timestamp) VALUES (?, ?, ?, ?)", (question_id, user_id, response, current_timestamp))
    conn.commit()
    return jsonify({'message': 'Response saved successfully!', 'id': cursor.lastrowid}), 201

@app.route('/responses/<int:id>', methods=['PUT'])
def update_response(id):
    data = request.get_json()
    response_text = data.get('response')

    if not response_text:
        return jsonify({'error': 'Response text is required.'}), 400

    cursor.execute("UPDATE responses SET response = ? WHERE id = ?", (response_text, id))
    conn.commit()
    return jsonify({'message': 'Response updated successfully!'}), 200

@app.route('/questions/<int:id>/responses', methods=['GET'])
def get_responses(id):
    cursor.execute('''
        SELECT r.id, r.response, r.timestamp, u.email
        FROM responses r
        JOIN users u ON r.user_id = u.id
        WHERE r.question_id = ?
        ORDER BY r.timestamp DESC
    ''', (id,))
    responses = cursor.fetchall()
    return jsonify([
        {'id': r[0], 'response': r[1], 'timestamp': r[2], 'user_email': r[3]}
        for r in responses
    ]), 200

@app.route('/subscriptions', methods=['POST'])
def subscribe_to_question():
    data = request.get_json()
    user_id = data.get('user_id')
    question_id = data.get('question_id')

    if not user_id or not question_id:
        return jsonify({'error': 'User ID and Question ID are required.'}), 400

    cursor.execute("SELECT * FROM subscriptions WHERE user_id = ? AND question_id = ?", (user_id, question_id))
    subscription = cursor.fetchone()
    if subscription:
        return jsonify({'error': 'Already subscribed to this question.'}), 400

    cursor.execute("INSERT INTO subscriptions (user_id, question_id) VALUES (?, ?)", (user_id, question_id))
    conn.commit()
    return jsonify({'message': 'Subscribed to question successfully!'}), 201

@app.route('/subscriptions', methods=['DELETE'])
def unsubscribe_from_question():
    data = request.get_json()
    user_id = data.get('user_id')
    question_id = data.get('question_id')

    if not user_id or not question_id:
        return jsonify({'error': 'User ID and Question ID are required.'}), 400

    cursor.execute("DELETE FROM subscriptions WHERE user_id = ? AND question_id = ?", (user_id, question_id))
    conn.commit()
    return jsonify({'message': 'Unsubscribed from question successfully!'}), 200

@app.route('/users/<int:user_id>/subscriptions', methods=['GET'])
def get_subscribed_questions(user_id):
    cursor.execute('''
        SELECT q.id, q.question, q.timestamp, u.email
        FROM subscriptions s
        JOIN questions q ON s.question_id = q.id
        JOIN users u ON q.user_id = u.id
        WHERE s.user_id = ?
        ORDER BY q.timestamp DESC
    ''', (user_id,))
    questions = cursor.fetchall()
    return jsonify([
        {'id': q[0], 'question': q[1], 'timestamp': q[2], 'user_email': q[3]}
        for q in questions
    ]), 200

@app.route('/subscriptions/<int:user_id>/<int:question_id>', methods=['GET'])
def check_subscription(user_id, question_id):
    cursor.execute("SELECT * FROM subscriptions WHERE user_id = ? AND question_id = ?", (user_id, question_id))
    subscription = cursor.fetchone()
    return jsonify(subscription is not None), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
