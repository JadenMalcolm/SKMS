from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import re

auth_routes = Blueprint('auth_routes', __name__)

# Initialize SQLite database
conn = sqlite3.connect('users.db', check_same_thread=False)
cursor = conn.cursor()

def is_strong_password(password):
    if not password:
        return False

    has_upper = bool(re.search(r"[A-Z]", password))
    has_lower = bool(re.search(r"[a-z]", password))
    has_digit = bool(re.search(r"\d", password))

    return has_upper and has_lower and has_digit

@auth_routes.route('/signup', methods=['POST'])
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

@auth_routes.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    if user and check_password_hash(user[2], password):
        return jsonify({'message': 'Login successful', 'user': {'id': user[0], 'email': user[1], 'role': user[3]}}), 200
    return jsonify({'error': 'Invalid email or password'}), 401