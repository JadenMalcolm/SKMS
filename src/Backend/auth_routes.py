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
    long = len(password) >= 8

    return has_upper and has_lower and has_digit and long

@auth_routes.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email').lower()  # Convert email to lowercase
    password = data.get('password')
    security_question = data.get('securityQuestion')
    security_question_answer = data.get('securityQuestionAnswer').replace(" ", "").lower()

    # Check if password is strong
    if not is_strong_password(password):
        return jsonify({'error': 'Password must contain at least one uppercase letter, one lowercase letter, and one digit and be longer than 8 characters'}), 400

    hashed_password = generate_password_hash(password)
    hashed_security_answer = generate_password_hash(security_question_answer)

    try:
        cursor.execute("INSERT INTO users (email, password, securityQuestion, securityQuestionAnswer) VALUES (?, ?, ?, ?)", (email, hashed_password, security_question, hashed_security_answer))
        conn.commit()
        return jsonify({'message': 'User created successfully'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already exists'}), 400

@auth_routes.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email').lower()  # Convert email to lowercase
    password = data.get('password')

    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    if user and check_password_hash(user[2], password):
        return jsonify({'message': 'Login successful', 'user': {'id': user[0], 'email': user[1], 'role': user[3]}}), 200
    return jsonify({'error': 'Invalid email or password'}), 401

@auth_routes.route('/recover', methods=['POST'])
def recover():
    data = request.get_json()
    email = data.get('email').lower()  # Convert email to lowercase

    cursor.execute("SELECT securityQuestion FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    if user:
        return jsonify({'securityQuestion': user[0]}), 200
    return jsonify({'error': 'Email not found'}), 404

@auth_routes.route('/verify_answer', methods=['POST'])
def verify_answer():
    data = request.get_json()
    email = data.get('email').lower()  # Convert email to lowercase
    security_question_answer = data.get('securityQuestionAnswer').replace(" ", "").lower()

    cursor.execute("SELECT securityQuestionAnswer FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    if user and check_password_hash(user[0], security_question_answer):
        return jsonify({'message': 'Answer is correct'}), 200
    return jsonify({'error': 'Incorrect answer'}), 401

@auth_routes.route('/reset_password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get('email').lower()  # Convert email to lowercase
    new_password = data.get('newPassword')

    if not is_strong_password(new_password):
        return jsonify({'error': 'Password must contain at least one uppercase letter, one lowercase letter, and one digit'}), 400

    cursor.execute("SELECT password FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    if user and check_password_hash(user[0], new_password):
        return jsonify({'error': 'New password must be different from the old password'}), 400

    hashed_password = generate_password_hash(new_password)

    cursor.execute("UPDATE users SET password = ? WHERE email = ?", (hashed_password, email))
    conn.commit()

    return jsonify({'message': 'Password reset successfully'}), 200